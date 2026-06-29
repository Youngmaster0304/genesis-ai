from agents.base import BaseAgent
from models.schemas import InnovationOutput

class InnovationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Innovation Evaluator",
            emoji="💡",
            role="Novelty, differentiation, uniqueness scoring",
            schema_class=InnovationOutput
        )

innovation_agent = InnovationAgent()
