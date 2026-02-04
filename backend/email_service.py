# Email service for sending documents with Resend
import os
import asyncio
import logging
import base64
from datetime import datetime
import resend
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Resend with API key
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
SENDER_NAME = os.environ.get('SENDER_NAME', 'Songon Extension')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend API initialized")
else:
    logger.warning("RESEND_API_KEY not configured - email sending disabled")


def generate_email_html(client_name: str, parcelle_nom: str, parcelle_ref: str, document_type: str) -> str:
    """Generate professional HTML email template"""
    
    document_label = {
        'acd': 'Arrêté de Concession Définitive (ACD)',
        'plan': 'Plan cadastral / Bornage',
        'titre_foncier': 'Titre Foncier',
        'extrait_cadastral': 'Extrait cadastral'
    }.get(document_type, document_type.replace('_', ' ').title())
    
    current_year = datetime.now().year
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f5132 0%, #198754 100%); padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Songon Extension</h1>
                                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Documents Officiels Sécurisés</p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Bonjour {client_name},</h2>
                                
                                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Suite à votre demande, veuillez trouver ci-joint le document officiel concernant la parcelle suivante :
                                </p>
                                
                                <!-- Parcelle Info Box -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="color: #666; font-size: 12px; text-transform: uppercase;">Parcelle</span><br>
                                                        <span style="color: #333; font-size: 16px; font-weight: 600;">{parcelle_nom}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="color: #666; font-size: 12px; text-transform: uppercase;">Référence</span><br>
                                                        <span style="color: #333; font-size: 16px; font-weight: 600;">{parcelle_ref}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="color: #666; font-size: 12px; text-transform: uppercase;">Document</span><br>
                                                        <span style="color: #198754; font-size: 16px; font-weight: 600;">{document_label}</span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Security Notice -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
                                    <tr>
                                        <td style="padding: 15px;">
                                            <p style="color: #856404; font-size: 14px; margin: 0;">
                                                <strong>⚠️ Avertissement :</strong> Ce document est strictement confidentiel et personnalisé avec un filigrane numérique à votre nom. Toute reproduction ou diffusion non autorisée est interdite.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                                    Pour toute question concernant ce document ou votre projet d'investissement, n'hésitez pas à nous contacter.
                                </p>
                                
                                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                                    Cordialement,<br>
                                    <strong>L'équipe Songon Extension</strong>
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Contact Section -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #eee;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="text-align: center;">
                                            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                                                📞 +225 07 05 50 97 38 &nbsp;&nbsp;|&nbsp;&nbsp; 📧 contact@songonextension.com
                                            </p>
                                            <p style="color: #666; font-size: 14px; margin: 0;">
                                                📍 Songon M'Braté, Abidjan - Côte d'Ivoire
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #0f5132; padding: 20px 30px; text-align: center;">
                                <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">
                                    © {current_year} Songon Extension - One Green Dev. Tous droits réservés.
                                </p>
                                <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 10px 0 0 0;">
                                    Ce message a été envoyé automatiquement suite à votre demande de documents.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    return html


async def send_document_email(
    recipient_email: str,
    client_name: str,
    parcelle_nom: str,
    parcelle_ref: str,
    document_type: str,
    pdf_content: bytes,
    filename: str
) -> dict:
    """Send email with PDF document attachment"""
    
    if not RESEND_API_KEY:
        logger.error("RESEND_API_KEY not configured")
        return {
            "success": False,
            "error": "Service email non configuré. Veuillez contacter l'administrateur.",
            "requires_config": True
        }
    
    # Generate email content
    html_content = generate_email_html(client_name, parcelle_nom, parcelle_ref, document_type)
    
    # Document type label for subject
    document_label = {
        'acd': 'ACD',
        'plan': 'Plan cadastral',
        'titre_foncier': 'Titre Foncier',
        'extrait_cadastral': 'Extrait cadastral'
    }.get(document_type, document_type.replace('_', ' ').title())
    
    # Prepare email params with attachment
    params = {
        "from": f"{SENDER_NAME} <{SENDER_EMAIL}>",
        "to": [recipient_email],
        "subject": f"Vos documents officiels - Parcelle {parcelle_nom} - Songon Extension",
        "html": html_content,
        "attachments": [
            {
                "filename": filename,
                "content": base64.b64encode(pdf_content).decode('utf-8'),
                "content_type": "application/pdf"
            }
        ]
    }
    
    try:
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        
        logger.info(f"Email sent successfully to {recipient_email} - ID: {email_response.get('id')}")
        
        return {
            "success": True,
            "message": f"Document envoyé par email à {recipient_email}",
            "email_id": email_response.get("id"),
            "recipient": recipient_email
        }
        
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
        return {
            "success": False,
            "error": f"Erreur lors de l'envoi: {str(e)}",
            "recipient": recipient_email
        }
