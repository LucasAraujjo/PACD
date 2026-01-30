"""
Serverless function para listar atividades do Google Sheets
Endpoint: GET /api/listar-atividades
"""
import os
import json
from http.server import BaseHTTPRequestHandler

import gspread
from google.oauth2.service_account import Credentials


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

SPREADSHEET_NAME = "PACD_DADOS"


def get_google_credentials():
    """Cria credenciais do Google a partir de variáveis de ambiente"""
    return Credentials.from_service_account_info(
        {
            "type": os.environ.get("GOOGLE_TYPE", "service_account"),
            "project_id": os.environ["GOOGLE_PROJECT_ID"],
            "private_key_id": os.environ["GOOGLE_PRIVATE_KEY_ID"],
            "private_key": os.environ["GOOGLE_PRIVATE_KEY"].replace("\\n", "\n"),
            "client_email": os.environ["GOOGLE_CLIENT_EMAIL"],
            "client_id": os.environ["GOOGLE_CLIENT_ID"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.environ['GOOGLE_CLIENT_EMAIL']}",
        },
        scopes=SCOPES
    )


def listar_atividades():
    """
    Lista todas as atividades com seus dados detalhados (simulados e questões)

    Returns:
        list: Lista de atividades com dados completos
    """
    print("📊 Função listar_atividades iniciada")

    try:
        # Conectar ao Google Sheets
        print("🔑 Obtendo credenciais do Google...")
        creds = get_google_credentials()
        print("✅ Credenciais obtidas")

        print("🔗 Autorizando cliente gspread...")
        client = gspread.authorize(creds)
        print("✅ Cliente autorizado")

        print(f"📁 Abrindo planilha '{SPREADSHEET_NAME}'...")
        planilha = client.open(SPREADSHEET_NAME)
        print("✅ Planilha aberta")

        # Ler aba 'atividades'
        print("📄 Lendo aba 'atividades'...")
        aba_atividades = planilha.worksheet("atividades")
        dados_atividades = aba_atividades.get_all_records()
        print(f"✅ {len(dados_atividades)} atividades encontradas")

        # Ler aba 'simulados'
        print("📄 Lendo aba 'simulados'...")
        aba_simulados = planilha.worksheet("simulados")
        dados_simulados = aba_simulados.get_all_records()
        print(f"✅ {len(dados_simulados)} simulados encontrados")

        # Ler aba 'questoes'
        print("📄 Lendo aba 'questoes'...")
        aba_questoes = planilha.worksheet("questoes")
        dados_questoes = aba_questoes.get_all_records()
        print(f"✅ {len(dados_questoes)} questões encontradas")

        # Criar índices para busca rápida
        simulados_por_atividade = {s['id_atividade']: s for s in dados_simulados}
        questoes_por_atividade = {q['id_atividade']: q for q in dados_questoes}

        # Mesclar dados
        atividades_completas = []
        for atividade in dados_atividades:
            id_atividade = atividade['id_atividade']
            tipo = atividade['tipo']

            # Criar objeto base
            atividade_completa = {
                'id_atividade': id_atividade,
                'titulo': atividade['titulo'],
                'tipo': tipo,
                'tempo_total': atividade['tempo_total'],
                'data_inclusao': atividade['data_inclusao']
            }

            # Adicionar dados específicos baseado no tipo
            if tipo == 'Simulado' and id_atividade in simulados_por_atividade:
                simulado = simulados_por_atividade[id_atividade]
                atividade_completa.update({
                    'id_secundario': simulado.get('id_simulado', ''),
                    'data_execucao': simulado.get('data_execucao', ''),
                    'area': simulado.get('area', ''),
                    'questoes': simulado.get('questoes', ''),
                    'acertos': simulado.get('acertos', ''),
                    'comentarios': simulado.get('comentarios', '')
                })
            elif tipo == 'Questões' and id_atividade in questoes_por_atividade:
                questao = questoes_por_atividade[id_atividade]
                atividade_completa.update({
                    'id_secundario': questao.get('id_questao', ''),
                    'data_execucao': questao.get('data_execucao', ''),
                    'area': questao.get('area', ''),
                    'materia': questao.get('materia', ''),
                    'assunto': questao.get('assunto', ''),
                    'questoes': questao.get('questoes', ''),
                    'acertos': questao.get('acertos', ''),
                    'comentarios': questao.get('comentarios', '')
                })

            atividades_completas.append(atividade_completa)

        print(f"✅ {len(atividades_completas)} atividades completas montadas")
        return atividades_completas

    except Exception as e:
        print(f"❌ ERRO em listar_atividades: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


class handler(BaseHTTPRequestHandler):
    """Handler para Vercel Serverless Functions"""

    def do_GET(self):
        """Processa requisição GET"""
        print("=" * 60)
        print("🚀 INICIANDO PROCESSAMENTO DA REQUISIÇÃO GET")
        print("=" * 60)

        try:
            # Listar atividades
            print("📋 Listando atividades...")
            atividades = listar_atividades()
            print(f"✅ {len(atividades)} atividades retornadas")

            # Retornar sucesso
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            resultado = {
                "success": True,
                "data": atividades,
                "total": len(atividades)
            }

            print(f"📤 Enviando resposta de sucesso")
            self.wfile.write(json.dumps(resultado).encode())
            print("✅ REQUISIÇÃO PROCESSADA COM SUCESSO!")

        except Exception as e:
            print(f"❌ ERRO DURANTE PROCESSAMENTO: {str(e)}")
            print(f"📚 Tipo do erro: {type(e).__name__}")
            import traceback
            print(f"🔍 Traceback completo:")
            traceback.print_exc()

            # Retornar erro
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__
            }
            print(f"📤 Enviando resposta de erro: {error_response}")
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        """Processa requisição OPTIONS para CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
