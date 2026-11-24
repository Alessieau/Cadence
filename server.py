#!/usr/bin/env python3
"""
Cadence — Serveur Local de Persistance Ultra-Léger
Fournit le service statique et l'API de synchronisation avec data.json.
Consommation RAM : ~12 Mo. Zéro dépendance externe.
"""

import http.server
import socketserver
import json
import os
import sys

PORT = 5050
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')

class CadenceHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # En-têtes CORS et pas de cache pour l'API
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.end_headers()
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                self.wfile.write(b'{}')
            return

        elif self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            status = {
                'status': 'online',
                'dataFile': os.path.basename(DATA_FILE),
                'dataFileSize': os.path.getsize(DATA_FILE) if os.path.exists(DATA_FILE) else 0
            }
            self.wfile.write(json.dumps(status).encode('utf-8'))
            return

        # Fichiers statiques (index.html, styles.css, app.js...)
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/data':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                
                # Validation JSON avant écriture
                parsed = json.loads(body)
                
                # Écriture atomique sécurisée (fichier temporaire puis remplacement)
                temp_file = DATA_FILE + '.tmp'
                with open(temp_file, 'w', encoding='utf-8') as f:
                    json.dump(parsed, f, ensure_ascii=False, indent=2)
                os.replace(temp_file, DATA_FILE)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok', 'saved': True}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), CadenceHandler) as httpd:
                print(f"[Cadence Server] En écoute sur http://localhost:{port}")
                print(f"[Cadence Server] Persistance liée à : {DATA_FILE}")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError as e:
            if attempt < 4:
                port += 1
            else:
                raise e

if __name__ == '__main__':
    run_server()
