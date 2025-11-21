import os
import uuid
import json
import re
import argparse
from pathlib import Path
try:
    from dotenv import load_dotenv
except Exception:
    # Si python-dotenv no está instalado, se usa una función vacía para que el modo dry-run funcione
    def load_dotenv(*args, **kwargs):
        return

# --- Carga de Documentos (PDF) ---
# Necesitarás: pip install langchain-community pypdf
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Conexión a Azure ---
# Necesitarás: pip install azure-search-documents azure-core
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

# ==========================================
# 1. CONFIGURACIÓN DE FILTRADO Y LIMPIEZA
# ==========================================

# ==========================================
# LISTAS ACTUALIZADAS SEGÚN TU JSON
# ==========================================

# 1. Si el chunk contiene esto, LO BORRAMOS ENTERO.
# (El objetivo es borrar la paja legal y administrativa)
PALABRAS_ELIMINAR_CHUNK = [
    # Legal / Administrativo (Lo que más abunda en tu JSON)
    "Visto el Expediente",
    "Visto, el Expediente",
    "CONSIDERANDO:",
    "Que, el artículo",
    "Que, los numerales",
    "Decreto Legislativo N",
    "Resolución Ministerial",
    "Regístrese, comuníquese",
    "SE RESUELVE:",
    "ARTÍCULO 1.-",
    "ARTÍCULO 2.-",
    "ARTÍCULO 3.-",
    "Con el visado del",
    "Estando a lo propuesto",
    "De conformidad con lo dispuesto",
    "Secretaría General la publicación",
    "Dirección General de Intervenciones Estratégicas",
    
    # Créditos y Listas de Personas
    "EQUIPO TÉCNICO", 
    "AGRADECIMIENTOS", 
    "PARTICIPARON EN LA REVISIÓN",
    "Catalogación hecha por",
    "Hecho el Depósito Legal",
    "Impreso por:",
    "Tiraje:",
    "ISBN:",
    
    # Bibliografía (No sirve para la respuesta conversacional)
    "BIBLIOGRAFÍA",
    "REFERENCIAS BIBLIOGRÁFICAS"
]

# 2. Si el texto contiene esto, BORRAMOS SOLO ESE PEDAZO.
# (Para limpiar encabezados, pies de página y los artefactos )
PATRONES_LIMPIEZA_TEXTO = [
    # Encabezados repetitivos que vi en tu JSON
    r"MINISTERIO DE SALUD",
    r"INSTITUTO NACIONAL DE SALUD",
    r"CENTRO NACIONAL DE ALIMENTACIÓN Y NUTRICIÓN",
    r"NORMA TÉCNICA - MANEJO TERAPÉUTICO.*",
    r"GUÍA TÉCNICA PARA LA VALORACIÓN NUTRICIONAL.*",
    r"GUÍAS ALIMENTARIAS PARA NIÑAS Y NIÑOS.*",
    
    # Artefactos de escaneo/conversión que aparecen en tu JSON
    r"\\",  # Esto eliminará todos los 
    r"--- PAGE \d+ ---", # Esto eliminará los marcadores de página
    
    # Códigos y URLs
    r"NTS N° \d+-MINSA/.*", 
    r"www\.ins\.gob\.pe",
    r"www\.minsa\.gob\.pe",
    
    # Números de página sueltos
    r"^\d+$" 
]

# Umbral mínimo de caracteres para que un chunk sea útil
MIN_CHUNK_CHARS = 50

# ==========================================
# 2. FUNCIONES AUXILIARES
# ==========================================

def get_search_client():
    """
    Se conecta y autentica con el servicio Azure AI Search.
    (Solo se usa en el modo REAL)
    """
    load_dotenv()
    
    service_name = os.environ["AZURE_SEARCH_SERVICE_NAME"]
    index_name = os.environ["AZURE_SEARCH_INDEX_NAME"]
    api_key = os.environ["AZURE_SEARCH_API_KEY"]
    
    endpoint = f"https://{service_name}.search.windows.net/"
    credential = AzureKeyCredential(api_key)
    
    print(f"Conectando a: {endpoint} (Índice: {index_name})")
    
    search_client = SearchClient(
        endpoint=endpoint,
        index_name=index_name,
        credential=credential
    )
    return search_client

def clean_chunk_content(text):
    text_clean = text
    for patron in PATRONES_LIMPIEZA_TEXTO:
        # Reemplaza el patrón por espacio vacío
        text_clean = re.sub(patron, "", text_clean, flags=re.IGNORECASE | re.MULTILINE)
    
    # Limpieza final de espacios extra
    text_clean = re.sub(r"\s+", " ", text_clean).strip()
    return text_clean

