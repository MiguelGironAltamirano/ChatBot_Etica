import os
import uuid
import json
import argparse
from pathlib import Path
from dotenv import load_dotenv

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
]
# -------------------------------------

# --- UMBRAL DE RUIDO ---
# El chunk se considera "ruido" si tiene 2 o más palabras clave
RUIDO_THRESHOLD = 2 
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
        for i, chunk in enumerate(chunks):
            
            # --- LÓGICA DE LIMPIEZA MEJORADA (POR UMBRAL) ---
            ruido_count = 0
            for palabra in PALABRAS_RUIDO:
                if palabra in chunk.page_content:
                    ruido_count += 1
            
            # Solo filtramos si el conteo supera el umbral
            if ruido_count >= RUIDO_THRESHOLD:
                chunks_filtrados += 1
                continue # Saltar este chunk
            # ------------------------------------------

            # Este chunk está limpio, lo preparamos
            azure_doc = {
                "id": str(uuid.uuid4()),
                "content": chunk.page_content,
                "title": pdf_path.name,
                "page": chunk.metadata.get("page", 0) + 1,
                "chunk_index": i,
                "tags": [pdf_path.name]
            }
            all_chunks.append(azure_doc)
            
        print(f"  > Se filtraron {chunks_filtrados} trozos de 'ruido' (umbral={RUIDO_THRESHOLD}).")
            
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