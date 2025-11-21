"""
Business: Send email via SMTP server
Args: event - dict with httpMethod, headers with X-User-Email and X-User-Password, body with to, subject, content
      context - object with request_id attribute
Returns: HTTP response with send status
"""

import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email, X-User-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        headers = event.get('headers', {})
        user_email = headers.get('x-user-email', headers.get('X-User-Email', ''))
        user_password = headers.get('x-user-password', headers.get('X-User-Password', ''))
        
        if not user_email or not user_password:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Authentication required'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        to_email = body_data.get('to', '')
        subject = body_data.get('subject', '')
        content = body_data.get('content', '')
        
        if not to_email or not subject or not content:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'To, subject and content are required'}),
                'isBase64Encoded': False
            }
        
        msg = MIMEMultipart('alternative')
        msg['From'] = user_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        text_part = MIMEText(content, 'plain', 'utf-8')
        msg.attach(text_part)
        
        smtp_server = 'smtp.reg.ru'
        smtp_port = 465
        
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(user_email, user_password)
            server.send_message(msg)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Email sent successfully',
                'to': to_email
            }),
            'isBase64Encoded': False
        }
        
    except smtplib.SMTPAuthenticationError:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Authentication failed'
            }),
            'isBase64Encoded': False
        }
    except smtplib.SMTPException as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': f'SMTP error: {str(e)}'
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': f'Server error: {str(e)}'
            }),
            'isBase64Encoded': False
        }
