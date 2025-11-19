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