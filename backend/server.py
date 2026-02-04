from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Response, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
import os
import json
import logging
from pathlib import Path
from typing import List, Optional
import uuid
import secrets
import string
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import shutil
import zipfile
import xml.etree.ElementTree as ET
from io import BytesIO
from watermark import create_placeholder_acd_pdf, create_placeholder_plan_pdf, add_watermark_to_pdf
from email_service import send_document_email

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Data file paths
DATA_FILE = ROOT_DIR / 'data' / 'parcelles.json'
UPLOADS_DIR = ROOT_DIR / 'uploads'
DOCUMENTS_DIR = ROOT_DIR / 'documents'
UPLOADS_DIR.mkdir(exist_ok=True)
DOCUMENTS_DIR.mkdir(exist_ok=True)

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable must be set")
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="Songon Extension API", version="1.1.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    username: str

class ParcelleBase(BaseModel):
    nom: str
    reference_tf: str
    type_projet: str
    statut_acd: str
    reference_acd: Optional[str] = ""
    proprietaire: str
    commune: str
    region: str
    situation_geo: str
    acces: str
    axe_principal: str
    distance_ville: str
    superficie: float
    unite_superficie: str = "ha"
    configuration: str
    environnement: List[str] = []
    occupation: str
    statut_foncier: List[str] = []
    documents: List[str] = []
    usages_possibles: List[str] = []
    atouts: str
    positionnement: str
    prix_m2: float
    valeur_globale: float
    modalites: List[str] = []
    situation_actuelle: List[str] = []
    prochaines_etapes: str
    photos: List[str] = []
    vues_drone: List[str] = []
    statut: str = "disponible"
    coordinates: List[List[float]] = []
    center: List[float] = []

class ParcelleUpdate(BaseModel):
    nom: Optional[str] = None
    type_projet: Optional[str] = None
    statut_acd: Optional[str] = None
    reference_acd: Optional[str] = None
    superficie: Optional[float] = None
    configuration: Optional[str] = None
    environnement: Optional[List[str]] = None
    occupation: Optional[str] = None
    statut_foncier: Optional[List[str]] = None
    documents: Optional[List[str]] = None
    usages_possibles: Optional[List[str]] = None
    atouts: Optional[str] = None
    positionnement: Optional[str] = None
    prix_m2: Optional[float] = None
    valeur_globale: Optional[float] = None
    modalites: Optional[List[str]] = None
    situation_actuelle: Optional[List[str]] = None
    prochaines_etapes: Optional[str] = None
    photos: Optional[List[str]] = None
    vues_drone: Optional[List[str]] = None
    statut: Optional[str] = None

class StatusUpdate(BaseModel):
    statut: str

class ContactInfo(BaseModel):
    nom: str
    telephone: str
    email: str

class AccessCodeCreate(BaseModel):
    client_name: str
    client_email: str
    parcelle_ids: List[str] = []  # Empty = all parcelles
    expires_hours: int = 72  # Default 72 hours

class AccessCodeVerify(BaseModel):
    code: str
    parcelle_id: str

class DocumentAccessRequest(BaseModel):
    code: str
    parcelle_id: str
    document_type: str

# ==================== HELPERS ====================

def load_data():
    """Load data from JSON file"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Ensure required fields exist
            if "access_codes" not in data:
                data["access_codes"] = []
            if "download_logs" not in data:
                data["download_logs"] = []
            return data
    except FileNotFoundError:
        return {
            "parcelles": [], 
            "config": {"map_center": [-4.287, 5.345], "map_zoom": 15}, 
            "admin": {},
            "access_codes": [],
            "download_logs": []
        }

def save_data(data):
    """Save data to JSON file"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def create_token(username: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

def generate_access_code(length: int = 8) -> str:
    """Generate a unique access code"""
    chars = string.ascii_uppercase + string.digits
    # Exclude confusing characters
    chars = chars.replace('O', '').replace('0', '').replace('I', '').replace('1', '').replace('L', '')
    return ''.join(secrets.choice(chars) for _ in range(length))

def verify_access_code(code: str, parcelle_id: str) -> dict:
    """Verify an access code and return code info if valid"""
    data = load_data()
    access_codes = data.get("access_codes", [])
    
    for ac in access_codes:
        if ac["code"] == code.upper() and ac["active"]:
            # Check expiration
            expires_at = datetime.fromisoformat(ac["expires_at"])
            if expires_at < datetime.now(timezone.utc):
                return None
            
            # Check parcelle access
            if ac["parcelle_ids"] and parcelle_id not in ac["parcelle_ids"]:
                return None
            
            return ac
    
    return None

def log_download(code: str, client_name: str, parcelle_id: str, document_type: str, document_name: str):
    """Log a document download"""
    data = load_data()
    log_entry = {
        "id": str(uuid.uuid4()),
        "code": code,
        "client_name": client_name,
        "parcelle_id": parcelle_id,
        "document_type": document_type,
        "document_name": document_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ip_address": "N/A"  # Would be populated from request in production
    }
    data.setdefault("download_logs", []).append(log_entry)
    save_data(data)
    logger.info(f"Document download logged: {client_name} - {document_name}")

