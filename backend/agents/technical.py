from agents.base import BaseAgent
from models.schemas import TechnicalOutput

class TechnicalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Technical Architect",
            emoji="🏗️",
            role="Stack, architecture, feasibility",
            schema_class=TechnicalOutput
        )

technical_agent = TechnicalAgent()
