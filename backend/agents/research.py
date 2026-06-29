from agents.base import BaseAgent
from models.schemas import ResearchOutput

class ResearchAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Research Agent",
            emoji="📚",
            role="Prior art, literature, domain context",
            schema_class=ResearchOutput
        )

research_agent = ResearchAgent()