def parse_kml_file(kml_content: str) -> List[dict]:
    """Parse KML content and extract polygons"""
    parcelles = []
    try:
        root = ET.fromstring(kml_content)
        ns = {'kml': 'http://www.opengis.net/kml/2.2'}
        
        placemarks = root.findall('.//kml:Placemark', ns)
        if not placemarks:
            placemarks = root.findall('.//Placemark')
        
        for pm in placemarks:
            polygon = pm.find('.//kml:Polygon', ns) or pm.find('.//Polygon')
            if polygon is not None:
                name_elem = pm.find('kml:name', ns) or pm.find('name')
                name = name_elem.text if name_elem is not None else "Parcelle"
                
                coords_elem = polygon.find('.//kml:coordinates', ns) or polygon.find('.//coordinates')
                if coords_elem is not None and coords_elem.text:
                    coords_text = coords_elem.text.strip()
                    coordinates = []
                    for coord in coords_text.split():
                        parts = coord.split(',')
                        if len(parts) >= 2:
                            lon, lat = float(parts[0]), float(parts[1])
                            coordinates.append([lon, lat])
                    
                    if coordinates:
                        center_lon = sum(c[0] for c in coordinates) / len(coordinates)
                        center_lat = sum(c[1] for c in coordinates) / len(coordinates)
                        
                        parcelle_id = f"parcelle-{str(uuid.uuid4())[:8]}"
                        parcelles.append({
                            "id": parcelle_id,
                            "nom": name,
                            "reference_tf": "",
                            "type_projet": "Résidentiel",
                            "statut_acd": "ACD en cours",
                            "reference_acd": "",
                            "proprietaire": "0PES HOLDING",
                            "commune": "Songon M'Braté",
                            "region": "Abidjan",
                            "situation_geo": "",
                            "acces": "",
                            "axe_principal": "",
                            "distance_ville": "",
                            "superficie": 0,
                            "unite_superficie": "ha",
                            "configuration": "Plat",
                            "environnement": [],
                            "occupation": "Terrain nu",
                            "statut_foncier": [],
                            "documents": [],
                            "usages_possibles": [],
                            "atouts": "",
                            "positionnement": "Développement",
                            "prix_m2": 0,
                            "valeur_globale": 0,
                            "modalites": [],
                            "situation_actuelle": [],
                            "prochaines_etapes": "",
                            "photos": [],
                            "vues_drone": [],
                            "statut": "disponible",
                            "coordinates": coordinates,
                            "center": [center_lon, center_lat]
                        })
    except Exception as e:
        logger.error(f"Error parsing KML: {e}")
    
    return parcelles

# ==================== PUBLIC ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Songon Extension API", "version": "1.1.0"}

@api_router.get("/parcelles")
async def get_parcelles():
    """Get all parcelles (public)"""
    data = load_data()
    return {"parcelles": data.get("parcelles", []), "config": data.get("config", {})}

@api_router.get("/parcelles/{parcelle_id}")
async def get_parcelle(parcelle_id: str):
    """Get a specific parcelle by ID"""
    data = load_data()
    for p in data.get("parcelles", []):
        if p["id"] == parcelle_id:
            return p
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.get("/config")
async def get_config():
    """Get map configuration"""
    data = load_data()
    return data.get("config", {})

@api_router.get("/stats")
async def get_stats():
    """Get statistics about parcelles"""
    data = load_data()
    parcelles = data.get("parcelles", [])
    
    total = len(parcelles)
    disponible = sum(1 for p in parcelles if p.get("statut") == "disponible")
    option = sum(1 for p in parcelles if p.get("statut") == "option")
    vendu = sum(1 for p in parcelles if p.get("statut") == "vendu")
    
    total_superficie = sum(p.get("superficie", 0) for p in parcelles)
    valeur_totale = sum(p.get("valeur_globale", 0) for p in parcelles)
    
    return {
        "total": total,
        "disponible": disponible,
        "option": option,
        "vendu": vendu,
        "total_superficie": total_superficie,
        "valeur_totale": valeur_totale
    }

# ==================== DOCUMENT ACCESS ROUTES ====================

# Document type labels for display
DOCUMENT_TYPE_LABELS = {
    "acd": "Arrêté de Concession Définitive (ACD)",
    "plan": "Plan cadastral / Bornage",
    "extrait_cadastral": "Extrait cadastral",
    "titre_foncier": "Titre Foncier",
    "autre": "Document"
}

