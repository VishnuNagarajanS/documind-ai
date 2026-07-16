from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str



class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1)
    industry: Optional[str] = None
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    reports: List["ReportResponse"] = []

    class Config:
        from_attributes = True


class Message(BaseModel):
    role: str
    content: str


class AISessionCreate(BaseModel):
    business_description: str = Field(..., min_length=50)


class AISessionResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    messages: List[Message]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionAnswer(BaseModel):
    question: str
    answer: str


class SubmitAnswersRequest(BaseModel):
    session_id: uuid.UUID
    answers: List[QuestionAnswer]


class SubmitAnswersResponse(BaseModel):
    status: str
    next_questions: Optional[List[str]] = None
    analysis: Optional[Dict[str, Any]] = None


class ReportResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    report_type: str
    content: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class GenerateDocumentsRequest(BaseModel):
    document_types: List[str]


class GenerateDocumentsResponse(BaseModel):
    reports: List[ReportResponse]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str


class UploadedDocumentResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    filename: str
    file_type: str
    file_size: int
    file_path: str
    extracted_text: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


class AnalyzeWithDocumentsRequest(BaseModel):
    business_description: str = Field(..., min_length=50)
    use_uploaded_documents: bool = False


ProjectDetailResponse.model_rebuild()
