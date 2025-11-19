from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from src.core.config import settings

AZURE_SEARCH_SERVICE_NAME = settings.AZURE_SEARCH_SERVICE_NAME
AZURE_SEARCH_INDEX_NAME = settings.AZURE_SEARCH_INDEX_NAME
AZURE_SEARCH_API_KEY = settings.AZURE_SEARCH_API_KEY

def get_search_client() -> SearchClient:
    """Create and return an Azure SearchClient."""
    endpoint = f"https://{AZURE_SEARCH_SERVICE_NAME}.search.windows.net"
    credential = AzureKeyCredential(AZURE_SEARCH_API_KEY)
    search_client = SearchClient(
        endpoint=endpoint,
        index_name=AZURE_SEARCH_INDEX_NAME,
        credential=credential
    )
    return search_client

search_client = get_search_client()
print("Cliente de Azure AI Search creado correctamente.")