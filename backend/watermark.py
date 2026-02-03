# PDF Watermarking utilities
import io
from pathlib import Path
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import Color
from reportlab.lib.utils import ImageReader
from PyPDF2 import PdfReader, PdfWriter
import logging

logger = logging.getLogger(__name__)

def create_watermark_pdf(
    client_name: str,
    access_code: str,
    page_size: tuple = A4
) -> io.BytesIO:
    """Create a watermark PDF page"""
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=page_size)
    width, height = page_size
    
    # Semi-transparent gray color
    c.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.15))
    
    # Watermark text
    watermark_text = f"Document préparé pour {client_name}"
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
    code_text = f"Code: {access_code} - {timestamp}"
    
    # Main diagonal watermark (repeated)
    c.saveState()
    c.translate(width / 2, height / 2)
    c.rotate(45)
    
    # Large main watermark
    c.setFont("Helvetica-Bold", 40)
    c.drawCentredString(0, 50, watermark_text)
    c.setFont("Helvetica", 20)
    c.drawCentredString(0, 10, code_text)
    
    c.restoreState()
    
    # Additional watermarks in corners
    c.setFillColor(Color(0.4, 0.4, 0.4, alpha=0.1))
    c.setFont("Helvetica", 12)
    
    # Top-left
    c.saveState()
    c.translate(50, height - 30)
    c.drawString(0, 0, f"Confidentiel - {client_name}")
    c.restoreState()
    
    # Bottom-right
    c.saveState()
    c.translate(width - 200, 20)
    c.drawString(0, 0, f"Code: {access_code}")
    c.restoreState()
    
    # Legal notice at bottom center
    c.setFillColor(Color(0.3, 0.3, 0.3, alpha=0.2))
    c.setFont("Helvetica", 8)
    legal_text = "Ce document est strictement confidentiel - Reproduction interdite"
    c.drawCentredString(width / 2, 10, legal_text)
    
    c.save()
    packet.seek(0)
    return packet


def add_watermark_to_pdf(
    pdf_content: bytes,
    client_name: str,
    access_code: str
) -> bytes:
    """Add watermark to all pages of a PDF"""
    try:
        # Create watermark
        watermark_packet = create_watermark_pdf(client_name, access_code)
        watermark_pdf = PdfReader(watermark_packet)
        watermark_page = watermark_pdf.pages[0]
        
        # Read original PDF
        original_pdf = PdfReader(io.BytesIO(pdf_content))
        output_pdf = PdfWriter()
        
        # Apply watermark to each page
        for page in original_pdf.pages:
            page.merge_page(watermark_page)
            output_pdf.add_page(page)
        
        # Write output
        output_buffer = io.BytesIO()
        output_pdf.write(output_buffer)
        output_buffer.seek(0)
        
        return output_buffer.read()
    
    except Exception as e:
        logger.error(f"Error adding watermark: {e}")
        raise


def create_placeholder_acd_pdf(
    parcelle_nom: str,
    parcelle_ref: str,
    client_name: str,
    access_code: str
) -> bytes:
    """Create a placeholder ACD document with watermark"""
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    width, height = A4
    
    # Header background
    c.setFillColor(Color(0.06, 0.45, 0.31))  # Green color
    c.rect(0, height - 120, width, 120, fill=1)
    
    # Header text
    c.setFillColor(Color(1, 1, 1))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 50, "ARRÊTÉ DE CONCESSION DÉFINITIVE")
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 75, "République de Côte d'Ivoire")
    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 95, "Ministère de la Construction et de l'Urbanisme")
    
    # Document content
    c.setFillColor(Color(0, 0, 0))
    y_pos = height - 160
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_pos, f"Référence : {parcelle_ref}")
    y_pos -= 30
    
    c.setFont("Helvetica", 12)
    content_lines = [
        f"Objet : Concession définitive du terrain dénommé \"{parcelle_nom}\"",
        "",
        "Vu la Constitution de la République de Côte d'Ivoire ;",
        "Vu la loi n° 98-750 du 23 décembre 1998 relative au domaine foncier rural ;",
        "Vu le décret n° 99-593 du 13 octobre 1999 portant organisation du Ministère",
        "de l'Agriculture et des Ressources Animales ;",
        "",
        "Article 1 : Il est accordé à [PROPRIÉTAIRE] une concession définitive",
        f"sur le terrain immatriculé sous la référence {parcelle_ref}, situé à Songon M'Braté,",
        "commune de Songon, région des Grands Ponts.",
        "",
        "Article 2 : Le présent arrêté sera publié au Journal Officiel de la République",
        "de Côte d'Ivoire.",
        "",
        "Fait à Abidjan, le ____/____/20__",
        "",
        "",
        "Le Ministre de la Construction",
        "et de l'Urbanisme",
        "",
        "",
        "[Signature et cachet]"
    ]
    
    for line in content_lines:
        c.drawString(50, y_pos, line)
        y_pos -= 18
    
    # Watermark overlay
    c.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.15))
    c.saveState()
    c.translate(width / 2, height / 2)
    c.rotate(45)
    c.setFont("Helvetica-Bold", 35)
    c.drawCentredString(0, 30, f"Document préparé pour")
    c.drawCentredString(0, -15, client_name)
    c.setFont("Helvetica", 16)
    c.drawCentredString(0, -50, f"Code: {access_code}")
    c.restoreState()
    
    # Footer
    c.setFillColor(Color(0.5, 0.5, 0.5))
    c.setFont("Helvetica", 8)
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
    c.drawCentredString(width / 2, 30, f"Document généré le {timestamp} - Code d'accès: {access_code}")
    c.drawCentredString(width / 2, 18, "Ce document est strictement confidentiel. Reproduction interdite.")
    
    c.save()
    packet.seek(0)
    return packet.read()


