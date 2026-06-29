from agents.base import BaseAgent
from models.schemas import BusinessOutput

class BusinessAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Business Strategist",
            emoji="💼",
            role="Business model, GTM, revenue, investors",
            schema_class=BusinessOutput
        )

business_agent = BusinessAgent()
