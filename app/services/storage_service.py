import chromadb
import os
import uuid
import json

class StorageService:
    def __init__(self):
        self.db_path = os.getenv("CHROMA_DB_PATH", "./chroma_data")
        self.client = chromadb.PersistentClient(path=self.db_path)
        self.collection = self.client.get_or_create_collection(name="interview_sessions")

    def save_session(self, session_data: dict):
        session_id = session_data.get("session_id", str(uuid.uuid4()))
        # Flatten for Chroma metadata if needed, but Chroma stores embeddings + metadata.
        # We might just want to use it as a document store or stick to simple logic.
        # Storing the JSON string as document content for retrieval is easiest for now.
        self.collection.upsert(
            documents=[json.dumps(session_data)],
            metadatas=[{"type": "interview_report", "timestamp": str(time.time())}],
            ids=[session_id]
        )

    def get_session(self, session_id: str):
        result = self.collection.get(ids=[session_id])
        if result['documents']:
            return json.loads(result['documents'][0])
        return None

import time
storage_service = StorageService()
