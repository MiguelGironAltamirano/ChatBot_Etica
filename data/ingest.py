import os
import uuid
import json
import re
import argparse
from pathlib import Path
try:
    from dotenv import load_dotenv
except Exception:
    # If python-dotenv isn't installed, provide a no-op load_dotenv so dry-run still works
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

# --- PALABRAS CLAVE DE FILTRADO ---
# Esta es la lista que tu equipo debe "entrenar" y hacer crecer.
PALABRAS_RUIDO = [
    # Palabras de la página de créditos
    "ISBN:", 
    "Hecho el Depósito Legal", 
    "Catalogación hecha por",
    "Impreso por:",
    "www.ins.gob.pe",
    
    # Palabras de la página de Resolución
    "SE RESUELFVE",
    "Regístrese, comuníquese y publíquese",
    "PILAR ELENA MAZZETTI SOLER",
    "Con el visado del",

    # Palabras de la página de Equipos
    "EQUIPO TÉCNICO RESPONSABLE",
    "PARTICIPARON EN LA REVISIÓN",
    "UNICEF",
    "Colegio de Nutricionistas del Perú"
# we'll normalize to lowercase at runtime
]
# -------------------------------------

# --- UMBRAL DE RUIDO ---
# El chunk se considera "ruido" si contiene al menos 1 palabra clave
RUIDO_THRESHOLD = 1
# Mínimo de caracteres para considerar un chunk válido
MIN_CHUNK_CHARS = 40
# -------------------------------------

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

def load_and_split_pdfs(data_folder: Path):
    """
    Carga todos los PDFs de la carpeta /data y los divide en trozos ("chunks") limpios.
    """
    print(f"Cargando PDFs desde: {data_folder}...")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,  # Tamaño de cada trozo
        chunk_overlap=200   # Solapamiento para mantener contexto
    )
    
    all_chunks = []
    
    for pdf_path in data_folder.glob("*.pdf"):
        print(f"\nProcesando: {pdf_path.name}...")
        
        loader = PyPDFLoader(str(pdf_path))
        documents = loader.load()
        chunks = text_splitter.split_documents(documents)

        print(f"  > Se dividió en {len(chunks)} trozos. Aplicando filtros...")

        chunks_filtrados = 0
        kept = 0
        # normalize noise words once
        noise_words = [w.lower() for w in PALABRAS_RUIDO]
        for i, chunk in enumerate(chunks):
            content = (chunk.page_content or "").strip()

            # skip empty content
            if not content:
                chunks_filtrados += 1
                continue

            # normalize whitespace and lower
            content_clean = re.sub(r"\s+", " ", content)
            content_lower = content_clean.lower()

            # filter by minimal length (helps drop headers/footers)
            if len(content_clean) < MIN_CHUNK_CHARS:
                chunks_filtrados += 1
                continue

            # count noise keywords (case-insensitive)
            ruido_count = sum(1 for palabra in noise_words if palabra in content_lower)

            if ruido_count >= RUIDO_THRESHOLD:
                chunks_filtrados += 1
                continue

            # Try to get a sensible page number from metadata
            page_number = 0
            meta = getattr(chunk, "metadata", {}) or {}
            for key in ("page", "page_number", "page_num", "pageno", "pageIndex"):
                if key in meta:
                    try:
                        page_number = int(meta[key])
                    except Exception:
                        # sometimes metadata already is 1-based or text; ignore
                        try:
                            page_number = int(str(meta[key]).strip())
                        except Exception:
                            page_number = 0
                    break

            # If page_number looks like 0 but chunk has page markers in text, attempt to detect
            if page_number == 0:
                m = re.search(r"\bPagina\s*(\d{1,4})\b|\bpage\s*(\d{1,4})\b", content_lower, re.IGNORECASE)
                if m:
                    pg = m.group(1) or m.group(2)
                    try:
                        page_number = int(pg)
                    except Exception:
                        page_number = 0

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

        print(f"  > Se filtraron {chunks_filtrados} trozos de 'ruido' (umbral={RUIDO_THRESHOLD}). Mantenidos: {kept}.")
            
    return all_chunks

def upload_to_azure(search_client: SearchClient, documents: list):
    """
    Sube los documentos (chunks) al índice de Azure AI Search.
    """
    if not documents:
        print("No se encontraron documentos para cargar.")
        return
        
    print(f"\nCargando {len(documents)} trozos al índice de Azure...")
    
    batch_size = 500
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        search_client.upload_documents(documents=batch)
        print(f"  > Cargado lote {int(i/batch_size) + 1}...")

    print("¡Carga completada!")

def save_to_json(documents: list):
    """
    Guarda los chunks procesados en un archivo JSON local (Modo Dry Run).
    """
    print(f"\nModo DRY RUN: Guardando {len(documents)} trozos en 'output_chunks.json'...")
    
    with open("output_chunks.json", "w", encoding="utf-8") as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)
        
    print("¡Archivo 'output_chunks.json' guardado localmente!")

def main():
    """
    Función principal para ejecutar todo el proceso de ingesta.
    """
    
    parser = argparse.ArgumentParser(description="Procesa PDFs y los carga en Azure.")
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help="Ejecuta el script sin cargar a Azure. Guarda el resultado en 'output_chunks.json'."
    )
    args = parser.parse_args()

    data_folder = Path(__file__).parent / "data"
    
    if not data_folder.exists() or not any(data_folder.glob("*.pdf")):
        print(f"Error: La carpeta {data_folder} no existe o no contiene PDFs.")
        print("Asegúrate de crear una carpeta 'data' y poner tus PDFs dentro.")
        return

    try:
        chunks_to_upload = load_and_split_pdfs(data_folder)
        
        if args.dry_run:
            save_to_json(chunks_to_upload)
        else:
            print("Modo REAL: Conectando a Azure para cargar...")
            client = get_search_client()
            upload_to_azure(client, chunks_to_upload)
            
    except Exception as e:
        print(f"\n--- Ocurrió un error ---")
        print(f"Error: {e}")
        print("Si estás en modo REAL, asegúrate de que tu .env es correcto.")

if __name__ == "__main__":
    main()