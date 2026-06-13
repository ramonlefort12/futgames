import postgres from 'postgres';

// Usamos POSTGRES_URL que es el estándar proporcionado por Neon
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL no está definida en las variables de entorno.');
}

// Implementación del patrón Singleton para evitar agotar el pool de conexiones 
// durante el Hot Module Replacement (HMR) en desarrollo.
const sql = globalThis.sql || postgres(connectionString, {
  max: 10, // Límite de conexiones simultáneas por instancia
  idle_timeout: 20, // Cierra conexiones inactivas tras 20s para liberar recursos en Neon
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.sql = sql;
}

export default sql;