@api_router.get("/parcelles/{parcelle_id}/documents")
async def get_available_documents(parcelle_id: str):
    """Get list of available documents for a parcelle (public - shows what's available)"""
    data = load_data()
    for p in data.get("parcelles", []):
        if p["id"] == parcelle_id:
            official_docs = p.get("official_documents", {})
            
            # Build list of available documents - support both single and multiple files
            available = []
            for doc_type, doc_data in official_docs.items():
                # Handle both single doc (dict) and multiple docs (list)
                if isinstance(doc_data, list):
                    doc_list = doc_data
                else:
                    doc_list = [doc_data]
                
                # Get latest upload date
                latest_upload = max((d.get("uploaded_at", "") for d in doc_list), default="")
                
                available.append({
                    "type": doc_type,
                    "label": DOCUMENT_TYPE_LABELS.get(doc_type, doc_type.replace('_', ' ').title()),
                    "has_file": True,
                    "file_count": len(doc_list),
                    "uploaded_at": latest_upload,
                    "files": [{"id": d.get("id"), "name": d.get("original_name", d.get("filename"))} for d in doc_list]
                })
            
            return {
                "parcelle_id": parcelle_id,
                "parcelle_nom": p.get("nom", ""),
                "available_documents": available,
                "total_count": len(available)
            }
    
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.post("/documents/verify-code")
async def verify_document_code(request: AccessCodeVerify):
    """Verify access code for documents"""
    access_info = verify_access_code(request.code, request.parcelle_id)
    
    if not access_info:
        raise HTTPException(status_code=403, detail="Code d'accès invalide ou expiré")
    
    return {
        "valid": True,
        "client_name": access_info["client_name"],
        "expires_at": access_info["expires_at"],
        "parcelle_access": access_info["parcelle_ids"] or "all"
    }

@api_router.post("/documents/request-access")
async def request_document_access(
    parcelle_id: str,
    client_name: str = Form(...),
    client_email: str = Form(...)
):
    """Request document access (public - creates a pending request)"""
    data = load_data()
    
    # Create access request (admin will approve and generate code)
    request_entry = {
        "id": str(uuid.uuid4()),
        "parcelle_id": parcelle_id,
        "client_name": client_name,
        "client_email": client_email,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    data.setdefault("access_requests", []).append(request_entry)
    save_data(data)
    
    return {
        "message": "Demande d'accès envoyée. Vous recevrez un code par email.",
        "request_id": request_entry["id"]
    }

@api_router.get("/documents/{parcelle_id}/{document_type}")
async def get_document_with_watermark(
    parcelle_id: str,
    document_type: str,
    code: str,
    action: str = Query("preview", description="preview, download, or info")
):
    """Get document with watermark (requires valid access code)"""
    access_info = verify_access_code(code, parcelle_id)
    
    if not access_info:
        raise HTTPException(status_code=403, detail="Code d'accès invalide ou expiré")
    
    # Get parcelle info
    data = load_data()
    parcelle = None
    for p in data.get("parcelles", []):
        if p["id"] == parcelle_id:
            parcelle = p
            break
    
    if not parcelle:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    
    client_name = access_info["client_name"]
    
    # Log the access
    log_download(
        code=code,
        client_name=client_name,
        parcelle_id=parcelle_id,
        document_type=document_type,
        document_name=f"{document_type}_{parcelle_id}"
    )
    
    # If just requesting info
    if action == "info":
        # Check if real document exists
        official_docs = parcelle.get("official_documents", {})
        has_real_doc = document_type in official_docs
        
        return {
            "document_type": document_type,
            "parcelle_id": parcelle_id,
            "parcelle_nom": parcelle.get("nom", ""),
            "has_real_document": has_real_doc,
            "access_granted": True,
            "accessed_by": client_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "download_url": f"/api/documents/{parcelle_id}/{document_type}?code={code}&action=download",
            "preview_url": f"/api/documents/{parcelle_id}/{document_type}?code={code}&action=preview"
        }
    
    # Check if real document exists
    official_docs = parcelle.get("official_documents", {})
    
    if document_type in official_docs:
        # Handle both single doc (dict) and multiple docs (list)
        doc_data = official_docs[document_type]
        if isinstance(doc_data, list):
            # Use the first document (latest) for now
            doc_info = doc_data[0] if doc_data else None
        else:
            doc_info = doc_data
        
        if doc_info:
            doc_path = Path(doc_info.get("path", ""))
            
            if doc_path.exists():
                # Read original PDF and add watermark
                with open(doc_path, 'rb') as f:
                    original_pdf = f.read()
                
                try:
                    pdf_content = add_watermark_to_pdf(original_pdf, client_name, code)
                    filename = f"{document_type.upper()}_{parcelle.get('nom', parcelle_id).replace(' ', '_')}_watermarked.pdf"
                except Exception as e:
                    logger.error(f"Error adding watermark: {e}")
                    # Fallback to placeholder if watermark fails
                    if document_type == "acd":
                        pdf_content = create_placeholder_acd_pdf(
                            parcelle_nom=parcelle.get("nom", "Parcelle"),
                            parcelle_ref=parcelle.get("reference_tf", "N/A"),
                            client_name=client_name,
                            access_code=code
                        )
                    else:
                        pdf_content = create_placeholder_plan_pdf(
                            parcelle_nom=parcelle.get("nom", "Parcelle"),
                            parcelle_ref=parcelle.get("reference_tf", "N/A"),
                            superficie=parcelle.get("superficie", 0),
                            client_name=client_name,
                            access_code=code
                        )
                    filename = f"{document_type.upper()}_{parcelle.get('nom', parcelle_id).replace(' ', '_')}.pdf"
            else:
                raise HTTPException(status_code=404, detail="Fichier document non trouvé")
        else:
            raise HTTPException(status_code=404, detail="Document non trouvé")
    else:
        # Generate placeholder PDF with watermark
        if document_type == "acd":
            pdf_content = create_placeholder_acd_pdf(
                parcelle_nom=parcelle.get("nom", "Parcelle"),
                parcelle_ref=parcelle.get("reference_tf", "N/A"),
                client_name=client_name,
                access_code=code
            )
            filename = f"ACD_{parcelle.get('nom', parcelle_id).replace(' ', '_')}_SPECIMEN.pdf"
        elif document_type == "plan":
            pdf_content = create_placeholder_plan_pdf(
                parcelle_nom=parcelle.get("nom", "Parcelle"),
                parcelle_ref=parcelle.get("reference_tf", "N/A"),
                superficie=parcelle.get("superficie", 0),
                client_name=client_name,
                access_code=code
            )
            filename = f"Plan_{parcelle.get('nom', parcelle_id).replace(' ', '_')}_SPECIMEN.pdf"
        else:
            raise HTTPException(status_code=400, detail="Type de document non supporté")
    
    # Return as streaming response
    if action == "download":
        return StreamingResponse(
            BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "X-Watermark": f"Document pour {client_name}"
            }
        )
    else:  # preview
        return StreamingResponse(
            BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{filename}"',
                "X-Watermark": f"Document pour {client_name}"
            }
        )


