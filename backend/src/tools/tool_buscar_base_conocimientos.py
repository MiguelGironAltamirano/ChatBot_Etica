from src.util.util_retriever import search_client

def buscar_base_conocimientos_tool(query: str) -> str:
    """
    Usa el cliente de Azure AI Search para buscar en la base de conocimientos.
    """
    try:
        results = search_client.search(
            search_text=query,
            select=["content"],
            top=3  # Limitar a los 3 resultados más relevantes
        )

        # Combina los contenidos de los resultados en un solo string
        contexto = "\n---\n".join([result["content"] for result in results])

        if not contexto:
            return "No se encontraron resultados relevantes en la base de conocimientos."
        return contexto
    
    except Exception as e:
        print(f"Error al buscar en la base de conocimientos: {e}")
        return "Error al conectar con la base de conocimientos." 
    