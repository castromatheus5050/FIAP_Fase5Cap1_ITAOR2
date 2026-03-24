# FIAP_Fase5Cap1_ITAOR2

PoC de assistente conversacional para atendimento inicial em saude, integrado ao watsonx Assistant com backend em Flask e interface de chat em React Native (Expo).

## Estrutura do projeto

- `backend/`: API Flask que recebe mensagens do usuario e consulta o watsonx Assistant.
- `frontend/`: aplicacao React Native (Expo) para envio e exibicao de mensagens.
- `watson/`: modelo inicial do assistente (intents, entities e fluxo dialogal).
- `docs/`: documentacao de setup e relatorio da atividade.

## Arquivos principais

- `backend/app.py`: endpoint de saude e endpoint de chat.
- `backend/.env.example`: variaveis necessarias de configuracao.
- `frontend/App.js`: interface de conversa e chamada ao backend.
- `watson/assistant-model-inicial.json`: base para cadastro manual do assistente.
- `docs/setup-ibm-watson.md`: guia de configuracao IBM Cloud/watsonx Assistant.
- `docs/relatorio-atividade.md`: relatorio em Markdown pronto para exportar em PDF.

## Fluxo da aplicacao

1. O usuario digita uma mensagem no app React Native.
2. O frontend envia `POST /chat` para o backend Flask.
3. O backend cria/reutiliza `session_id` e envia a mensagem ao watsonx Assistant.
4. O watsonx interpreta intencao e retorna resposta textual conforme o fluxo configurado.
5. O backend devolve as respostas ao frontend.
6. O frontend renderiza as respostas no chat.

## Fluxo conversacional coberto na PoC

- Saudacao inicial.
- Agendamento de consulta (pergunta de periodo).
- Duvidas sobre sintomas.
- Informacoes de horario de atendimento.
- Orientacao de emergencia.
- Fallback para mensagens nao reconhecidas.

## Execucao local (resumo)

### Backend

```bash
pip install -r backend/requirements.txt
python backend/app.py
```

### Frontend web (desktop)

```bash
cd frontend
npm install
npx expo install react-dom react-native-web
npm run web
```

No modo web local, use `API_BASE_URL = "http://localhost:5000"` em `frontend/App.js`.

## Variaveis de ambiente do backend

Configurar em `backend/.env`:

```env
WATSON_API_KEY=...
WATSON_URL=...
WATSON_ASSISTANT_ID=...
WATSON_ENVIRONMENT_ID=...   # recomendacao PoC: draft environment id
WATSON_VERSION=2021-11-27
```

## Endpoints da API

- `GET /health`: status da API e verificacao basica de configuracao.
- `POST /chat`: recebe `{ message, session_id?, user_id? }` e retorna `{ session_id, responses }`.

## Observacoes da PoC

- Implementacao focada em fluxo direto, sem cobertura extensa de edge-cases.
- O frontend e o backend rodam separadamente.
- O endpoint raiz `/` no Flask retorna 404 por nao existir pagina web servida pelo backend (comportamento esperado).