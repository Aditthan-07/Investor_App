from fastapi import APIRouter
from app.schemas.all_schemas import ChatMessage, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(payload: ChatMessage):
    result = chat_service.process_message(payload.message)
    return ChatResponse(**result)
