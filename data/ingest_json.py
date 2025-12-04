"""
Script para subir el archivo JSON curado (anmi_knowledge_base_curada.json) a Azure AI Search.

Uso:
  - Modo DRY RUN (ver qué se subiría): python ingest_json.py --dry-run
  - Modo REAL (subir a Azure):         python ingest_json.py
"""

import os
import uuid
import json
import argparse
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*args, **kwargs):
        return

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient


def get_search_client():
    """
    Se conecta y autentica con el servicio Azure AI Search.
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


def load_curated_json(json_path: Path) -> list:
    """
    Carga el archivo JSON curado y lo transforma al formato de Azure AI Search.
    """
    print(f"Cargando JSON curado desde: {json_path}...")
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    print(f"  > Se encontraron {len(data)} documentos en el JSON.")
    
    azure_docs = []
    for i, item in enumerate(data):
        # Combinar title, keywords y content para mejor búsqueda
        title = item.get("title", f"Documento {i+1}")
        keywords = item.get("keywords", "")
        content = item.get("content", "")
        
        # El contenido final incluye título y keywords para mejorar la relevancia de búsqueda
        full_content = f"{title}\n\nPalabras clave: {keywords}\n\n{content}"
        
        azure_doc = {
            "id": str(uuid.uuid4()),
            "content": full_content,
            "title": title,
            "page": i + 1,  # Usamos el índice como "página"
            "chunk_index": i,
            "tags": keywords.split(", ") if keywords else []
        }
        azure_docs.append(azure_doc)
    
    return azure_docs


def upload_to_azure(search_client: SearchClient, documents: list):
    """
    Sube los documentos al índice de Azure AI Search.
    """
    if not documents:
        print("No se encontraron documentos válidos para cargar.")
        return
        
    print(f"\nCargando {len(documents)} documentos al índice de Azure...")
    
    batch_size = 500
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        try:
            result = search_client.upload_documents(documents=batch)
            succeeded = sum(1 for r in result if r.succeeded)
            print(f"  > Lote {int(i/batch_size) + 1}: {succeeded}/{len(batch)} documentos cargados exitosamente.")
        except Exception as e:
            print(f"  > Error cargando lote: {e}")

    print("\n¡Carga completada!")


def save_preview_json(documents: list, output_file: str = "output_json_preview.json"):
    """
    Guarda una vista previa de los documentos que se subirían (Modo Dry Run).
    """
    print(f"\nModo DRY RUN: Guardando {len(documents)} documentos en '{output_file}'...")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)
        
    print(f"¡Archivo '{output_file}' guardado! Revísalo para verificar el formato.")


def main():
    parser = argparse.ArgumentParser(
        description="Sube el JSON curado de conocimientos a Azure AI Search."
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true', 
        help="Ejecuta sin cargar a Azure. Guarda el resultado en 'output_json_preview.json'."
    )
    parser.add_argument(
        '--file',
        type=str,
        default="anmi_knowledge_base_curada.json",
        help="Nombre del archivo JSON a procesar (default: anmi_knowledge_base_curada.json)"
    )
    args = parser.parse_args()

    # Ruta al archivo JSON (en la misma carpeta que este script)
    json_path = Path(__file__).parent / args.file
    
    if not json_path.exists():
        print(f"Error: No se encontró el archivo '{json_path}'")
        return

    try:
        # 1. Cargar y transformar el JSON
        azure_docs = load_curated_json(json_path)
        
        # 2. Decidir destino
        if args.dry_run:
            save_preview_json(azure_docs)
        else:
            print("\nModo REAL: Conectando a Azure para cargar...")
            client = get_search_client()
            upload_to_azure(client, azure_docs)
            
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo JSON")
    except json.JSONDecodeError as e:
        print(f"Error: El archivo JSON tiene un formato inválido: {e}")
    except KeyError as e:
        print(f"Error: Falta la variable de entorno {e}")
        print("Asegúrate de tener configuradas las variables en tu archivo .env:")
        print("  - AZURE_SEARCH_SERVICE_NAME")
        print("  - AZURE_SEARCH_INDEX_NAME")
        print("  - AZURE_SEARCH_API_KEY")
    except Exception as e:
        print(f"\n--- Error ---")
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
