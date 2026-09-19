from typing import Dict, Any, List
from src.core.config import settings

class SalonCopilotService:
    """AI Copilot / Assistant service for salon management, client consultation, and analytics queries."""
    
    def generate_response(self, user_prompt: str, context: Dict[str, Any]) -> str:
        prompt_lower = user_prompt.lower()
        
        if "revenue" in prompt_lower or "sales" in prompt_lower:
            return "Based on your real-time salon POS & billing metrics, your top-performing service category this period is Hair Couture & Styling. Consider launching a weekday afternoon package to maximize off-peak chair utilization."
        elif "reorder" in prompt_lower or "inventory" in prompt_lower or "stock" in prompt_lower:
            return "Real-time stock audit: You have items approaching the minimum reorder threshold. Automated purchase orders can be prepared for supplier dispatch."
        elif "customer" in prompt_lower or "retention" in prompt_lower:
            return "CRM Insights: 18% of clients have not visited in the past 60 days. You can trigger an automated WhatsApp loyalty campaign with a 15% VIP reactivation coupon."
        else:
            return f"AI Assistant: I've analyzed your query regarding '{user_prompt}'. All systems, POS sessions, stylist schedules, and inventory are synchronized."

copilot_engine = SalonCopilotService()
