"""
Serverless function para criar nova atividade no Google Sheets
Endpoint: POST /api/criar-atividade
"""
import os
import json
import random
from datetime import datetime
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


def gerar_id_atividade():
    """Gera ID único baseado em timestamp"""
    base = datetime.now().strftime("%H%M")
    rand = random.randint(0, 3)

    id_atividade = f"{base}{rand}"

    return id_atividade


def gerar_id_simulado():
    """Gera ID único para simulado"""
    base = datetime.now().strftime("%H%M%S")
    rand = random.randint(0, 9)
    return f"SIM{base}{rand}"


def gerar_id_questao():
    """Gera ID único para questão"""
    base = datetime.now().strftime("%H%M%S")
    rand = random.randint(0, 9)
    return f"QST{base}{rand}"

def gerar_id_redacao():
    """Gera ID único para redação"""
    base = datetime.now().strftime("%H%M%S")
    rand = random.randint(0, 9)
    return f"RDC{base}{rand}"


def inserir_simulado(planilha, id_atividade, dados):
    """
    Insere um registro de simulado na aba 'simulados'

    Args:
        planilha: Objeto da planilha Google Sheets
        id_atividade: ID da atividade relacionada
        dados: Dicionário com os dados do simulado

    Returns:
        str: ID do simulado criado
    """
    print("📊 Função inserir_simulado iniciada")

    aba_simulados = planilha.worksheet("simulados")
    id_simulado = gerar_id_simulado()
    data_execucao = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    # Campos: id_simulado, id_atividade, data_execucao, area, questoes, acertos, tempo, comentarios
    linha_simulado = [
        id_atividade,
        id_simulado,
        dados.get('area', ''),
        dados.get('questoes', ''),
        dados.get('acertos', ''),
        dados.get('tempo_total', ''),
        dados.get('comentarios', ''),
        dados.get('dt_inicio',''),
        data_execucao
    ]

    print(f"📝 Inserindo simulado: {linha_simulado}")
    aba_simulados.append_row(linha_simulado)
    print(f"✅ Simulado {id_simulado} inserido com sucesso!")

    return id_simulado


def inserir_questoes(planilha, id_atividade, dados):
    """
    Insere um registro de questão na aba 'questoes'

    Args:
        planilha: Objeto da planilha Google Sheets
        id_atividade: ID da atividade relacionada
        dados: Dicionário com os dados da questão

    Returns:
        str: ID da questão criada
    """
    print("📊 Função inserir_questoes iniciada")

    aba_questoes = planilha.worksheet("questoes")
    id_questao = gerar_id_questao()
    data_execucao = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    # Campos: id_questao, id_atividade, data_execucao, area, materia, assunto, questoes, acertos, tempo, comentarios
    linha_questao = [
        id_atividade,
        id_questao,
        dados.get('area', ''),
        dados.get('materia', ''),
        dados.get('assunto', ''),
        dados.get('questoes', ''),
        dados.get('acertos', ''),
        dados.get('tempo_total', ''),
        dados.get('comentarios', ''),
        dados.get('dt_inicio',''),
        data_execucao
    ]

    print(f"📝 Inserindo questão: {linha_questao}")
    aba_questoes.append_row(linha_questao)
    print(f"✅ Questão {id_questao} inserida com sucesso!")

    return id_questao

def inserir_redacao(planilha, id_atividade, dados):
    """
    Insere um registro de questão na aba 'questoes'

    Args:
        planilha: Objeto da planilha Google Sheets
        id_atividade: ID da atividade relacionada
        dados: Dicionário com os dados da questão

    Returns:
        str: ID da questão criada
    """
    print("📊 Função inserir_questoes iniciada")

    aba_questoes = planilha.worksheet("redacoes")
    id_redacao = gerar_id_redacao()
    data_execucao = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    # Campos: id_questao, id_atividade, data_execucao, area, materia, assunto, questoes, acertos, tempo, comentarios
    linha_redacao = [
        id_atividade,
        id_redacao,
        'Redação',
        dados.get('c1', ''),
        dados.get('c2', ''),
        dados.get('c3', ''),
        dados.get('c4', ''),
        dados.get('c5', ''),
        dados.get('tempo_total', ''),
        dados.get('comentarios', ''),
        dados.get('dt_inicio',''),
        data_execucao
    ]

    print(f"📝 Inserindo redação: {linha_redacao}")
    aba_questoes.append_row(linha_redacao)
    print(f"✅ Questão {linha_redacao} inserida com sucesso!")

    return id_redacao


