import dotenv from 'dotenv';
import Server from './server/Server';
import { bootstrap } from './bootstrap';

// charge explicitement le .env du service
dotenv.config({
  path: 'apps/forwarding-service/.env',
  override: true,
});

// Création du serveur et du pipeline de traitement des requêtes
const PORT = Number(process.env.PORT ?? 9006);
const app = new Server(PORT);

// Gère la connexion aux services externes (Redis, DB)
// Gère la création du pipeline de traitement des requêtes
bootstrap(app).catch((err) => {
  console.error('[Bootstrap] failed:', err);
  process.exit(1);
});

// Démarrage du serveur HTTP
app.start();
