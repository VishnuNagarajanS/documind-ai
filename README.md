# DocuMind AI

AI-Powered Business Analysis & Documentation Platform

DocuMind AI transforms how businesses create documentation by leveraging the Gemini API to convert raw business ideas and process descriptions into professional, structured documents within minutes.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **AI Engine**: Google Gemini API
- **Document Generation**: python-docx, reportlab, python-pptx, openpyxl

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Features

- **User Authentication**: Secure JWT-based registration and login
- **Project Management**: Create, view, and delete projects
- **AI-Guided Analysis**: Conversational AI interface for requirement gathering
- **Document Generation**: Generate BRD, SRS, User Stories, Test Cases, and more
- **Multiple Export Formats**: PDF, DOCX, PPTX, Excel
- **AI Chat**: Chat with AI about any generated report
- **Report History**: View all previously generated documents

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Google Gemini API Key

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd DocuMind\ AI
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env
# Edit .env and add your credentials:
# - DATABASE_URL
# - SECRET_KEY
# - GEMINI_API_KEY
```

### 3. Database Setup

```bash
# Initialize database
python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"

# Or use Alembic for migrations
alembic upgrade head
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Start Frontend

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/documind
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT token
- `POST /auth/logout` - Logout

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `DELETE /projects/{id}` - Delete project

### AI Analysis
- `POST /projects/{id}/analyze` - Start AI intake session
- `POST /projects/{id}/questions` - Submit answers to follow-up questions

### Documents
- `GET /projects/{id}/reports` - List all reports for project
- `POST /projects/{id}/generate` - Generate selected documents
- `GET /reports/{id}/download` - Download report in specified format
- `POST /reports/{id}/chat` - Chat with AI about a report

## Document Types

- Business Documents: Executive Summary, Business Analysis Report, SWOT Analysis, Gap Analysis, Risk Analysis, Growth Strategy
- Software Documents: Business Requirements Document (BRD), Software Requirements Specification (SRS), User Stories, Test Cases

## Development

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Building Frontend for Production

```bash
cd frontend
npm run build
```

## Testing

Run the test cases as specified in the TestCases document to verify all functionality.

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **CORS Error**: Verify CORS_ORIGINS includes your frontend URL
3. **Gemini API Error**: Check that GEMINI_API_KEY is valid and has sufficient quota
4. **Module Not Found**: Ensure virtual environment is activated and dependencies are installed

## License

Confidential - All rights reserved

## Support

For support, contact the development team.
