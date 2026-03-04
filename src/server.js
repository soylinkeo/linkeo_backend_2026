/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDb } = require('./utils/db');

const profileRoutes = require('./routes/profileRoutes');
const authRoutes = require('./routes/authRoutes'); // 👈 añade esto
const { notFound, errorHandler } = require('./utils/errorHandler');

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(cors());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);       // 👈 monta auth primero si quieres
app.use('/api/profiles', profileRoutes);

app.use(notFound);
app.use(errorHandler);

// const PORT = process.env.PORT || 4000;
// connectDb().then(() => {
//   app.listen(PORT, () => console.log(`[server] running on http://localhost:${PORT}`));
// }).catch((err) => {
//   console.error('[server] DB connection failed', err);
//   process.exit(1);
// });
const PORT = process.env.PORT || 4000;

connectDb()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`[server] running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("[server] DB connection failed", err);
    process.exit(1);
  });