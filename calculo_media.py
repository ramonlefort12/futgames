import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

def get_best_eleven_average(country_id: str, edition: int = 2026) -> float:
    """
    Calcula la media del mejor 11 titular para una selección y edición dadas.
    """
    db_url = os.getenv("POSTGRES_URL")
    if not db_url:
        raise ValueError("La variable de entorno POSTGRES_URL no está definida.")

    # 1. Extracción de Datos (I/O)
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Obtenemos TODOS los jugadores del país ordenados por rating.
        # Usamos una subconsulta ARRAY para las posiciones secundarias, igual que en la API.
        query = """
            SELECT 
                p.id, 
                p.name, 
                p.rating, 
                p.position AS main_pos,
                ARRAY(
                    SELECT pp.position 
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

    # 2. Definición del modelo del equipo (Formación 4-3-3 Clásica)
    target_formation = ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MC', 'MC', 'MCO', 'ED', 'DC', 'EI']
    
    selected_players = set() # Set para búsqueda O(1) de IDs ya seleccionados
    team_ratings = []
    
    # 3. Algoritmo Voraz (Greedy) de Asignación
    for target_pos in target_formation:
        best_candidate = None
        
        # Iteramos sobre los jugadores (ya vienen ordenados por rating de mayor a menor)
        for p in players:
            if p['id'] in selected_players:
                continue
            
            # Verificamos si el jugador domina la posición buscada
            valid_positions = [p['main_pos']] + (p['other_pos'] if p['other_pos'] else [])
            
            if target_pos in valid_positions:
                best_candidate = p
                break # Al estar ordenados por rating, el primero que encaja es el mejor posible
                
        if best_candidate:
            selected_players.add(best_candidate['id'])
            team_ratings.append(best_candidate['rating'])
            print(f"{target_pos.ljust(4)} | {best_candidate['rating']} OVR | {best_candidate['name']}")
        else:
            print(f"⚠️ Alerta: No se encontró jugador disponible para la posición {target_pos}")

    # 4. Cálculo de la media
    if not team_ratings:
        return 0.0
        
    average = sum(team_ratings) / len(team_ratings)
    return round(average, 2)

if __name__ == "__main__":
    # Ejemplo de ejecución para España en el Mundial 2026
    country_code = 'esp'
    print(f"--- Generando mejor 11 para {country_code.upper()} (Mundial 2026) ---")
    
    media = get_best_eleven_average(country_code, 2026)
    
    print("-" * 40)
    print(f"Media del equipo titular: {media} OVR")