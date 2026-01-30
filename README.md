# PACD - Portal Ana Clara de Desempenho

Sistema de gestão de atividades de estudo com integração ao Google Sheets e Power BI.

## Arquitetura

### Frontend
- **Framework**: React 18 com Vite
- **Hospedagem**: Vercel (static site)
- **Estilo**: CSS puro, responsivo
- **Roteamento**: React Router DOM

### Backend
- **Tipo**: Serverless Functions (Python)
- **Runtime**: Python 3.9
- **Hospedagem**: Vercel Functions
- **Banco de dados**: Google Sheets (via API)

## Estrutura do Projeto

```
pacd/
├── api/                          # Serverless Functions (Python)
│   ├── criar_atividade.py       # Endpoint para criar atividades
│   ├── criar_simulado.py        # Endpoint para criar simulados
│   ├── criar_questoes.py        # Endpoint para criar questões
│   ├── listar_exercicios.py     # Endpoint para listar exercícios
│   ├── listar_redacoes.py       # Endpoint para listar redações
│   └── requirements.txt          # Dependências Python
├── src/                          # Frontend React
│   ├── pages/
│   │   ├── NovaAtividade.jsx    # Página de criação de atividade
│   │   └── MinhasAtividades.jsx # Página de listagem e detalhes
│   ├── components/
│   │   └── Sidebar.jsx          # Componente de navegação lateral
│   ├── styles/
│   │   ├── NovaAtividade.css    # Estilos da página de criação
│   │   └── MinhasAtividades.css # Estilos da página de listagem
│   ├── App.jsx                   # Componente principal
│   └── main.jsx                  # Entry point
├── index.html                    # HTML base
├── package.json                  # Dependências Node
├── vite.config.js               # Configuração Vite
├── vercel.json                   # Configuração Vercel
└── .env.example                  # Exemplo de variáveis de ambiente
```

## Funcionalidades

### 📝 Nova Atividade
Criação de atividades de estudo com três tipos diferentes:

#### 1. Simulado
- Área do conhecimento (Humanas, Natureza, Matemática, Linguagens)
- Número de questões e acertos
- Tempo total gasto
- Data de início
- Data realizada
- Comentários opcionais

#### 2. Questões (Blocos de Exercícios)
- Área do conhecimento
- Matéria e assunto específicos
- Número de questões e acertos
- Tempo total gasto
- Data de início
- Data realizada
- Comentários opcionais

#### 3. Redação
- 5 Competências (C1, C2, C3, C4, C5)
- Cada competência pode ter nota de 0 a 200
- Tempo total gasto
- Data de início
- Comentários opcionais

### 📊 Minhas Atividades
Visualização e gerenciamento de atividades com filtros dinâmicos:

#### Filtro por Categoria
- **Exercícios**: Exibe Simulados e Questões
  - Colunas: ID, Título, Tipo, Questões, Acertos, Aproveitamento, Data de Início, Ações
  - Subcategoria: Filtro adicional por Simulado ou Questões
  - Ação: Botão "Ver Detalhes" para visualizar informações detalhadas

- **Redações**: Exibe redações cadastradas
  - Colunas: ID, Título, Tipo, C1, C2, C3, C4, C5, Total, Data de Início
  - Total: Soma automática das 5 competências (máx. 1000 pontos)

#### Recursos de Filtragem e Ordenação
- Busca por ID ou título
- Ordenação por qualquer coluna (clique no cabeçalho)
- Indicadores visuais de ordenação (↑↓)
- Badges coloridos por tipo de atividade

#### Modal de Detalhes (Exercícios)
Ao clicar em "Ver Detalhes" em um exercício:

**Para Simulados:**
- Tabela com todos os simulados realizados
- Campos: ID Simulado, Área, Questões, Acertos, Aproveitamento, Tempo Total, Comentários, Data Realizada
- Botão "+" para adicionar novo simulado à mesma atividade

**Para Questões:**
- Tabela com todos os blocos de questões realizados
- Campos: ID Bloco, Área, Matéria, Assunto, Questões, Acertos, Aproveitamento, Tempo Total, Comentários, Data Realizada
- Botão "+" para adicionar novo bloco à mesma atividade

#### Criar Novo Simulado/Bloco
Modal contextual que permite adicionar novos registros a uma atividade existente:
- Campos com máscaras automáticas (tempo: 00:00, data: 00/00/0000)
- Validação de dados obrigatórios
- Atualização automática após criação

