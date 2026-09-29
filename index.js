import { mkApp } from './src/app.js';

const cid = process.env.GOOGLE_CLIENT_ID;
const port = process.env.PORT || 3000;

if (!cid) console.warn('GOOGLE_CLIENT_ID not set - see .env.example');

mkApp({ cid }).listen(port, () => console.log(`http://localhost:${port}`));
