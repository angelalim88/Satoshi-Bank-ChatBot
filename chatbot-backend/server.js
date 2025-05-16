const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Sync database dan jalankan server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Error syncing database:', err);
});