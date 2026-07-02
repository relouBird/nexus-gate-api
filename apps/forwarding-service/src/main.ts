import dotenv from 'dotenv';
import Server from './server/ServerT';

dotenv.config();
const PORT = Number(process.env.PORT ?? 9006);
const app = new Server(PORT);

app.any('/*', (res, req) => {
  console.log('');
  console.log('Method :', req.getMethod());
  console.log('Url    :', req.getUrl());
  console.log('Query  :', req.getQuery(),);

  req.forEach((key, value) => {
    console.log(`${key}: ${value}`);
  });

  res.cork(() => {
    res.writeStatus('200 OK');
    res.writeHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        method: req.getMethod(),
        url: req.getUrl(),
        query: req.getQuery(),
      }),
    );
  });
});

app.start();
