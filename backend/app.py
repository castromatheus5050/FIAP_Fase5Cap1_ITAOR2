import os
from typing import Optional
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from ibm_watson import AssistantV2


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__)
CORS(app)


def _required_env(var_name: str) -> Optional[str]:
    value = os.getenv(var_name)
    return value.strip() if value else None


API_KEY = _required_env("WATSON_API_KEY")
SERVICE_URL = _required_env("WATSON_URL")
ASSISTANT_ID = _required_env("WATSON_ASSISTANT_ID")
ENVIRONMENT_ID = _required_env("WATSON_ENVIRONMENT_ID")
API_VERSION = _required_env("WATSON_VERSION") or "2021-11-27"


def _build_assistant_client() -> AssistantV2:
    if not API_KEY or not SERVICE_URL or not ASSISTANT_ID or not ENVIRONMENT_ID:
        raise RuntimeError(
            "Watson credentials are missing. Fill WATSON_API_KEY, WATSON_URL "
            "WATSON_ASSISTANT_ID and WATSON_ENVIRONMENT_ID in backend/.env."
        )

    authenticator = IAMAuthenticator(API_KEY)
    assistant = AssistantV2(version=API_VERSION, authenticator=authenticator)
    assistant.set_service_url(SERVICE_URL)
    return assistant


@app.get("/health")
def health() -> tuple:
    credentials_ok = bool(API_KEY and SERVICE_URL and ASSISTANT_ID and ENVIRONMENT_ID)
    return jsonify({"status": "ok", "watson_credentials_configured": credentials_ok}), 200


@app.post("/chat")
def chat() -> tuple:
    payload = request.get_json(silent=True) or {}
    user_message = (payload.get("message") or "").strip()
    session_id = payload.get("session_id")
    user_id = (payload.get("user_id") or "poc-user").strip()

    if not user_message:
        return jsonify({"error": "Field 'message' is required."}), 400

    try:
        assistant = _build_assistant_client()

        # Create a session if frontend did not provide one.
        if not session_id:
            session = assistant.create_session(
                assistant_id=ASSISTANT_ID,
                environment_id=ENVIRONMENT_ID,
            ).get_result()
            session_id = session["session_id"]

        response = assistant.message(
            assistant_id=ASSISTANT_ID,
            environment_id=ENVIRONMENT_ID,
            session_id=session_id,
            input={"message_type": "text", "text": user_message},
            user_id=user_id,
        ).get_result()

        output = response.get("output", {})
        generic = output.get("generic", [])
        texts = [
            item.get("text")
            for item in generic
            if item.get("response_type") == "text" and item.get("text")
        ]

        if not texts:
            texts = ["Nao consegui interpretar sua solicitacao. Pode reformular?"]

        return jsonify({"session_id": session_id, "responses": texts}), 200
    except Exception as exc:  # pragma: no cover - defensive for API/network errors
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
