import { getChromaClient } from "./chroma";
import { getEmbeddings } from "./embeddings";
import { FILE_KEY_SEPARATOR } from "./utils";

// TODO query collection https://docs.trychroma.com/usage-guide?lang=js
export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    // const client = new Pinecone({
    //   environment: process.env.PINECONE_ENVIRONMENT!,
    //   apiKey: process.env.PINECONE_API_KEY!,
    // });
    // const pineconeIndex = await client.index("chatpdf");
    // const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    // const queryResult = await namespace.query({
    //   topK: 5,
    //   vector: embeddings,
    //   includeMetadata: true,
    // });
    // return queryResult.matches || [];

    // TODO crea una collection name anche se non viene da NUTPROJECT ! (standalone)
    const collectionName = fileKey.split(FILE_KEY_SEPARATOR)[1];

    const client = getChromaClient();
    let collection = await client.getCollection({
      name: collectionName,
    });

    const queryResult = await collection.query({
      queryEmbeddings: embeddings,
      nResults: 5,
    });

    return queryResult || null;
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  // console.log("🚀 ~ file: context.ts:43 ~ getContext ~ query:", query)
  // console.log("🚀 ~ file: context.ts:43 ~ getContext ~ queryEmbeddings:", queryEmbeddings)
  const response = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  // console.log("🚀 ~ file: context.ts:45 ~ getContext ~ response:", response);
  if (!response) return "";
  // const qualifyingDocs = response.filter(
  //   (match) => match.score && match.score > 0.7
  // );

  // type Metadata = {
  //   text: string;
  //   pageNumber: number;
  // };

  // let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  // // 5 vectors
  // return docs.join("\n").substring(0, 3000);
  return response.documents.flat().join("\n").substring(0, 3000);
}
