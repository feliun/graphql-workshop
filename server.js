const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 8080;
const app = express();

app.use(
  '/test',
  cors(),
  (req, res) => res.json({ ok: true })
);

const listen = () => {
  app.listen(port);
  console.log(`Express app started on port ${port}`);
}

listen();