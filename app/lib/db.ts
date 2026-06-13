// app/lib/db.ts
import 'server-only';
import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL no está definida en las variables de entorno.');
}

declare global {
  // eslint-disable-next-line no-var
  var sql: postgres.Sql | undefined;
}

// Aquí está el cambio: definimos explícitamente el tipo de la constante
const sql: postgres.Sql = globalThis.sql || postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.sql = sql;
}

export default sql;