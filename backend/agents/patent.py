from agents.base import BaseAgent
from models.schemas import PatentOutput

class PatentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Patent Intelligence",
            emoji="📜",
            role="Patent landscape, freedom-to-operate",
            schema_class=PatentOutput
        )

patent_agent = PatentAgent()