@api_router.post("/documents/send")
async def send_document(
    parcelle_id: str = Form(...),
    document_type: str = Form(...),
    code: str = Form(...),
    send_method: str = Form(...),  # email or whatsapp
    recipient: str = Form(...)  # email address or phone number
):
    """Send document via email with PDF attachment"""
    access_info = verify_access_code(code, parcelle_id)
    
    if not access_info:
        raise HTTPException(status_code=403, detail="Code d'accès invalide ou expiré")
    
    client_name = access_info["client_name"]
    
    # Get parcelle info
    data = load_data()
    parcelle = None
    for p in data.get("parcelles", []):
        if p["id"] == parcelle_id:
            parcelle = p
            break
    
    if not parcelle:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    
    if send_method == "email":
        # Generate watermarked PDF
        official_docs = parcelle.get("official_documents", {})
        
        if document_type in official_docs:
            # Handle both single doc (dict) and multiple docs (list)
            doc_data = official_docs[document_type]
            if isinstance(doc_data, list):
                doc_info = doc_data[0] if doc_data else None
            else:
                doc_info = doc_data
            
            if doc_info:
                doc_path = Path(doc_info.get("path", ""))
                
                if doc_path.exists():
                    with open(doc_path, 'rb') as f:
                        original_pdf = f.read()
                    try:
                        pdf_content = add_watermark_to_pdf(original_pdf, client_name, code)
                    except Exception as e:
                        logger.error(f"Error adding watermark: {e}")
                        # Fallback to placeholder
                        pdf_content = create_placeholder_acd_pdf(
                            parcelle_nom=parcelle.get("nom", "Parcelle"),
                            parcelle_ref=parcelle.get("reference_tf", "N/A"),
                            client_name=client_name,
                            access_code=code
                        )
                else:
                    raise HTTPException(status_code=404, detail="Fichier document non trouvé")
            else:
                raise HTTPException(status_code=404, detail="Document non trouvé")
        else:
            # Generate placeholder PDF with watermark
            if document_type == "acd":
                pdf_content = create_placeholder_acd_pdf(
                    parcelle_nom=parcelle.get("nom", "Parcelle"),
                    parcelle_ref=parcelle.get("reference_tf", "N/A"),
                    client_name=client_name,
                    access_code=code
                )
            elif document_type == "plan":
                pdf_content = create_placeholder_plan_pdf(
                    parcelle_nom=parcelle.get("nom", "Parcelle"),
                    parcelle_ref=parcelle.get("reference_tf", "N/A"),
                    superficie=parcelle.get("superficie", 0),
                    client_name=client_name,
                    access_code=code
                )
            elif document_type == "titre_foncier":
                pdf_content = create_placeholder_acd_pdf(
                    parcelle_nom=parcelle.get("nom", "Parcelle"),
                    parcelle_ref=parcelle.get("reference_tf", "N/A"),
                    client_name=client_name,
                    access_code=code
                )
            else:
                pdf_content = create_placeholder_acd_pdf(
                    parcelle_nom=parcelle.get("nom", "Parcelle"),
                    parcelle_ref=parcelle.get("reference_tf", "N/A"),
                    client_name=client_name,
                    access_code=code
                )
        
        # Generate filename
        filename = f"{document_type.upper()}_{parcelle.get('nom', parcelle_id).replace(' ', '_')}.pdf"
        
        # Send email with attachment
        result = await send_document_email(
            recipient_email=recipient,
            client_name=client_name,
            parcelle_nom=parcelle.get("nom", "N/A"),
            parcelle_ref=parcelle.get("reference_tf", "N/A"),
            document_type=document_type,
            pdf_content=pdf_content,
            filename=filename
        )
        
        # Log the send action
        log_download(
            code=code,
            client_name=client_name,
            parcelle_id=parcelle_id,
            document_type=f"{document_type}_sent_via_email",
            document_name=f"{document_type}_{parcelle_id}_to_{recipient}"
        )
        
        if result.get("success"):
            return {
                "success": True,
                "message": result.get("message"),
                "email_id": result.get("email_id"),
                "recipient": recipient
            }
        else:
            if result.get("requires_config"):
                raise HTTPException(status_code=503, detail=result.get("error"))
            raise HTTPException(status_code=500, detail=result.get("error"))
    
    elif send_method == "whatsapp":
        # WhatsApp link generation (handled on frontend now)
        log_download(
            code=code,
            client_name=client_name,
            parcelle_id=parcelle_id,
            document_type=f"{document_type}_sent_via_whatsapp",
            document_name=f"{document_type}_{parcelle_id}_to_{recipient}"
        )
        
        whatsapp_url = f"https://wa.me/2250705509738?text=Bonjour%2C%20je%20suis%20{client_name.replace(' ', '%20')}..."
        return {
            "success": True,
            "message": f"Redirection WhatsApp pour {recipient}",
            "whatsapp_url": whatsapp_url
        }
    else:
        raise HTTPException(status_code=400, detail="Méthode d'envoi non supportée")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Admin login"""
    data = load_data()
    admin = data.get("admin", {})
    
    # Get admin credentials from environment variables
    admin_username = os.environ.get('ADMIN_USERNAME')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_username or not admin_password:
        raise HTTPException(status_code=500, detail="Admin credentials not configured")
    
    if request.username == admin_username and request.password == admin_password:
        token = create_token(request.username)
        return LoginResponse(token=token, username=request.username)
    
    raise HTTPException(status_code=401, detail="Identifiants invalides")

@api_router.get("/auth/verify")
async def verify_auth(username: str = Depends(verify_token)):
    """Verify if token is valid"""
    return {"valid": True, "username": username}

# ==================== ADMIN ROUTES ====================

@api_router.put("/admin/parcelles/{parcelle_id}")
async def update_parcelle(parcelle_id: str, update: ParcelleUpdate, username: str = Depends(verify_token)):
    """Update a parcelle (admin only)"""
    data = load_data()
    parcelles = data.get("parcelles", [])
    
    for i, p in enumerate(parcelles):
        if p["id"] == parcelle_id:
            update_dict = update.model_dump(exclude_unset=True)
            parcelles[i].update(update_dict)
            data["parcelles"] = parcelles
            save_data(data)
            return parcelles[i]
    
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.patch("/admin/parcelles/{parcelle_id}/status")
async def update_parcelle_status(parcelle_id: str, status_update: StatusUpdate, username: str = Depends(verify_token)):
    """Update parcelle status (admin only)"""
    if status_update.statut not in ["disponible", "option", "vendu"]:
        raise HTTPException(status_code=400, detail="Statut invalide")
    
    data = load_data()
    parcelles = data.get("parcelles", [])
    
    for i, p in enumerate(parcelles):
        if p["id"] == parcelle_id:
            parcelles[i]["statut"] = status_update.statut
            data["parcelles"] = parcelles
            save_data(data)
            return {"id": parcelle_id, "statut": status_update.statut}
    
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.post("/admin/upload/image/{parcelle_id}")
async def upload_image(
    parcelle_id: str,
    image_type: str = Form(...),
    file: UploadFile = File(...),
    username: str = Depends(verify_token)
):
    """Upload image for a parcelle"""
    if image_type not in ["photo", "drone"]:
        raise HTTPException(status_code=400, detail="Type d'image invalide")
    
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Type de fichier non autorisé")
    
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{parcelle_id}_{image_type}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    with open(filepath, 'wb') as f:
        content = await file.read()
        f.write(content)
    
    data = load_data()
    parcelles = data.get("parcelles", [])
    
    image_url = f"/uploads/{filename}"
    
    for i, p in enumerate(parcelles):
        if p["id"] == parcelle_id:
            if image_type == "photo":
                parcelles[i].setdefault("photos", []).append(image_url)
            else:
                parcelles[i].setdefault("vues_drone", []).append(image_url)
            data["parcelles"] = parcelles
            save_data(data)
            return {"url": image_url, "type": image_type}
    
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.delete("/admin/parcelles/{parcelle_id}/image")
async def delete_image(
    parcelle_id: str,
    image_url: str,
    image_type: str,
    username: str = Depends(verify_token)
):
    """Delete an image from a parcelle"""
    data = load_data()
    parcelles = data.get("parcelles", [])
    
    for i, p in enumerate(parcelles):
        if p["id"] == parcelle_id:
            if image_type == "photo" and image_url in p.get("photos", []):
                parcelles[i]["photos"].remove(image_url)
            elif image_type == "drone" and image_url in p.get("vues_drone", []):
                parcelles[i]["vues_drone"].remove(image_url)
            
            data["parcelles"] = parcelles
            save_data(data)
            
            try:
                filename = image_url.split('/')[-1]
                filepath = UPLOADS_DIR / filename
                if filepath.exists():
                    filepath.unlink()
            except Exception as e:
                logger.warning(f"Could not delete file: {e}")
            
            return {"deleted": image_url}
    
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.post("/admin/upload/document/{parcelle_id}")
async def upload_official_document(
    parcelle_id: str,
    document_type: str = Form(...),  # acd, plan, extrait_cadastral, etc.
    file: UploadFile = File(...),
    username: str = Depends(verify_token)
):
    """Upload official document (ACD, plan cadastral, etc.) for a parcelle - supports multiple files per type"""
    allowed_types = ["acd", "plan", "extrait_cadastral", "titre_foncier", "autre"]
    if document_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Type de document invalide. Types autorisés: {', '.join(allowed_types)}")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont autorisés")
    
    # Create documents directory for parcelle
    parcelle_docs_dir = DOCUMENTS_DIR / parcelle_id
    parcelle_docs_dir.mkdir(exist_ok=True)
    
    # Save file with unique ID
    doc_id = uuid.uuid4().hex[:8]
    filename = f"{document_type}_{doc_id}.pdf"
    filepath = parcelle_docs_dir / filename
    
    with open(filepath, 'wb') as f:
        content = await file.read()
        f.write(content)
    
    # Update parcelle data
    data = load_data()
    parcelles = data.get("parcelles", [])
    
    document_info = {
        "id": doc_id,
        "type": document_type,
        "filename": filename,
        "original_name": file.filename,
        "path": str(filepath),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": username
    }
    
    for i, p in enumerate(parcelles):
        if p["id"] == parcelle_id:
            # Initialize official_documents if not exists
            if "official_documents" not in parcelles[i]:
                parcelles[i]["official_documents"] = {}
            
            # Support multiple documents per type - store as list
            if document_type not in parcelles[i]["official_documents"]:
                parcelles[i]["official_documents"][document_type] = []
            
            # Handle migration from single doc to list
            existing = parcelles[i]["official_documents"][document_type]
            if isinstance(existing, dict):
                parcelles[i]["official_documents"][document_type] = [existing]
            
            # Add new document to list
            parcelles[i]["official_documents"][document_type].append(document_info)
            
            data["parcelles"] = parcelles
            save_data(data)
            
            doc_count = len(parcelles[i]["official_documents"][document_type])
            logger.info(f"Official document uploaded: {document_type} for parcelle {parcelle_id} (total: {doc_count})")
            return {
                "success": True,
                "document_type": document_type,
                "document_id": doc_id,
                "filename": filename,
                "total_docs": doc_count,
                "message": f"Document {document_type.upper()} uploadé avec succès ({doc_count} fichier(s))"
            }
    
    # Cleanup file if parcelle not found
    if filepath.exists():
        filepath.unlink()
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.delete("/admin/document/{parcelle_id}/{document_type}")
async def delete_official_document(
    parcelle_id: str,
    document_type: str,
    document_id: str = None,
    username: str = Depends(verify_token)
):
    """Delete an official document from a parcelle. If document_id is provided, delete only that file."""
    data = load_data()
    parcelles = data.get("parcelles", [])
    
    for i, p in enumerate(parcelles):
        if p["id"] == parcelle_id:
            official_docs = p.get("official_documents", {})
            if document_type in official_docs:
                docs = official_docs[document_type]
                
                # Handle both single doc (dict) and multiple docs (list)
                if isinstance(docs, dict):
                    docs = [docs]
                
                if document_id:
                    # Delete specific document by ID
                    doc_to_delete = None
                    for doc in docs:
                        if doc.get("id") == document_id:
                            doc_to_delete = doc
                            break
                    
                    if not doc_to_delete:
                        raise HTTPException(status_code=404, detail="Document non trouvé")
                    
                    # Delete file
                    try:
                        filepath = Path(doc_to_delete.get("path", ""))
                        if filepath.exists():
                            filepath.unlink()
                    except Exception as e:
                        logger.warning(f"Could not delete document file: {e}")
                    
                    # Remove from list
                    docs = [d for d in docs if d.get("id") != document_id]
                    
                    if len(docs) == 0:
                        del parcelles[i]["official_documents"][document_type]
                    else:
                        parcelles[i]["official_documents"][document_type] = docs
                else:
                    # Delete all documents of this type
                    for doc in docs:
                        try:
                            filepath = Path(doc.get("path", ""))
                            if filepath.exists():
                                filepath.unlink()
                        except Exception as e:
                            logger.warning(f"Could not delete document file: {e}")
                    
                    del parcelles[i]["official_documents"][document_type]
                
                data["parcelles"] = parcelles
                save_data(data)
                
                return {"success": True, "deleted": document_type, "document_id": document_id}
            else:
                raise HTTPException(status_code=404, detail="Document non trouvé")
    
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.get("/admin/documents/{parcelle_id}")
async def get_parcelle_documents(parcelle_id: str, username: str = Depends(verify_token)):
    """Get all official documents for a parcelle"""
    data = load_data()
    for p in data.get("parcelles", []):
        if p["id"] == parcelle_id:
            return {
                "parcelle_id": parcelle_id,
                "parcelle_nom": p.get("nom", ""),
                "official_documents": p.get("official_documents", {})
            }
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.post("/admin/upload/kmz")
async def upload_kmz(file: UploadFile = File(...), username: str = Depends(verify_token)):
    """Upload and parse KMZ file"""
    if not file.filename.endswith(('.kmz', '.kml')):
        raise HTTPException(status_code=400, detail="Fichier KMZ ou KML requis")
    
    content = await file.read()
    kml_content = None
    
    try:
        if file.filename.endswith('.kmz'):
            import io
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                for name in zf.namelist():
                    if name.endswith('.kml'):
                        kml_content = zf.read(name).decode('utf-8')
                        break
        else:
            kml_content = content.decode('utf-8')
        
        if not kml_content:
            raise HTTPException(status_code=400, detail="Aucun fichier KML trouvé")
        
        new_parcelles = parse_kml_file(kml_content)
        
        if not new_parcelles:
            raise HTTPException(status_code=400, detail="Aucune parcelle trouvée dans le fichier")
        
        kmz_path = ROOT_DIR / 'data' / f"uploaded_{datetime.now().strftime('%Y%m%d_%H%M%S')}.kmz"
        with open(kmz_path, 'wb') as f:
            f.write(content)
        
        return {
            "message": f"{len(new_parcelles)} parcelle(s) détectée(s)",
            "parcelles": new_parcelles
        }
        
    except Exception as e:
        logger.error(f"Error processing KMZ: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

@api_router.post("/admin/parcelles/import")
async def import_parcelles(parcelles: List[dict], username: str = Depends(verify_token)):
    """Import parcelles from KMZ parsing"""
    data = load_data()
    existing_parcelles = data.get("parcelles", [])
    
    for p in parcelles:
        if not any(ep["id"] == p["id"] for ep in existing_parcelles):
            existing_parcelles.append(p)
    
    data["parcelles"] = existing_parcelles
    save_data(data)
    
    return {"imported": len(parcelles), "total": len(existing_parcelles)}

@api_router.delete("/admin/parcelles/{parcelle_id}")
async def delete_parcelle(parcelle_id: str, username: str = Depends(verify_token)):
    """Delete a parcelle"""
    data = load_data()
    parcelles = data.get("parcelles", [])
    
    for i, p in enumerate(parcelles):
        if p["id"] == parcelle_id:
            deleted = parcelles.pop(i)
            data["parcelles"] = parcelles
            save_data(data)
            return {"deleted": parcelle_id}
    
    raise HTTPException(status_code=404, detail="Parcelle non trouvée")

@api_router.put("/admin/config")
async def update_config(config: dict, username: str = Depends(verify_token)):
    """Update map configuration"""
    data = load_data()
    data["config"].update(config)
    save_data(data)
    return data["config"]

# ==================== ACCESS CODE MANAGEMENT ====================

@api_router.post("/admin/access-codes")
async def create_access_code(request: AccessCodeCreate, username: str = Depends(verify_token)):
    """Generate a new access code for a client"""
    data = load_data()
    
    code = generate_access_code()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=request.expires_hours)
    
    code_entry = {
        "id": str(uuid.uuid4()),
        "code": code,
        "client_name": request.client_name,
        "client_email": request.client_email,
        "parcelle_ids": request.parcelle_ids,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": username,
        "active": True,
        "usage_count": 0
    }
    
    data.setdefault("access_codes", []).append(code_entry)
    save_data(data)
    
    logger.info(f"Access code generated for {request.client_name}: {code}")
    
    return {
        "code": code,
        "client_name": request.client_name,
        "expires_at": expires_at.isoformat(),
        "parcelle_access": request.parcelle_ids or "all"
    }

@api_router.get("/admin/access-codes")
async def list_access_codes(username: str = Depends(verify_token)):
    """List all access codes"""
    data = load_data()
    codes = data.get("access_codes", [])
    
    # Add status info
    now = datetime.now(timezone.utc)
    for code in codes:
        expires_at = datetime.fromisoformat(code["expires_at"])
        code["is_expired"] = expires_at < now
    
    return {"access_codes": codes}

@api_router.delete("/admin/access-codes/{code_id}")
async def revoke_access_code(code_id: str, username: str = Depends(verify_token)):
    """Revoke an access code"""
    data = load_data()
    codes = data.get("access_codes", [])
    
    for i, code in enumerate(codes):
        if code["id"] == code_id:
            codes[i]["active"] = False
            data["access_codes"] = codes
            save_data(data)
            return {"revoked": code_id}
    
    raise HTTPException(status_code=404, detail="Code non trouvé")

@api_router.get("/admin/download-logs")
async def get_download_logs(username: str = Depends(verify_token)):
    """Get document download logs"""
    data = load_data()
    logs = data.get("download_logs", [])
    
    # Sort by timestamp descending
    logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return {"logs": logs}

@api_router.get("/admin/download-logs/stats")
async def get_download_stats(username: str = Depends(verify_token)):
    """Get download statistics"""
    data = load_data()
    logs = data.get("download_logs", [])
    
    # Group by code/client
    by_client = {}
    for log in logs:
        client = log.get("client_name", "Unknown")
        if client not in by_client:
            by_client[client] = {"count": 0, "documents": []}
        by_client[client]["count"] += 1
        by_client[client]["documents"].append(log.get("document_name"))
    
    # Group by parcelle
    by_parcelle = {}
    for log in logs:
        parcelle = log.get("parcelle_id", "Unknown")
        if parcelle not in by_parcelle:
            by_parcelle[parcelle] = 0
        by_parcelle[parcelle] += 1
    
    return {
        "total_downloads": len(logs),
        "by_client": by_client,
        "by_parcelle": by_parcelle
    }

@api_router.get("/admin/notifications")
async def get_notifications(
    since: str = None,
    username: str = Depends(verify_token)
):
    """Get recent document access notifications for admin dashboard"""
    data = load_data()
    logs = data.get("download_logs", [])
    
    # Sort by timestamp descending
    logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Filter by timestamp if provided
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
            logs = [l for l in logs if datetime.fromisoformat(l.get("timestamp", "").replace('Z', '+00:00')) > since_dt]
        except:
            pass
    
    # Get recent notifications (last 50)
    recent_logs = logs[:50]
    
    # Count new notifications (last 24 hours)
    now = datetime.now(timezone.utc)
    last_24h = now - timedelta(hours=24)
    new_count = 0
    
    for log in logs:
        try:
            log_time = datetime.fromisoformat(log.get("timestamp", "").replace('Z', '+00:00'))
            if log_time > last_24h:
                new_count += 1
        except:
            pass
    
    return {
        "notifications": recent_logs,
        "new_count": new_count,
        "has_new": new_count > 0,
        "last_check": now.isoformat()
    }

@api_router.get("/admin/access-logs/realtime")
async def get_realtime_access_logs(
    limit: int = 20,
    username: str = Depends(verify_token)
):
    """Get real-time access logs for the Journal d'accès"""
    data = load_data()
    logs = data.get("download_logs", [])
    parcelles = {p["id"]: p for p in data.get("parcelles", [])}
    
    # Sort by timestamp descending
    logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Enrich logs with parcelle names
    enriched_logs = []
    for log in logs[:limit]:
        parcelle = parcelles.get(log.get("parcelle_id"), {})
        enriched_log = {
            **log,
            "parcelle_nom": parcelle.get("nom", log.get("parcelle_id")),
            "relative_time": get_relative_time(log.get("timestamp"))
        }
        enriched_logs.append(enriched_log)
    
    return {
        "logs": enriched_logs,
        "total": len(logs)
    }

def get_relative_time(timestamp_str: str) -> str:
    """Convert timestamp to relative time string"""
    try:
        ts = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        diff = now - ts
        
        if diff.total_seconds() < 60:
            return "À l'instant"
        elif diff.total_seconds() < 3600:
            mins = int(diff.total_seconds() / 60)
            return f"Il y a {mins} min"
        elif diff.total_seconds() < 86400:
            hours = int(diff.total_seconds() / 3600)
            return f"Il y a {hours}h"
        else:
            days = int(diff.total_seconds() / 86400)
            return f"Il y a {days}j"
    except:
        return ""

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    logger.info("Songon Extension API v1.1.0 started")
    (ROOT_DIR / 'data').mkdir(exist_ok=True)
    UPLOADS_DIR.mkdir(exist_ok=True)
    DOCUMENTS_DIR.mkdir(exist_ok=True)

@app.on_event("shutdown")
async def shutdown():
    logger.info("Songon Extension API shutdown")