def inserir_atividade(dados):
    """
    Insere uma nova atividade na planilha Google Sheets
    E também insere na tabela específica (simulados ou questoes)

    Args:
        dados (dict): Dicionário com titulo, tipo, tempo_total, area, materia, assunto, questoes, acertos, comentarios

    Returns:
        dict: Resposta com id_atividade gerado
    """
    print("📊 Função inserir_atividade iniciada")
    print(f"   Dados recebidos: {dados}")

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

        print("📄 Abrindo aba 'atividades'...")
        aba = planilha.worksheet("atividades")
        print("✅ Aba aberta")

        # Gerar ID da atividade
        id_atividade = gerar_id_atividade()
        data_inclusao = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
        print(f"🆔 ID gerado: {id_atividade}")
        print(f"📅 Data de inclusão: {data_inclusao}")

        # Preparar linha para tabela 'atividades' (apenas dados estruturais)
        # Campos: id_atividade, titulo, tipo, tempo_total, data_inclusao
        linha = [
            id_atividade,
            dados.get('titulo', ''),
            dados.get('tipo', ''),
            dados.get('dt_inicio',''),
            data_inclusao
        ]
        print(f"📝 Linha a ser inserida em 'atividades': {linha}")

        # Inserir na planilha 'atividades'
        print("💾 Inserindo linha na planilha 'atividades'...")
        aba.append_row(linha)
        print("✅ Linha inserida em 'atividades' com sucesso!")

        # Inserir na tabela específica baseado no tipo
        tipo = dados.get('tipo', '')
        id_secundario = None

        if tipo == 'Simulado':
            print("🎯 Tipo é Simulado, inserindo na tabela 'simulados'...")
            id_secundario = inserir_simulado(planilha, id_atividade, dados)
        elif tipo == 'Questões':
            print("📋 Tipo é Questões, inserindo na tabela 'questoes'...")
            id_secundario = inserir_questoes(planilha, id_atividade, dados)
        elif tipo == 'Redação':
            print("📋 Tipo é Questões, inserindo na tabela 'questoes'...")
            id_secundario = inserir_redacao(planilha, id_atividade, dados)

        resultado = {
            "success": True,
            "id_atividade": id_atividade,
            "id_secundario": id_secundario,
            "message": "Atividade criada com sucesso"
        }
        print(f"✅ Retornando resultado: {resultado}")
        return resultado

    except Exception as e:
        print(f"❌ ERRO em inserir_atividade: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


class handler(BaseHTTPRequestHandler):
    """Handler para Vercel Serverless Functions"""

    def do_POST(self):
        """Processa requisição POST"""
        print("=" * 60)
        print("🚀 INICIANDO PROCESSAMENTO DA REQUISIÇÃO")
        print("=" * 60)

        try:
            # Ler corpo da requisição
            content_length = int(self.headers.get('Content-Length', 0))
            print(f"📏 Content-Length: {content_length}")

            body = self.rfile.read(content_length)
            print(f"📦 Body (raw): {body}")

            dados = json.loads(body.decode('utf-8'))
            print(f"✅ Dados parseados: {json.dumps(dados, indent=2)}")

            # Validar dados obrigatórios
            print("🔍 Validando campos obrigatórios...")
            campos_obrigatorios = ['titulo', 'tipo', 'tempo_total']
            for campo in campos_obrigatorios:
                valor = dados.get(campo)
                print(f"  - {campo}: {valor} {'✅' if valor else '❌'}")

                if not valor:
                    print(f"❌ ERRO: Campo obrigatório ausente: {campo}")
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    error_response = {
                        "success": False,
                        "error": f"Campo obrigatório ausente: {campo}"
                    }
                    print(f"📤 Resposta de erro: {error_response}")
                    self.wfile.write(json.dumps(error_response).encode())
                    return

            print("✅ Validação passou!")
            print("💾 Inserindo atividade no Google Sheets...")

            # Inserir atividade
            resultado = inserir_atividade(dados)
            print(f"✅ Atividade inserida com sucesso: {resultado}")

            # Retornar sucesso
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            print(f"📤 Enviando resposta de sucesso: {resultado}")
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
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
