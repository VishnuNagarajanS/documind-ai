import os
import PyPDF2
import docx
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentParser:
    """Parse various document formats to extract text content"""
    
    @staticmethod
    def parse_pdf(file_path: str) -> Optional[str]:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            logger.error(f"Error parsing PDF: {e}")
            return None
    
    @staticmethod
    def parse_docx(file_path: str) -> Optional[str]:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error parsing DOCX: {e}")
            return None
    
    @staticmethod
    def parse_txt(file_path: str) -> Optional[str]:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                with open(file_path, 'r', encoding='latin-1') as file:
                    return file.read()
            except Exception as e:
                logger.error(f"Error parsing TXT with latin-1: {e}")
                return None
        except Exception as e:
            logger.error(f"Error parsing TXT: {e}")
            return None
    
    @staticmethod
    def parse_document(file_path: str, file_type: str) -> Optional[str]:
        """Parse document based on file type"""
        file_type = file_type.lower()
        
        if file_type == 'pdf':
            return DocumentParser.parse_pdf(file_path)
        elif file_type in ['docx', 'doc']:
            return DocumentParser.parse_docx(file_path)
        elif file_type == 'txt':
            return DocumentParser.parse_txt(file_path)
        else:
            logger.warning(f"Unsupported file type: {file_type}")
            return None
    
    @staticmethod
    def get_file_type(filename: str) -> str:
        """Get file type from filename"""
        return filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