## Modelagem de Dados (Google Sheets)

### Planilha: PACD_DADOS

#### Aba: atividades
Armazena dados estruturais das atividades.

| Coluna        | Tipo   | Descrição                          |
|---------------|--------|------------------------------------|
| id_atividade  | String | ID único gerado (timestamp)        |
| titulo        | String | Nome da atividade                  |
| tipo          | String | Simulado, Questões ou Redação      |
| dt_inicio     | String | Data de início (DD/MM/YYYY)        |
| data_inclusao | String | Timestamp de criação               |

#### Aba: simulados
Armazena registros de simulados (relacionamento 1:N com atividades).

| Coluna         | Tipo   | Descrição                     |
|----------------|--------|-------------------------------|
| id_simulado    | String | ID único do simulado          |
| id_atividade   | String | FK para atividades            |
| area           | String | Área do conhecimento          |
| questoes       | Number | Número de questões            |
| acertos        | Number | Número de acertos             |
| tempo_total    | String | Tempo gasto (HH:MM)           |
| comentarios    | String | Observações                   |
| dt_realizado   | String | Data realizada (DD/MM/YYYY)   |
| data_execucao  | String | Timestamp de criação          |

#### Aba: questoes
Armazena registros de blocos de questões (relacionamento 1:N com atividades).

| Coluna         | Tipo   | Descrição                     |
|----------------|--------|-------------------------------|
| id_questoes    | String | ID único do bloco             |
| id_atividade   | String | FK para atividades            |
| area           | String | Área do conhecimento          |
| materia        | String | Matéria específica            |
| assunto        | String | Assunto específico            |
| questoes       | Number | Número de questões            |
| acertos        | Number | Número de acertos             |
| tempo_total    | String | Tempo gasto (HH:MM)           |
| comentarios    | String | Observações                   |
| dt_realizado   | String | Data realizada (DD/MM/YYYY)   |
| data_execucao  | String | Timestamp de criação          |

#### Aba: redacoes
Armazena registros de redações (relacionamento 1:1 com atividades).

| Coluna         | Tipo   | Descrição                     |
|----------------|--------|-------------------------------|
| id_redacao     | String | ID único da redação           |
| id_atividade   | String | FK para atividades            |
| tema           | String | Tema (sempre "Redação")       |
| c1             | Number | Competência 1 (0-200)         |
| c2             | Number | Competência 2 (0-200)         |
| c3             | Number | Competência 3 (0-200)         |
| c4             | Number | Competência 4 (0-200)         |
| c5             | Number | Competência 5 (0-200)         |
| tempo_total    | String | Tempo gasto (HH:MM)           |
| comentarios    | String | Observações                   |
| dt_inicio      | String | Data de início (DD/MM/YYYY)   |
| data_execucao  | String | Timestamp de criação          |

## Fluxo de Dados

### Criação de Atividade

```
┌─────────────┐      POST /api/criar_atividade     ┌──────────────────┐
│   Frontend  │─────────────────────────────────────▶│  Vercel Function │
│   (React)   │                                       │    (Python)      │
└─────────────┘                                       └──────────────────┘
       ▲                                                       │
       │                                                       │
       │              JSON Response                            │
       │           {success, id_atividade}                     │
       │                                                       ▼
       │                                              ┌──────────────────┐
       └──────────────────────────────────────────── │  Google Sheets   │
                                                      │   (atividades +  │
                                                      │ simulados/       │
                                                      │ questoes/        │
                                                      │ redacoes)        │
                                                      └──────────────────┘
```

### Listagem de Atividades

```
┌─────────────┐      GET /api/listar_exercicios    ┌──────────────────┐
│   Frontend  │─────────────────────────────────────▶│  Vercel Function │
│   (React)   │                                       │    (Python)      │
└─────────────┘◀─────────────────────────────────────└──────────────────┘
       │                  JSON Array                          ▲
       │             [atividades com INFO]                    │
       │                                                      │
       │                                              ┌──────────────────┐
       │      GET /api/listar_redacoes                │  Google Sheets   │
       └─────────────────────────────────────────────▶│   (JOIN entre    │
                                                      │   atividades +   │
                                                      │   simulados/     │
                                                      │   questoes/      │
                                                      │   redacoes)      │
                                                      └──────────────────┘
```

## Recursos Implementados

