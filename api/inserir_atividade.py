import os
import random
from datetime import datetime


import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv


# Carrega o .env
load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

SPREADSHEET_NAME = "PACD_DADOS"


def get_google_credentials():
    return Credentials.from_service_account_info(
        {
            "type": os.environ["GOOGLE_TYPE"],
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


def teste_insercao():
    creds = get_google_credentials()
    client = gspread.authorize(creds)

    planilha = client.open(SPREADSHEET_NAME)
    aba = planilha.worksheet("atividades")
    
    base = datetime.now().strftime("%H%M")
    rand = random.randint(0, 9)

    id_atividade = f"{base}{rand}"

    linha = [
        id_atividade,
        "Simulado Matemática",
        "SIMULADO",
        45,
        30,
        "01:20",
        "Inserção de teste via script local",
        datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    ]

    aba.append_row(linha)

    print("✅ Inserção realizada com sucesso!")
    print(f"ID atividade: {id_atividade}")


if __name__ == "__main__":
    teste_insercao()
