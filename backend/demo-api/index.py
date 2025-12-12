import json
import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

class DemoEntry(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Облачная функция для работы с демо-записями в базе данных.
    Поддерживает операции: GET (получить все), POST (создать), DELETE (удалить по ID).
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('SELECT id, title, description, created_at FROM demo_entries ORDER BY created_at DESC')
                entries = cur.fetchall()
                
                entries_list = []
                for entry in entries:
                    entries_list.append({
                        'id': entry['id'],
                        'title': entry['title'],
                        'description': entry['description'],
                        'created_at': entry['created_at'].isoformat() if entry['created_at'] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'entries': entries_list}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            entry = DemoEntry(**body_data)
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    'INSERT INTO demo_entries (title, description) VALUES (%s, %s) RETURNING id, title, description, created_at',
                    (entry.title, entry.description)
                )
                new_entry = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'id': new_entry['id'],
                        'title': new_entry['title'],
                        'description': new_entry['description'],
                        'created_at': new_entry['created_at'].isoformat()
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            entry_id = params.get('id')
            
            if not entry_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID is required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                cur.execute('DELETE FROM demo_entries WHERE id = %s', (entry_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