def create_placeholder_plan_pdf(
    parcelle_nom: str,
    parcelle_ref: str,
    superficie: float,
    client_name: str,
    access_code: str
) -> bytes:
    """Create a placeholder cadastral plan with watermark"""
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    width, height = A4
    
    # Header
    c.setFillColor(Color(0.06, 0.45, 0.31))
    c.rect(0, height - 80, width, 80, fill=1)
    
    c.setFillColor(Color(1, 1, 1))
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 40, "PLAN CADASTRAL")
    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 60, f"Parcelle : {parcelle_nom} - Ref: {parcelle_ref}")
    
    # Plan area (placeholder)
    c.setStrokeColor(Color(0, 0, 0))
    c.setFillColor(Color(0.95, 0.95, 0.95))
    c.rect(50, 200, width - 100, height - 350, fill=1, stroke=1)
    
    # Grid lines
    c.setStrokeColor(Color(0.8, 0.8, 0.8))
    for i in range(1, 10):
        x = 50 + i * (width - 100) / 10
        c.line(x, 200, x, height - 150)
    for i in range(1, 8):
        y = 200 + i * (height - 350) / 8
        c.line(50, y, width - 50, y)
    
    # Parcel outline (placeholder polygon)
    c.setStrokeColor(Color(0, 0.5, 0))
    c.setFillColor(Color(0, 0.8, 0, 0.2))
    c.setLineWidth(3)
    
    # Draw a sample polygon
    path = c.beginPath()
    path.moveTo(150, 300)
    path.lineTo(350, 280)
    path.lineTo(400, 450)
    path.lineTo(380, 550)
    path.lineTo(200, 520)
    path.lineTo(150, 300)
    c.drawPath(path, fill=1, stroke=1)
    
    # Legend
    c.setFillColor(Color(0, 0, 0))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, 170, "LÉGENDE:")
    c.setFont("Helvetica", 9)
    c.setFillColor(Color(0, 0.8, 0, 0.5))
    c.rect(60, 150, 15, 10, fill=1)
    c.setFillColor(Color(0, 0, 0))
    c.drawString(80, 152, f"Surface: {superficie} ha")
    
    # Technical info
    c.setFont("Helvetica", 9)
    c.drawString(60, 130, f"Coordonnées: N 5°20' W 4°17'")
    c.drawString(60, 118, f"Échelle: 1/2000")
    
    # Watermark
    c.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.12))
    c.saveState()
    c.translate(width / 2, height / 2 + 50)
    c.rotate(45)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(0, 20, f"Document préparé pour")
    c.drawCentredString(0, -20, client_name)
    c.setFont("Helvetica", 14)
    c.drawCentredString(0, -50, f"Code: {access_code}")
    c.restoreState()
    
    # Footer
    c.setFillColor(Color(0.5, 0.5, 0.5))
    c.setFont("Helvetica", 8)
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
    c.drawCentredString(width / 2, 40, f"Document généré le {timestamp} - Code: {access_code}")
    c.drawCentredString(width / 2, 28, "Document confidentiel - Reproduction interdite")
    
    c.save()
    packet.seek(0)
    return packet.read()
