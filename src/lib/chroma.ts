// import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import * as chromadb from "chromadb";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
// import {
//   Document,
//   RecursiveCharacterTextSplitter,
// } from "@pinecone-database/doc-splitter";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

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

export async function loadS3IntoChromaDB(fileKey: string) {
  // 1. obtain the pdf -> downlaod and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  console.log("loading pdf into memory" + file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  const vectorsWrapper = await Promise.all(documents.flat().map(embedDocument));

  // 4. upload to chromadb
  const client = getChromaClient();

  // const pineconeIndex = await client.index("chatpdf");
  // const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
  // console.log("inserting vectors into pinecone");
  // await namespace.upsert(vectors);
  // TODO create collection https://docs.trychroma.com/usage-guide?lang=js

  let collection = await client.createCollection({
    name: 'ciccio3',
    metadata: { "hnsw:space": "cosine" },
  });
  console.log("🚀 loadS3IntoChromaDB ~ collection:", collection, " with name ", convertToAscii(fileKey));

  // TODO add
  await collection.add({
    // ids: ["id1", "id2", "id3", ...],
    // embeddings: [[1.1, 2.3, 3.2], [4.5, 6.9, 4.4], [1.1, 2.3, 3.2], ...],
    // metadatas: [{"chapter": "3", "verse": "16"}, {"chapter": "3", "verse": "5"}, {"chapter": "29", "verse": "11"}, ...],
    ids: vectorsWrapper.map(vector => vector.id),
    embeddings: vectorsWrapper.map(vector => vector.embeddings),
    metadatas: vectorsWrapper.map(vector => vector.metadata),
    documents: documents.flat().map(doc => doc.pageContent)
  })


  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
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
    console.log("error embedding document", error);
    throw error;
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
  metadata: any
}