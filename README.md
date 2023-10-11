![Build and Deploy Full Stack ChatPDF Clone](https://github.com/Elliott-Chong/chatpdf-yt/assets/77007117/7fcee290-ca52-46ee-ae82-3490f505270b)

[Link to YouTube Tutorial](https://www.youtube.com/watch?v=bZFedu-0emE)


neon database, con account google

https://console.neon.tech/app/projects/polished-truth-71933130

// jdbc:postgresql://ep-holy-night-84572506-pooler.eu-central-1.aws.neon.tech/neondb?user=fazfazzi&password=N7ErAT9jPQvx
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

uploads/1697011275306CV__Portieri_Fabio.pdf CV__Portieri_Fabio.pdf
downloading s3 into file system
NoSuchKey: The specified key does not exist.
    at de_NoSuchKeyRes (/home/fabio/workspace/chatpdf-yt/node_modules/@aws-sdk/client-s3/dist-cjs/protocols/Aws_restXml.js:6082:23)
    at de_GetObjectCommandError (/home/fabio/workspace/chatpdf-yt/node_modules/@aws-sdk/client-s3/dist-cjs/protocols/Aws_restXml.js:4327:25)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async /home/fabio/workspace/chatpdf-yt/node_modules/@smithy/middleware-serde/dist-cjs/deserializerMiddleware.js:7:24
    at async /home/fabio/workspace/chatpdf-yt/node_modules/@aws-sdk/middleware-signing/dist-cjs/awsAuthMiddleware.js:14:20
    at async /home/fabio/workspace/chatpdf-yt/node_modules/@smithy/middleware-retry/dist-cjs/retryMiddleware.js:27:46
    at async /home/fabio/workspace/chatpdf-yt/node_modules/@aws-sdk/middleware-flexible-checksums/dist-cjs/flexibleChecksumsMiddleware.js:57:20
    at async /home/fabio/workspace/chatpdf-yt/node_modules/@aws-sdk/middleware-logger/dist-cjs/loggerMiddleware.js:7:26
    at async eval (webpack-internal:///(rsc)/./src/lib/s3-server.ts:25:25) {
  '$fault': 'client',
  '$metadata': {
    httpStatusCode: 404,
    requestId: '8VY3Y1R9HEEDFPR1',
    extendedRequestId: 'll4I5gE0P0JwxgRjUqnLylRwNuDQOGPq20m4btZP4n1RvAIbHnaRcVFikg221Estq8SOaGdbK+U=',
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0
  },
  Code: 'NoSuchKey',
  Key: 'uploads/1697011275306CV__Portieri_Fabio.pdf',
  RequestId: '8VY3Y1R9HEEDFPR1',
  HostId: 'll4I5gE0P0JwxgRjUqnLylRwNuDQOGPq20m4btZP4n1RvAIbHnaRcVFikg221Estq8SOaGdbK+U='
}
NoSuchKey: The specified key does not exist.

infatti nel bucket non ha mai fatto l'upload..

    "@aws-sdk/client-s3": "^3.414.0",

    Module not found: Can't resolve '@aws-sdk/signature-v4-crt' in '/home/fabio/workspace/chatpdf-yt/node_modules/@aws-sdk/signature-v4-multi-region/dist-cjs'