def load_and_split_pdfs(data_folder: Path):
    """
    Carga todos los PDFs de la carpeta /data y los divide en trozos limpios.
    """
    print(f"Cargando PDFs desde: {data_folder}...")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # Tamaño ajustado para capturar párrafos completos
        chunk_overlap=200   # Solapamiento para mantener contexto
    )
    
    all_chunks = []
    
    # Convertimos la lista de palabras prohibidas a minúsculas para comparar más rápido
    palabras_eliminar_lower = [p.lower() for p in PALABRAS_ELIMINAR_CHUNK]
    
    for pdf_path in data_folder.glob("*.pdf"):
        print(f"\nProcesando: {pdf_path.name}...")
        
        loader = PyPDFLoader(str(pdf_path))
        documents = loader.load()
        chunks = text_splitter.split_documents(documents)

        print(f"  > Se dividió en {len(chunks)} trozos. Aplicando filtros inteligentes...")

        chunks_filtrados = 0
        kept = 0
        
        for i, chunk in enumerate(chunks):
            content = (chunk.page_content or "").strip()
            
            # 1. LIMPIEZA DE TEXTO (Quitar encabezados repetitivos)
            content_clean = clean_chunk_content(content)
            content_lower = content_clean.lower()

            # Si tras limpiar queda vacío o muy corto, descartar
            if len(content_clean) < MIN_CHUNK_CHARS:
                chunks_filtrados += 1
                continue

            # 2. FILTRO DE ELIMINACIÓN TOTAL (Contenido administrativo/social)
            if any(bad_word in content_lower for bad_word in palabras_eliminar_lower):
                chunks_filtrados += 1
                continue

            # 3. PROTECCIÓN DE TABLAS DE DOSIFICACIÓN
            # Detectamos si el texto parece ser una tabla médica importante
            is_table_context = any(x in content_lower for x in ["tabla", "cuadro", "dosis", "mg/kg", "mg/dia", "suplementación"])
            
            # Análisis de calidad del texto (ratio alfabético)
            alpha_chars = sum(1 for ch in content_clean if ch.isalpha())
            total_chars = len(content_clean)
            alpha_ratio = alpha_chars / total_chars if total_chars > 0 else 0
            
            # Lógica de decisión:
            # Si NO parece una tabla médica Y tiene muy poco texto alfabético (ej. basura de escaneo), se borra.
            # Si ES una tabla (ej. dosis de hierro), permitimos más números/símbolos (alpha_ratio más bajo).
            if not is_table_context and alpha_ratio < 0.40:
                chunks_filtrados += 1
                continue
            
            # Intento de obtener número de página
            page_number = chunk.metadata.get("page", 0) + 1 # PyPDF empieza en 0

            # Crear el documento limpio para Azure
            azure_doc = {
                "id": str(uuid.uuid4()),
                "content": content_clean,
                "title": pdf_path.name,
                "page": page_number,
                "chunk_index": i,
                "tags": [pdf_path.name]
            }
            all_chunks.append(azure_doc)
            kept += 1

        print(f"  > Se filtraron {chunks_filtrados} trozos 'ruido'. Mantenidos: {kept}.")
            
    return all_chunks

def upload_to_azure(search_client: SearchClient, documents: list):
    """
    Sube los documentos (chunks) al índice de Azure AI Search.
    """
    if not documents:
        print("No se encontraron documentos válidos para cargar.")
        return
        
    print(f"\nCargando {len(documents)} trozos al índice de Azure...")
    
    batch_size = 500
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        try:
            search_client.upload_documents(documents=batch)
            print(f"  > Lote {int(i/batch_size) + 1} cargado exitosamente.")
        except Exception as e:
            print(f"  > Error cargando lote: {e}")

    print("¡Carga completada!")

def save_to_json(documents: list):
    """
    Guarda los chunks procesados en un archivo JSON local (Modo Dry Run).
    """
    output_file = "output_chunks.json"
    print(f"\nModo DRY RUN: Guardando {len(documents)} trozos en '{output_file}'...")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)
        
    print(f"¡Archivo '{output_file}' guardado! Reísalo para verificar la limpieza.")

def main():
    """
    Función principal para ejecutar todo el proceso de ingesta.
    """
    
    parser = argparse.ArgumentParser(description="Procesa PDFs médicos y los carga en Azure AI Search.")
    parser.add_argument(
        '--dry-run', 
        action='store_true', 
        help="Ejecuta el script sin cargar a Azure. Guarda el resultado en 'output_chunks.json' para revisión."
    )
    args = parser.parse_args()

    # Define la ruta a la carpeta 'data' relativa a este script
    data_folder = Path(__file__).parent / "data"
    
    if not data_folder.exists() or not any(data_folder.glob("*.pdf")):
        print(f"Error: La carpeta '{data_folder}' no existe o no contiene PDFs.")
        print("Crea una carpeta llamada 'data' al lado de este script y coloca tus PDFs ahí.")
        return

    try:
        # 1. Cargar y limpiar
        chunks_to_upload = load_and_split_pdfs(data_folder)
        
        # 2. Decidir destino (JSON local o Azure Cloud)
        if args.dry_run:
            save_to_json(chunks_to_upload)
        else:
            print("Modo REAL: Conectando a Azure para cargar...")
            client = get_search_client()
            upload_to_azure(client, chunks_to_upload)
            
    except Exception as e:
        print(f"\n--- Ocurrió un error crítico ---")
        print(f"Error: {e}")
        print("Consejo: Si estás en modo REAL, verifica tus variables de entorno en .env")

if __name__ == "__main__":
    main()