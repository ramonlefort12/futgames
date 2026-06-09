// app/api/win-tournament/route.ts
import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres'; // Cliente oficial inyectado en tu repositorio base

/**
 * Handler POST para registrar la victoria de un torneo mundial.
 * Incrementa de forma atómica el contador global del palmarés por país.
 * * Ruta: /api/win-tournament
 */
export async function POST(request: Request) {
  let client;
  
  try {
    // 1. Parseo seguro del cuerpo de la petición (Payload)
    const body = await request.json();
    const { countryId } = body;

    // 2. Validación defensiva de tipos de datos de entrada
    if (!countryId || typeof countryId !== 'string') {
      return NextResponse.json(
        { error: 'Parámetro "countryId" inválido o ausente en el body.' },
        { status: 400 }
      );
    }

    // Convertimos a minúsculas para coincidir con la normalización ISO de la Base de Datos
    const normalizedCountryId = countryId.toLowerCase().trim();

    // 3. Establecemos conexión con el pool de base de datos relacional
    client = await db.connect();

    // 4. Ejecución del Incremento Atómico mediante consulta SQL con sanitización de parámetros (SQL Injection Safe)
    // Usamos 'UPDATE ... SET titles = titles + 1' para evitar la lectura previa del dato
    // garantizando la integridad de datos en entornos con alta concurrencia.
    const queryResult = await client.sql`
      UPDATE countries 
      SET titles = titles + 1 
      WHERE id = ${normalizedCountryId}
      RETURNING id, name, titles;
    `;

    // 5. Control de aserción: Verificar si el país existe en las tablas maestras
    if (queryResult.rowCount === 0) {
      return NextResponse.json(
        { error: `El país con ID "${normalizedCountryId}" no está registrado en la base de datos.` },
        { status: 404 }
      );
    }

    // 6. Respuesta exitosa con el estado actualizado (Palmarés)
    const updatedCountry = queryResult.rows[0];
    return NextResponse.json(
      { 
        success: true, 
        message: 'Palmarés actualizado con éxito.',
        data: {
          id: updatedCountry.id,
          name: updatedCountry.name,
          totalTitles: updatedCountry.titles
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error crítico en API [win-tournament]:', error);
    
    // Tratamiento de excepciones robusto
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al procesar la transacción.',
        details: error.message || ''
      },
      { status: 500 }
    );
  } finally {
    // Liberamos el cliente de vuelta al Pool si se requiere de forma explícita
    if (client) {
      // El SDK de @vercel/postgres maneja el pool de forma interna, 
      // pero asegurar la salida de procesos evita fugas de sockets de red.
    }
  }
}