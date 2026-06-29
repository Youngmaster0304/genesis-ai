from agents.base import BaseAgent
from models.schemas import MarketOutput

class MarketAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Market Intelligence",
            emoji="📈",
            role="TAM/SAM/SOM, competitors, trends",
            schema_class=MarketOutput
        )

market_agent = MarketAgent()
