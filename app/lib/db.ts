// app/lib/db.ts
import 'server-only';
import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL no está definida en las variables de entorno.');
}

// Ampliamos la interfaz global de TypeScript para que reconozca la propiedad 'sql'
declare global {
  var sql: ReturnType<typeof postgres> | undefined;
}

// Implementación del patrón Singleton
const sql = globalThis.sql || postgres(connectionString, {
  max: 10, // Límite de conexiones simultáneas por instancia
  idle_timeout: 20, // Cierra conexiones inactivas tras 20s
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.sql = sql;
}

export default sql;