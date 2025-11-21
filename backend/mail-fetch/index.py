"""
Business: Fetch emails from IMAP server by folder
Args: event - dict with httpMethod, headers with X-User-Email and X-User-Password, queryStringParameters with folder
      context - object with request_id attribute
Returns: HTTP response with list of emails
"""

import json
import imaplib
import email
from email.header import decode_header
from typing import Dict, Any, List
import base64

def decode_mime_words(s: str) -> str:
    """Decode MIME encoded strings"""
    decoded_parts = []
    for part, encoding in decode_header(s):
        if isinstance(part, bytes):
            decoded_parts.append(part.decode(encoding or 'utf-8', errors='ignore'))
        else:
            decoded_parts.append(part)
    return ''.join(decoded_parts)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email, X-User-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
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
        
        params = event.get('queryStringParameters', {}) or {}
        folder = params.get('folder', 'INBOX')
        limit = int(params.get('limit', '20'))
        
        imap_server = 'imap.reg.ru'
        imap_port = 993
        
        mail = imaplib.IMAP4_SSL(imap_server, imap_port)
        mail.login(user_email, user_password)
        
        folder_map = {
            'inbox': 'INBOX',
            'sent': 'Sent',
            'drafts': 'Drafts',
            'spam': 'Spam',
            'trash': 'Trash'
        }
        
        imap_folder = folder_map.get(folder.lower(), 'INBOX')
        mail.select(imap_folder)
        
        status, messages = mail.search(None, 'ALL')
        email_ids = messages[0].split()
        email_ids = email_ids[-limit:] if len(email_ids) > limit else email_ids
        email_ids.reverse()
        
        emails: List[Dict[str, Any]] = []
        
        for email_id in email_ids:
            status, msg_data = mail.fetch(email_id, '(RFC822)')
            
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    
                    subject = decode_mime_words(msg.get('Subject', 'Без темы'))
                    from_header = decode_mime_words(msg.get('From', ''))
                    date_header = msg.get('Date', '')
                    
                    body = ''
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == 'text/plain':
                                try:
                                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                    break
                                except:
                                    pass
                    else:
                        try:
                            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                        except:
                            body = ''
                    
                    preview = body[:200] if body else ''
                    
                    emails.append({
                        'id': int(email_id),
                        'from': from_header,
                        'subject': subject,
                        'preview': preview,
                        'date': date_header,
                        'content': body,
                        'isRead': True,
                        'hasAttachment': False,
                        'isStarred': False
                    })
        
        mail.logout()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'emails': emails,
                'folder': folder,
                'count': len(emails)
            }),
            'isBase64Encoded': False
        }
        
    except imaplib.IMAP4.error as e:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Authentication failed or folder not found'
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
