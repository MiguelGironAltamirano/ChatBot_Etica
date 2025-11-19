# TODO: Configurar el cliente de Gemini aquí
from langchain_google_genai import ChatGoogleGenerativeAI
from src.core.config import settings
# llm = ChatGoogleGenerativeAI(model="gemini-pro")

get_llm_chain = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0
)