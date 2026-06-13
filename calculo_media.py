import os
import urllib.parse
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

def get_best_eleven_average(country_id: str, edition: int = 2026) -> float:
    """
    Calcula la media del mejor 11 titular para una selección y edición dadas.
    """
    # 1. Recuperamos la URL (Priorizamos la URL directa sin pooler si existe)
    db_url = os.getenv("POSTGRES_URL_NON_POOLING") or os.getenv("POSTGRES_URL")
    
    if not db_url:
        raise ValueError("La variable de entorno POSTGRES_URL no está definida.")

    # 2. Disección Segura de URI (Resolución del error DSN)
    # Esto aísla los componentes de red ignorando los parámetros conflictivos como "?supa="
    result = urllib.parse.urlparse(db_url)
    username = result.username
    password = result.password
    database = result.path[1:] # Se omite el '/' inicial
    hostname = result.hostname
    port = result.port

    # 3. Extracción de Datos (I/O)
    try:
        # Conexión paramétrica explícita con cifrado forzado
        conn = psycopg2.connect(
            database=database,
            user=username,
            password=password,
            host=hostname,
            port=port,
            sslmode='require' # Obligatorio para conexiones remotas a Neon/Supabase
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT 
                p.id, 
                p.name, 
                p.rating, 
                p.primary_position AS main_pos,
                ARRAY(
                    SELECT pp.position_code 
                    FROM player_positions pp 
                    WHERE pp.player_id = p.id
                ) AS other_pos
            FROM players p
            WHERE p.country_id = %s AND p.world_cup_edition = %s
            ORDER BY p.rating DESC;
        """
        cursor.execute(query, (country_id, edition))
        players = cursor.fetchall()
        
    except psycopg2.Error as e:
        print(f"Error de base de datos: {e}")
        return 0.0
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

    # 4. Definición del modelo del equipo (Formación 4-3-3 Clásica)
    target_formation = ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MC', 'MC', 'MCO', 'ED', 'DC', 'EI']
    
    selected_players = set() 
    team_ratings = []
    
    # 5. Algoritmo Voraz (Greedy) de Asignación O(N * M)
    for target_pos in target_formation:
        best_candidate = None
        
        for p in players:
            if p['id'] in selected_players:
                continue
            
            valid_positions = [p['main_pos']] + (p['other_pos'] if p['other_pos'] else [])
            
            if target_pos in valid_positions:
                best_candidate = p
                break 
                
        if best_candidate:
            selected_players.add(best_candidate['id'])
            team_ratings.append(best_candidate['rating'])
            print(f"{target_pos.ljust(4)} | {best_candidate['rating']} OVR | {best_candidate['name']}")
        else:
            print(f"⚠️ Alerta: No se encontró jugador disponible para la posición {target_pos}")

    # 6. Cálculo de la media
    if not team_ratings:
        return 0.0
        
    average = sum(team_ratings) / len(team_ratings)
    return round(average, 2)

if __name__ == "__main__":
    country_code = 'esp'
    print(f"--- Generando mejor 11 para {country_code.upper()} (Mundial 2026) ---")
    
    media = get_best_eleven_average(country_code, 2026)
    
    print("-" * 40)
    print(f"Media del equipo titular: {media} OVR")