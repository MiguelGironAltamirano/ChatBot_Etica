from fastapi import APIRouter
from src.schemas.models import ChatRequest, ChatResponse
from src.flow.flow_agente import run_flow

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    """
    Este endpoint ahora llama al flow de RAG.
    """
    final_answer = await run_flow(request.message, request.thread_id)

    return ChatResponse(reply=final_answer)

@router.post("/chat/stream")
async def handle_chat_stream(request: ChatRequest):
    """
    Endpoint para streaming de respuestas usando SSE.
    """
    from fastapi.responses import StreamingResponse
    from src.flow.flow_agente import run_flow_stream
    import json

    async def event_generator():
        async for token in run_flow_stream(request.message, request.thread_id):
            # Formato SSE: data: <contenido>\n\n
            # Escapamos saltos de línea para que no rompan el formato SSE
            # O simplemente enviamos el token tal cual si el cliente lo maneja.
            # Lo estándar es enviar JSON o texto plano.
            # Enviaremos un JSON con el token para ser más seguros.
            data = json.dumps({"token": token})
            yield f"data: {data}\n\n"
        
        # Señal de fin (opcional, pero útil)
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")