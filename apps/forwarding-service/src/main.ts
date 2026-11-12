import dotenv from 'dotenv';
import Server from './server/Server';
import { bootstrap } from './bootstrap';
import { getEnvironmentFilePath } from './environment';

dotenv.config({
  path: getEnvironmentFilePath(),
});

// Création du serveur et du pipeline de traitement des requêtes
const port = Number(process.env.FORWARDING_SERVICE_HTTP_PORT ?? 9006);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('FORWARDING_SERVICE_HTTP_PORT must be a valid TCP port');
}
const app = new Server(port);

// Gère la connexion aux services externes (Redis, DB)
// Gère la création du pipeline de traitement des requêtes
bootstrap(app).catch((err) => {
  console.error('[Bootstrap] failed:', err);
  process.exit(1);
});

// Démarrage du serveur HTTP
app.start();
