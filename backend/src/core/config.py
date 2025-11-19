from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    AZURE_SEARCH_SERVICE_NAME: str
    AZURE_SEARCH_INDEX_NAME: str
    AZURE_SEARCH_API_KEY: str

    # GEMINI_API_KEY: str
    class Config:
        env_file = ".env"

settings = Settings()