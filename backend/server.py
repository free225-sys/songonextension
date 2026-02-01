from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import shutil
import zipfile
import xml.etree.ElementTree as ET

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Data file paths
DATA_FILE = ROOT_DIR / 'data' / 'parcelles.json'
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'songon-extension-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="Songon Extension API", version="1.0.0")

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

# ==================== HELPERS ====================

def load_data():
    """Load data from JSON file"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"parcelles": [], "config": {"map_center": [-4.287, 5.345], "map_zoom": 15}, "admin": {}}

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

def parse_kml_file(kml_content: str) -> List[dict]:
    """Parse KML content and extract polygons"""
    parcelles = []
    try:
        root = ET.fromstring(kml_content)
        ns = {'kml': 'http://www.opengis.net/kml/2.2'}
        
        # Try with namespace first, then without
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
    return {"message": "Songon Extension API", "version": "1.0.0"}

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

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Admin login"""
    data = load_data()
    admin = data.get("admin", {})
    
    # Default admin credentials for demo
    if request.username == "admin" and request.password == "songon2024":
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
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Type de fichier non autorisé")
    
    # Create unique filename
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{parcelle_id}_{image_type}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    # Save file
    with open(filepath, 'wb') as f:
        content = await file.read()
        f.write(content)
    
    # Update parcelle data
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
            
            # Try to delete file
            try:
                filename = image_url.split('/')[-1]
                filepath = UPLOADS_DIR / filename
                if filepath.exists():
                    filepath.unlink()
            except Exception as e:
                logger.warning(f"Could not delete file: {e}")
            
            return {"deleted": image_url}
    
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
            # Extract KML from KMZ
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
        
        # Parse KML
        new_parcelles = parse_kml_file(kml_content)
        
        if not new_parcelles:
            raise HTTPException(status_code=400, detail="Aucune parcelle trouvée dans le fichier")
        
        # Save KMZ file
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
    
    # Add new parcelles
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
    logger.info("Songon Extension API started")
    # Ensure data directory exists
    (ROOT_DIR / 'data').mkdir(exist_ok=True)
    UPLOADS_DIR.mkdir(exist_ok=True)

@app.on_event("shutdown")
async def shutdown():
    logger.info("Songon Extension API shutdown")
