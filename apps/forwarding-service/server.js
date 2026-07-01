/* Minimal SSL/non-SSL example */
const uWS = require('uWebSockets.js');
const PORT = 9006;

const app = uWS.App();

app.any('/*', (res, req) => {
  console.log('================================');
  console.log('Method :', req.getMethod());
  console.log('Url    :', req.getUrl());
  console.log('Query  :', req.getQuery());

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

app.listen(PORT, (token) => {
  if (!token) {
    console.log('Cannot listen');
    return;
  }

  console.log(`Listening on http://localhost:${PORT}`);
});
