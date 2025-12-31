import os
import logging
from dotenv import load_dotenv
from pathlib import Path
from typing import Optional, Tuple

BASE_DIR = Path(__file__).parent.parent
load_dotenv(BASE_DIR / ".env")

logger = logging.getLogger(__name__)

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_FROM_EMAIL = os.getenv("BREVO_FROM_EMAIL")
BREVO_FROM_NAME = os.getenv("BREVO_FROM_NAME", "EcoImpact AI")


def _get_email_html(verification_url: str, name: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(to right, #00FF6F, #01D6DF); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .header h1 {{ color: #0A0D0B; margin: 0; font-size: 24px; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(to right, #00FF6F, #01D6DF); color: #0A0D0B; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>EcoImpact AI</h1>
        </div>
        <div class="content">
            <p>Hi {name},</p>
            <p>Thank you for signing up for EcoImpact AI! Please verify your email address to complete your registration.</p>
            <p style="text-align: center;">
                <a href="{verification_url}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{verification_url}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2025 EcoImpact AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>"""


def send_verification_email(email: str, verification_token: str, full_name: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    if not BREVO_API_KEY:
        logger.error("BREVO_API_KEY not found in environment variables")
        return False, "Email service is not configured. Please contact support."
    
    if not BREVO_FROM_EMAIL:
        logger.error("BREVO_FROM_EMAIL not found in environment variables")
        return False, "Email service is not configured. Please contact support."
    
    try:
        from sib_api_v3_sdk.rest import ApiException
        from sib_api_v3_sdk import TransactionalEmailsApi, SendSmtpEmail, SendSmtpEmailSender
        from sib_api_v3_sdk.configuration import Configuration
        from sib_api_v3_sdk.api_client import ApiClient
    except ImportError:
        logger.error("sib-api-v3-sdk package not installed. Run: pip install sib-api-v3-sdk")
        return False, "Email service is temporarily unavailable. Please try again later."
    
    try:
        configuration = Configuration()
        configuration.api_key['api-key'] = BREVO_API_KEY
        api_instance = TransactionalEmailsApi(ApiClient(configuration))
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        verification_url = f"{frontend_url}/verify-email?token={verification_token}"
        name = full_name or "User"
        html_content = _get_email_html(verification_url, name)
        
        sender = SendSmtpEmailSender(email=BREVO_FROM_EMAIL, name=BREVO_FROM_NAME)
        send_smtp_email = SendSmtpEmail(
            sender=sender,
            to=[{"email": email}],
            subject="Verify Your EcoImpact AI Email Address",
            html_content=html_content
        )
        
        try:
            api_response = api_instance.send_transac_email(send_smtp_email)
            logger.info(f"Verification email sent to {email}, message ID: {api_response.message_id}")
            return True, None
        except ApiException as api_error:
            error_body = api_error.body if hasattr(api_error, 'body') else str(api_error)
            error_status = api_error.status if hasattr(api_error, 'status') else None
            logger.error(f"Brevo API exception - Status: {error_status}, Body: {error_body}", exc_info=True)
            
            error_str = str(error_body).lower()
            if error_status == 429 or "rate limit" in error_str or "quota" in error_str:
                return False, "Email service is temporarily unavailable due to high demand. Please try again in a few minutes."
            if error_status == 401 or error_status == 403 or "unauthorized" in error_str or "invalid" in error_str or "forbidden" in error_str:
                return False, "Email service configuration error. Please check your API key and sender email settings."
            if "sender" in error_str or "not verified" in error_str:
                return False, "Sender email not verified. Please verify your sender email in Brevo dashboard."
            return False, "Failed to send verification email. Please try again later."
        except Exception as send_error:
            error_msg = str(send_error).lower()
            logger.error(f"Unexpected error sending email: {send_error}", exc_info=True)
            return False, "Failed to send verification email. Please try again later."
            
    except Exception as e:
        logger.error(f"Unexpected error sending verification email: {e}", exc_info=True)
        return False, "An unexpected error occurred. Please try again later."

