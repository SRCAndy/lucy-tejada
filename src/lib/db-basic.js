require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    const res = await client.query('SELECT NOW()');
    console.log('Fecha actual en BD:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
}

if (require.main === module) {
  testConnection();
}

module.exports = client;
