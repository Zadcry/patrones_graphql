import os
import httpx  # Cliente HTTP moderno, para llamar a PokéAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- 1. IMPORTAR ESTO
from ariadne import (
    QueryType,
    load_schema_from_path,
    make_executable_schema
)
from ariadne.asgi import GraphQL
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Configuración Inicial ---

# Cargar variables de entorno (SUPABASE_URL, SUPABASE_KEY) desde el archivo .env
load_dotenv()

# Cargar la definición del esquema de GraphQL desde el archivo
type_defs = load_schema_from_path("./schema.graphql")

# Inicializar cliente de Supabase
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("Error: Variables de entorno SUPABASE_URL y SUPABASE_KEY no están definidas.")
    # En un caso real, querrías manejar esto de forma más robusta
    supabase = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)

# Crear instancia de QueryType para vincular resolvers
query = QueryType()

# --- Resolvers de GraphQL ---
# (Estos no cambian, se mantienen igual)

@query.field("pokemon")
def resolve_pokemon(obj, info, id):
    """Resuelve el query 'pokemon(id: ID!)'."""
    try:
        api_url = f"https://pokeapi.co/api/v2/pokemon/{id}"
        response = httpx.get(api_url)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        print(f"Error al llamar a PokéAPI: {e}")
        return None
    except Exception as e:
        print(f"Error inesperado: {e}")
        return None

@query.field("students")
def resolve_students(obj, info):
    """Resuelve el query 'students'."""
    if not supabase:
        print("Error: Cliente de Supabase no inicializado.")
        return []
    try:
        response = supabase.table('students').select('*').execute()
        return response.data
    except Exception as e:
        print(f"Error al consultar Supabase: {e}")
        return []

# --- Creación de la App ---

# Crear el esquema ejecutable de Ariadne
schema = make_executable_schema(type_defs, query)

# Crear la aplicación ASGI de GraphQL
graphql_app = GraphQL(schema, debug=True)

# Crear la aplicación FastAPI
app = FastAPI()

# --- 2. CONFIGURACIÓN DE CORS (LA SOLUCIÓN) ---
#    Define los orígenes que tienen permiso para conectarse.
allowed_origin = os.environ.get("FRONTEND_URL", "http://localhost:3000")

origins = [
    allowed_origin,
]

#    Añade el middleware a la aplicación FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Permite los orígenes en la lista 'origins'
    allow_credentials=True,      # Permite credenciales (cookies, etc.)
    allow_methods=["*"],         # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],         # Permite todas las cabeceras
)
# --- Fin de la configuración de CORS ---

app.mount("/", graphql_app)
