from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import chat_router

app = FastAPI(title="Ethics Chatbot API", version="1.0.0")



app.add_middleware(
    CORSMiddleware,
    allow_origins={"*"},
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to the Ethics Chatbot API"}