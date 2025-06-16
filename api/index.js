import app from '../backend/server.js';
import { createServer } from 'http';

export default async function handler(req, res) {
  const server = createServer((req, res) => app(req, res));
  server.listen();
}
