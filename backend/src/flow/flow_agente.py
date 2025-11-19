from src.prompts.system_prompts import SYSTEM_PROMPT
from src.tools.tool_buscar_base_conocimientos import buscar_base_conocimientos_tool
from src.util.util_llm import get_llm_chain

# 1. Importa el PROMPT del sistema
print(f"SYSTEM PROMPT: {SYSTEM_PROMPT}...")

# 2. Importa el LLM (Gemini)
print(f"LLM cargado: {get_llm_chain}")

async def run_flow(user_message: str) -> str:
    """
    Función principal para ejecutar el flujo RAG.
    """
    
    # Fase 1: Retrieval
    contexto = buscar_base_conocimientos_tool(user_message)
    print(f"Contexto recuperado: {contexto}...")

    if "No se encontró contexto" in contexto:
        contexto = "No se encontró información relevante en la base de conocimientos."

    # Fase 2: Generation
    # TODO: Usar el LLM con el prompt del sistema y el contexto recuperado
    # response = get_llm_chain.invoke(f"{ANMI_SYSTEM_PROMPT} ... {contexto} ... {user_message}")
    print("TODO: Implementar llamada a Gemini...")

    # Por ahora, solo devolvemos un mensaje simulado.
    response = f"Respuesta simulada basada en el contexto: {contexto} y el mensaje del usuario: {user_message}"

    return response