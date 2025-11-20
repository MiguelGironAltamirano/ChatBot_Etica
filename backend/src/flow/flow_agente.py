from typing import Annotated
from typing_extensions import TypedDict
import asyncio
import random
# --- Imports de LangGraph y LangChain ---
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver 
from langchain_core.messages import HumanMessage, SystemMessage

# --- Tus Imports ---
from src.prompts.system_prompts import SYSTEM_PROMPT
from src.tools.tool_buscar_base_conocimientos import buscar_base_conocimientos_tool
from src.util.util_llm import get_llm_chain # Asumo que este es tu objeto Gemini (llm)

# 1. Definimos el Estado (La lista de mensajes que se guardará en RAM)
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

# 2. Inicializamos la Memoria (Volátil: se borra al reiniciar)
memory = MemorySaver()

# 3. Definimos el NODO PRINCIPAL (Aquí ocurre toda la lógica RAG)
async def call_model(state: AgentState):
    
    # a. Obtenemos el último mensaje del usuario desde el historial
    last_message = state["messages"][-1].content
    print(f"--- Procesando mensaje: {last_message} ---")

    # b. Fase 1: Retrieval (Buscar en Azure)
    contexto = buscar_base_conocimientos_tool(last_message)
    
    # c. Filtro de Seguridad
    if "No se encontró contexto" in contexto or not contexto:
        # Cortocircuito: Respondemos directamente sin gastar tokens del LLM
        return {"messages": ["Lo siento, no encontré información oficial sobre eso en mis documentos."]}

    # d. Preparamos el Prompt con el Contexto Fresco
    # (Esto se hace en cada turno para que el contexto siempre sea relevante a la última pregunta)
    prompt_actualizado = SYSTEM_PROMPT.format(
        contexto_de_la_busqueda_rag=contexto,
        pregunta_del_usuario=last_message
    )
    
    # e. Preparamos la lista de mensajes para Gemini:
    #    [0] Instrucciones del Sistema (con contexto)
    #    [1..N] Historial de la conversación (state["messages"])
    messages_for_llm = [SystemMessage(content=prompt_actualizado)] + state["messages"]
    
    # f. Fase 2: Generation (Llamada REAL a Gemini)
    print("--- Invocando a Gemini ---")
    # Usamos el objeto LLM que importaste
    response = await get_llm_chain.ainvoke(messages_for_llm)
    
    # Devolvemos la respuesta para que LangGraph la guarde en la memoria
    return {"messages": [response]}

# 4. Construimos el Grafo
workflow = StateGraph(AgentState)
workflow.add_node("anmi_agent", call_model)
workflow.add_edge(START, "anmi_agent")
workflow.add_edge("anmi_agent", END)

# 5. Compilamos la aplicación CON memoria
# Este objeto 'app_graph' es el que mantiene el estado
app_graph = workflow.compile(checkpointer=memory)

# 6. Función Pública (La que llama tu API)
# AHORA NECESITA thread_id
async def run_flow(user_message: str, thread_id: str) -> str:
    """
    Ejecuta el flujo RAG con memoria.
    """
    
    # Configuración de sesión (La clave para recuperar la memoria correcta)
    config = {"configurable": {"thread_id": thread_id}}
    
    # Ejecutamos el grafo pasando el nuevo mensaje
    input_message = HumanMessage(content=user_message)
    
    # ainvoke corre el grafo y guarda el estado automáticamente
    final_state = await app_graph.ainvoke(
        {"messages": [input_message]}, 
        config=config
    )
    
    # Extraemos el texto de la última respuesta del bot
    bot_response = final_state["messages"][-1].content
    
    return bot_response

async def run_flow_stream(user_message: str, thread_id: str):
    """
    Streaming estilo ChatGPT:
    - Palabras con velocidad variable leve
    - Sin pausas incómodas
    - Suave y natural
    """
    
    config = {"configurable": {"thread_id": thread_id}}
    input_message = HumanMessage(content=user_message)

    buffer = ""

    async for event in app_graph.astream_events(
        {"messages": [input_message]},
        config=config,
        version="v2"
    ):
        if event["event"] == "on_chat_model_stream":
            chunk = event["data"]["chunk"].content
            if not chunk:
                continue

            buffer += chunk

            # Emitir una palabra cuando aparece espacio
            while " " in buffer:
                word, buffer = buffer.split(" ", 1)

                # Emitir la palabra
                yield word + " "

                # Velocidad tipo ChatGPT (rápido, suave, ligeramente aleatorio)
                await asyncio.sleep(random.uniform(0.010, 0.020))

    # Emitir cualquier resto al final
    if buffer:
        yield buffer