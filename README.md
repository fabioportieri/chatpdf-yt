![Build and Deploy Full Stack ChatPDF Clone](https://github.com/Elliott-Chong/chatpdf-yt/assets/77007117/7fcee290-ca52-46ee-ae82-3490f505270b)

[Link to YouTube Tutorial](https://www.youtube.com/watch?v=bZFedu-0emE)

neon database, con account google

https://console.neon.tech/app/projects/polished-truth-71933130

// jdbc:postgresql://ep-holy-night-84572506-pooler.eu-central-1.aws.neon.tech/neondb?user=fazfazzi&password=N7ErAT9jPQvx
NUTPROJECT_ACCESS_TOKEN_PLAIN=AccessTokenNut-Project83482-1
NUTPROJECT_ACCESS_TOKEN_SECRET=r3Ej7dJ3SJ0ugQ45

<!-- PGHOST='ep-holy-night-84572506-pooler.eu-central-1.aws.neon.tech'
PGDATABASE='neondb'
PGUSER='fazfazzi'
PGPASSWORD='N7ErAT9jPQvx' -->

<!-- // .env
DATABASE_URL=postgres://fazfazzi:N7ErAT9jPQvx@ep-holy-night-84572506-pooler.eu-central-1.aws.neon.tech/neondb?pgbouncer=true&connect_timeout=10
DIRECT_URL=postgres://fazfazzi:N7ErAT9jPQvx@ep-holy-night-84572506.eu-central-1.aws.neon.tech/neondb?connect_timeout=10
# SHADOW_DATABASE_URL=...

// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url  	= env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  // If you want to use Prisma Migrate, you will need to manually create a shadow database
  // https://neon.tech/docs/guides/prisma-migrate#configure-a-shadow-database-for-prisma-migrate
  // make sure to append ?connect_timeout=10 to the connection string
  // shadowDatabaseUrl = env(“SHADOW_DATABASE_URL”)
} -->

creato bucket s3 e access token, pinecode, clerk
pinecode host: https://chatpdf-59bcc79.svc.gcp-starter.pinecone.io

// npx drizzle-kit generate:pg --config=drizzle.config.ts
npx drizzle-kit push:pg

errore:

PineconeBadRequestError: The requested feature 'Namespaces' is not supported by the current index type 'Starter'.

pinecone 70 euro al mese.. fai switch su chroma https://github.com/chroma-core/chroma

<!-- https://github.com/chroma-core/chroma/blob/main/examples/chat_with_your_documents/main.py
 https://docs.trychroma.com/usage-guide?lang=js -->

TODO in chroma.ts aggiungi documents alla collection
TODO in context.ts query collection

The length of the name must be between 3 and 63 characters.
The name must start and end with a lowercase letter or a digit, and it can contain dots, dashes, and underscores in between.
The name must not contain two consecutive dots.
The name must not be a valid IP address.

TODO dove setto il persist directory?? DEVO lanciare un chroma backend server con docker
e poi lanciarlo con chroma run --path /db_path

aggiorno langchain da "langchain": "^0.0.150", a "langchain": "^0.0.165",

https://stackoverflow.com/questions/76749728/how-chromadb-querying-system-works
https://github.com/langchain-ai/langchain/issues/6046

docker pull chromadb/chroma
docker run -p 8000:8000 chromadb/chroma

https://github.com/chroma-core/chroma/blob/main/README.md

persist directory: /chroma/chroma dentro il container docker

git clone https://github.com/Pawandeep-prog/chroma-peek.git
pip install -r requirements.txt
streamlit run chroma-peek/main.py

dockerizza chromadb e chroma-peek dentro docker compose

./node_modules/pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js:17378:9
Module not found: Can't resolve 'fs'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./node_modules/langchain/dist/document_loaders/fs/pdf.js
./node_modules/langchain/document_loaders/fs/pdf.js

https://stackoverflow.com/questions/76353315/how-to-fix-fs-module-not-found-error-when-using-langchain-document-loaders-in

il problema era l'edge runtime:
// export const runtime = "edge";
su chat/route.ts, che a sua volta chiama il chroma.ts, pero' togliendolo ho errori strani:



TODO nut-fe, mettere progress, e non mi ha fatto il polling da linux dopo il caricamento del file