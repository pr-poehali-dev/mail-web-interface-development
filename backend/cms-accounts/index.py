"""
Business: Manage mail accounts - create, list, update, delete
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with request_id attribute
Returns: HTTP response with accounts data or operation status
"""

import json
import os
import hashlib
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Get database connection using DATABASE_URL env variable"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not configured')
    return psycopg2.connect(dsn)

def hash_password(password: str) -> str:
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cur.execute("""
                SELECT id, email, full_name, quota_mb, is_active, 
                       created_at::text, updated_at::text
                FROM mail_accounts
                ORDER BY created_at DESC
            """)
            accounts = cur.fetchall()
            
            result = []
            for acc in accounts:
                result.append({
                    'id': acc['id'],
                    'email': acc['email'],
                    'full_name': acc['full_name'],
                    'quota_mb': acc['quota_mb'],
                    'is_active': acc['is_active'],
                    'created_at': acc['created_at'],
                    'updated_at': acc['updated_at']
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'accounts': result,
                    'total': len(result)
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_str = event.get('body', '{}')
            if not body_str or body_str.strip() == '':
                body_str = '{}'
            body_data = json.loads(body_str)
            
            email = body_data.get('email', '')
            password = body_data.get('password', '')
            full_name = body_data.get('fullName', '')
            quota_mb = body_data.get('quotaMb', 1024)
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Email and password required'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cur.execute("""
                SELECT id FROM domains WHERE domain_name = 'nargizamail.ru'
            """)
            domain = cur.fetchone()
            domain_id = domain['id'] if domain else None
            
            cur.execute("""
                INSERT INTO mail_accounts (domain_id, email, password_hash, full_name, quota_mb)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (domain_id, email, password_hash, full_name, quota_mb))
            
            account_id = cur.fetchone()['id']
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'Account created',
                    'account_id': account_id
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
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