### 🎨 Interface
- ✅ Design responsivo com tema escuro
- ✅ Sidebar de navegação
- ✅ Máscaras de entrada automáticas (tempo, data)
- ✅ Validação de formulários em tempo real
- ✅ Feedback visual de loading e erros
- ✅ Tabelas dinâmicas com ordenação
- ✅ Modais para detalhes e criação de registros
- ✅ Badges coloridos por tipo de atividade

### 🔧 Funcionalidades
- ✅ Criação de 3 tipos de atividades (Simulado, Questões, Redação)
- ✅ Listagem com filtros por categoria
- ✅ Ordenação por qualquer coluna
- ✅ Busca por ID ou título
- ✅ Detalhamento de atividades em modal
- ✅ Adição de novos registros a atividades existentes
- ✅ Cálculo automático de aproveitamento
- ✅ Cálculo automático de total de pontos (redações)
- ✅ Atualização em tempo real após criação

### 📱 Validações
- ✅ Campos obrigatórios
- ✅ Formato de data (DD/MM/YYYY)
- ✅ Formato de tempo (HH:MM)
- ✅ Limites numéricos (competências: 0-200)
- ✅ Validação de acertos ≤ questões
- ✅ Apenas caracteres numéricos em campos específicos

## Setup e Deploy

### 1. Configurar Google Service Account

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Sheets
4. Crie uma Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Faça download do arquivo JSON com as credenciais
5. Crie uma planilha chamada "PACD_DADOS" no Google Sheets
6. Compartilhe a planilha com o email da Service Account (com permissão de editor)
7. Crie as abas: "atividades", "simulados", "questoes", "redacoes"

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha com os dados do JSON:

```bash
cp .env.example .env
```

Edite `.env` com as credenciais do Service Account.

### 3. Desenvolvimento Local

```bash
# Instalar dependências do frontend
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Nota**: Para testar as serverless functions localmente, você precisará de uma ferramenta como `vercel dev`:

```bash
npm install -g vercel
vercel dev
```

### 4. Deploy na Vercel

#### Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

#### Via Dashboard

1. Conecte seu repositório GitHub na Vercel
2. Configure as variáveis de ambiente no Dashboard:
   - Settings → Environment Variables
   - Adicione todas as variáveis do `.env`
3. Deploy automático a cada push

### 5. Configurar Variáveis na Vercel

No dashboard da Vercel, adicione as seguintes variáveis de ambiente:

- `GOOGLE_TYPE`
- `GOOGLE_PROJECT_ID`
- `GOOGLE_PRIVATE_KEY_ID`
- `GOOGLE_PRIVATE_KEY` (cole toda a chave privada, com `\n` preservados)
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_CLIENT_ID`

## Princípios de Design

1. **Atividade descreve o evento**
   - Apenas dados estruturais (título, tipo, data de início)
   - Não armazena métricas acumuladas

2. **Registros descrevem o que aconteceu**
   - Simulados, Questões e Redações registram execuções
   - Uma atividade pode ter vários registros (exceto redações)
   - Relacionamento 1:N para Simulados e Questões
   - Relacionamento 1:1 para Redações

3. **Somatórios são calculados em tempo real**
   - Totalizações no frontend e Power BI
   - Sem duplicação de dados derivados
   - Aproveitamento calculado dinamicamente

4. **Máscaras e validações no frontend**
   - UX melhorada com máscaras automáticas
   - Validação antes do envio
   - Feedback visual imediato

## Tecnologias

- **Frontend**: React 18, Vite, React Router DOM
- **Backend**: Python 3.9, Vercel Serverless Functions
- **APIs**: Google Sheets API, Google Auth, gspread
- **Deploy**: Vercel
- **BI**: Power BI (consumo externo)
- **Estilização**: CSS puro com variáveis CSS

## Endpoints API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/criar_atividade` | POST | Cria nova atividade |
| `/api/criar_simulado` | POST | Adiciona simulado a atividade |
| `/api/criar_questoes` | POST | Adiciona bloco de questões |
| `/api/listar_exercicios` | GET | Lista simulados e questões |
| `/api/listar_redacoes` | GET | Lista redações |

## Suporte

Em caso de dúvidas ou problemas:
1. Verifique se as credenciais do Google estão corretas
2. Confirme que a planilha está compartilhada com a Service Account
3. Verifique os logs no Dashboard da Vercel
4. Confirme que todas as abas necessárias existem na planilha

## Licença

Projeto privado - Todos os direitos reservados
