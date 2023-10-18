// import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import * as chromadb from "chromadb";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
// import {
//   Document,
//   RecursiveCharacterTextSplitter,
// } from "@pinecone-database/doc-splitter";

import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { getEmbeddings } from "./embeddings";
import { FILE_KEY_SEPARATOR, convertToAscii } from "./utils";
import { downloadFromMinio } from "./minio-server";

export const getChromaClient = () => {
  // return new chromadb.ChromaClient({
  //   path: process.env.NEXT_BASE_URL
  // });
  return new chromadb.ChromaClient();
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadMinioIntoChromaDB(fileKey: string) {
  // 1. obtain the pdf -> downlaod and read from pdf
  console.log("downloading minio into file system");
  const file_name = await downloadFromMinio(fileKey);
  if (!file_name) {
    throw new Error("could not download from minio");
  }
  console.log("loading pdf into memory" + file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  const vectorsWrapper = [];
  for (const [index, document] of documents.flat().entries()) {
    try {
      const result = await embedDocument(document);
      if (result) vectorsWrapper.push(result);
    } catch (error) {
      console.error(`Error embedding document: ${(error as Error).message}`);
      throw new Error(`could not embed documents, failed at ${index} entry`);
    }
  }

  // TODO crea una collection name anche se non viene da NUTPROJECT ! (standalone)
  // 4. upload to chromadb
  const client = getChromaClient();
  const collectionName = fileKey.split(FILE_KEY_SEPARATOR)[1];
  console.log(
    "🚀 ~ file: chroma.ts:60 ~ looking for collection:",
    collectionName
  );

  try {
    let collFound = await client.getCollection({ name: collectionName });
    if (collFound) await client.deleteCollection({ name: collectionName });
  } catch (error) {
    console.log("collection does not exists, no need to delete it");
  }

  // create collection https://docs.trychroma.com/usage-guide?lang=js

  let collection = await client.createCollection({
    name: collectionName,
    metadata: { "hnsw:space": "cosine" },
  });
  console.log(
    "🚀 loadS3IntoChromaDB ~ collection:",
    collection,
    " with name ",
    convertToAscii(fileKey)
  );

  // TODO add
  await collection.add({
    // ids: ["id1", "id2", "id3", ...],
    // embeddings: [[1.1, 2.3, 3.2], [4.5, 6.9, 4.4], [1.1, 2.3, 3.2], ...],
    // metadatas: [{"chapter": "3", "verse": "16"}, {"chapter": "3", "verse": "5"}, {"chapter": "29", "verse": "11"}, ...],
    ids: vectorsWrapper.map((vector) => vector.id),
    embeddings: vectorsWrapper.map((vector) => vector.embeddings),
    metadatas: vectorsWrapper.map((vector) => vector.metadata),
    documents: documents.flat().map((doc) => doc.pageContent),
  });

  console.log("collection added embeddings: ", documents);
  return documents[0];
}

async function embedDocument(doc: Document) {
  let embeddings;
  try {
    embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as ChromaDBRecord;
  } catch (error) {
    // embeddings undefined?
    // console.log("error embedding document, document: ", doc);
    // console.log("error embedding document, doc.pageContent: ", doc.pageContent);
    console.log("error embedding document, error: ", error);
    return null;
    // throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage): Promise<Document[]> {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}

export interface ChromaDBRecord {
  id: string;
  embeddings: number[];
  metadata: any;
}
