import asyncio
import json
from typing import Dict, List, Any

class SSEBroadcaster:
    def __init__(self):
        self.clients: Dict[str, List[asyncio.Queue]] = {}
        # In-memory database of session states
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def get_session(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "session_id": session_id,
                "status": "pending",
                "chief_brief": None,
                "agents": {
                    "research": {"status": "WAITING", "progress": 0, "status_text": "Waiting to start...", "elapsed": 0.0, "metrics": {}},
                    "patent": {"status": "WAITING", "progress": 0, "status_text": "Waiting to start...", "elapsed": 0.0, "metrics": {}},
                    "market": {"status": "WAITING", "progress": 0, "status_text": "Waiting to start...", "elapsed": 0.0, "metrics": {}},
                    "innovation": {"status": "WAITING", "progress": 0, "status_text": "Waiting to start...", "elapsed": 0.0, "metrics": {}},
                    "technical": {"status": "WAITING", "progress": 0, "status_text": "Waiting to start...", "elapsed": 0.0, "metrics": {}},
                    "business": {"status": "WAITING", "progress": 0, "status_text": "Waiting to start...", "elapsed": 0.0, "metrics": {}}
                },
                "debate": [],
                "report": None,
                "created_at": None
            }
        return self.sessions[session_id]

    async def subscribe(self, session_id: str) -> asyncio.Queue:
        queue = asyncio.Queue()
        if session_id not in self.clients:
            self.clients[session_id] = []
        self.clients[session_id].append(queue)
        
        # Proactively push current session state to new subscriber
        session_data = self.get_session(session_id)
        await queue.put({
            "type": "session_state",
            "data": session_data
        })
        
        return queue

    def unsubscribe(self, session_id: str, queue: asyncio.Queue):
        if session_id in self.clients:
            try:
                self.clients[session_id].remove(queue)
                if not self.clients[session_id]:
                    del self.clients[session_id]
            except ValueError:
                pass

    async def emit(self, session_id: str, event_type: str, data: Any):
        """Broadcast event to all clients listening to a session_id and update session state."""
        # Update session memory
        session = self.get_session(session_id)
        
        if event_type == "brief_ready":
            session["chief_brief"] = data
            session["status"] = "processing"
        elif event_type == "agent_started":
            agent = data["agent"]
            session["agents"][agent]["status"] = "RUNNING"
            session["agents"][agent]["status_text"] = "Initiating parallel analysis..."
            session["agents"][agent]["progress"] = 15
        elif event_type == "agent_progress":
            agent = data["agent"]
            session["agents"][agent]["progress"] = data["progress"]
            session["agents"][agent]["status_text"] = data["status_text"]
        elif event_type == "agent_complete":
            agent = data["agent"]
            session["agents"][agent]["status"] = "COMPLETE"
            session["agents"][agent]["progress"] = 100
            session["agents"][agent]["status_text"] = "Analysis finished successfully."
            session["agents"][agent]["elapsed"] = data["elapsed_ms"] / 1000.0
            session["agents"][agent]["metrics"] = data.get("metrics", {})
        elif event_type == "agent_failed":
            agent = data["agent"]
            session["agents"][agent]["status"] = "FAILED"
            session["agents"][agent]["progress"] = 0
            session["agents"][agent]["status_text"] = f"Error: {data['error']}"
        elif event_type == "debate_message":
            session["debate"].append(data)
        elif event_type == "report_ready":
            session["status"] = "complete"
            session["report"] = data["report"]

        # Send through SSE queues
        if session_id in self.clients:
            payload = json.dumps({"type": event_type, "data": data})
            formatted_message = f"data: {payload}\n\n"
            for queue in self.clients[session_id]:
                await queue.put(formatted_message)

broadcaster = SSEBroadcaster()
