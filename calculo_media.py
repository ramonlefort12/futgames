import os
import urllib.parse
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

def get_db_connection():
    """
    Establece y devuelve una única conexión segura a la base de datos.
    """
    db_url = os.getenv("POSTGRES_URL_NON_POOLING") or os.getenv("POSTGRES_URL")
    if not db_url:
        raise ValueError("La variable de entorno POSTGRES_URL no está definida.")

    result = urllib.parse.urlparse(db_url)
    
    return psycopg2.connect(
        database=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port,
        sslmode='require'
    )

def get_best_eleven_average(cursor, country_id: str, edition: int = 2026, verbose: bool = False) -> float:
    """
    Calcula la media del mejor 11 titular utilizando un cursor ya abierto.
    """
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

    target_formation = ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MC', 'MC', 'MCO', 'ED', 'DC', 'EI']
    
    selected_players = set() 
    team_ratings = []
    
    # Algoritmo Voraz (Greedy)
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
            if verbose:
                print(f"  {target_pos.ljust(4)} | {best_candidate['rating']} OVR | {best_candidate['name']}")
        else:
            if verbose:
                print(f"  ⚠️ Alerta: No se encontró jugador disponible para {target_pos}")

    if not team_ratings:
        return 0.0
        
    average = sum(team_ratings) / len(team_ratings)
    return round(average, 2)


if __name__ == "__main__":
    print("Conectando a la base de datos...")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 1. Extraemos todas las selecciones disponibles en la tabla countries
        cursor.execute("SELECT id, name FROM countries ORDER BY name ASC;")
        countries = cursor.fetchall()
        
        print(f"--- Evaluando {len(countries)} selecciones para el Mundial 2026 ---\n")
        
        ranking = []
        
        # 2. Iteramos sobre cada selección reutilizando la conexión
        for country in countries:
            media = get_best_eleven_average(cursor, country['id'], 2026, verbose=False)
            
            # Solo añadimos al ranking los países que tengan suficientes jugadores para hacer media
            if media > 0.0:
                ranking.append({
                    'name': country['name'],
                    'media': media
                })
                
        # 3. Ordenamos la lista resultante de mayor a menor media
        ranking.sort(key=lambda x: x['media'], reverse=True)
        
        # 4. Imprimimos el resultado como un Leaderboard analítico
        print("🏆 RANKING DE MEDIAS TITULARES (XI IDEAL) 🏆")
        print("=" * 45)
        for index, team in enumerate(ranking, start=1):
            print(f"{index:2d}. {team['name'].ljust(25)} | {team['media']} OVR")
        print("=" * 45)
            
    except psycopg2.Error as e:
        print(f"Error de ejecución SQL: {e}")
    except Exception as ex:
        print(f"Error de sistema: {ex}")
    finally:
        # 5. Cierre seguro de I/O
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
        print("\nConexión cerrada exitosamente.")