neon database, con account google

https://console.neon.tech/app/projects/polished-truth-71933130

https://stackoverflow.com/questions/76749728/how-chromadb-querying-system-works
https://github.com/langchain-ai/langchain/issues/6046

docker pull chromadb/chroma
docker run -p 8000:8000 chromadb/chroma

https://github.com/chroma-core/chroma/blob/main/README.md

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

tool per risolvere dip. circolari:
dpdm src/lib/minio-upload.ts

TODO importante invece di cancellare collection se gia esiste recupera e risparmia non mettendo nuovamente gli embeddings!
