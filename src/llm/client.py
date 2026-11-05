"""
Unified LLM Client supporting Gemini API, FreeLLMAPI / OpenAI-compatible gateways,
and an intelligent offline mock generator for zero-configuration testing.
"""
import os
import random
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

class LLMClient:
    def __init__(
        self,
        provider: Optional[str] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.provider = (provider or os.getenv("LLM_PROVIDER") or "gemini").lower()
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.base_url = base_url or os.getenv("OPENAI_BASE_URL")
        self.model = model or os.getenv("GEMINI_MODEL") or os.getenv("OPENAI_MODEL") or "gemini-3.8-flash"

        self._client = None
        self._init_client()

    def _init_client(self):
        if not self.api_key or self.api_key.startswith("your_"):
            # Offline mock mode
            self._client = None
            return

        try:
            from openai import AsyncOpenAI
            if self.provider == "gemini":
                # Google Gemini supports the OpenAI protocol directly
                gemini_base = self.base_url or "https://generativelanguage.googleapis.com/v1beta/openai/"
                self._client = AsyncOpenAI(api_key=self.api_key, base_url=gemini_base)
            else:
                # Standard OpenAI or FreeLLMAPI
                self._client = AsyncOpenAI(api_key=self.api_key, base_url=self.base_url)
        except Exception as e:
            print(f"[LLMClient] Could not initialize AsyncOpenAI: {e}. Falling back to mock generator.")
            self._client = None

    async def generate_response(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.8,
        max_tokens: int = 350,
        character_id: Optional[str] = None,
        phase: Optional[str] = None,
    ) -> str:
        """
        Generate response given chat history.
        """
        if self._client:
            try:
                formatted_messages = [{"role": "system", "content": system_prompt}]
                for m in messages:
                    role = "assistant" if m.get("sender") == character_id else "user"
                    formatted_messages.append({"role": role, "content": f"{m.get('sender', 'user')}: {m.get('content', '')}"})

                if len(formatted_messages) == 1:
                    formatted_messages.append({"role": "user", "content": "Please speak in character and respond to the current situation in the house."})

                resp = await self._client.chat.completions.create(
                    model=self.model,
                    messages=formatted_messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                return resp.choices[0].message.content.strip()
            except Exception as e:
                if os.getenv("DEBUG_LOGS", "false").lower() == "true":
                    print(f"[LLMClient] API notice: ({e}). Using character archetype fallback.")

        # Offline Mock Fallback: Rich archetype-driven responses
        return self._mock_character_response(character_id, phase, messages)

    def _mock_character_response(
        self,
        character_id: Optional[str],
        phase: Optional[str],
        messages: List[Dict[str, str]]
    ) -> str:
        cid = (character_id or "").lower()
        ph = (phase or "").lower()

        if cid == "host":
            if "briefing" in ph:
                return (
                    "📢 *CHIME SOUNDS* Attention Housemates! The Big Voice has arrived. "
                    "Today is the Luxury Budget Allocation Task! You have 1,000 points. "
                    "Fail to keep essentials, and you shall feast on dry water crackers. Begin your negotiations in #living-room!"
                )
            elif "leak" in ph:
                return (
                    "🚨 *RED LIGHTS FLASH* The Big Voice intercepts everything! "
                    "Earlier, a whisper was captured in the secret corridors: "
                    "'Let's let Marcus waste his points on protein, then we'll blame Arthur for the fail.' Discuss!"
                )
            elif "confession" in ph:
                return "Enter, speak your truth, and name your eviction target. The walls are soundproof, but The Big Voice forgets nothing."
            elif "eviction" in ph:
                return "The votes have been counted with ruthless precision. One of you leaves The House tonight forever."
            return "The Big Voice watches in silence. Continue."

        elif cid == "marcus":
            if "confession" in ph:
                return "Big Voice, I nominate Arthur! He's always crunching numbers like a robot and trying to cut my protein intake. The man is clearly sabotaging my gains!"
            if "task" in ph:
                return (
                    "Look, we are NOT debating this. We need the 150-pt Flour & Rice, 100-pt Lentils, 100-pt Oil, "
                    "and my 250-pt Whey Protein Tub! That's 600 points. We have 400 left. Do NOT touch my protein!"
                )
            return "Enough excuses! If you don't put in work, don't talk to me."

        elif cid == "elena":
            if "confession" in ph:
                return "Big Voice, I nominate Marcus. He's so aggressive and rude! And honestly, Arthur is super sketchy with his spreadsheets. But Marcus needs to go."
            if "task" in ph:
                return (
                    "Guys, positive vibes please! Marcus, don't yell. All I ask for is the 200-pt Imported Espresso Roast. "
                    "A civilized house needs good coffee. Can we please agree on that?"
                )
            return "I'm literally just trying to keep peace in this house!"

        elif cid == "arthur":
            if "confession" in ph:
                return "The Big Voice, I nominate Elena. Her insistence on luxury espresso without contributing to essential calories suggests deliberate resource depletion. Probability of her guilt: 78%."
            if "task" in ph:
                return (
                    "Let us proceed logically. Essentials total 350 points (Rice 150 + Dal 100 + Oil 100). "
                    "Adding Marcus's protein (250) and Elena's espresso (200) brings us to 800 points. "
                    "If we add Wi-Fi (250), we reach 1,050 points—which exceeds our ceiling by 50 points. Someone must compromise."
                )
            return "Facts over feelings. The arithmetic is indisputable."

        elif cid == "maya":
            if "confession" in ph:
                return "Big Voice! I am sobbing right now! Arthur was condescending to me again! I nominate Arthur! He is 100% the Saboteur sent to break my spirit!"
            if "task" in ph:
                return (
                    "Excuse me?! Marcus gets his protein and Elena gets fancy coffee, but my 200-pt Luxury Spa & Bath Salts are 'unnecessary'?! "
                    "After the trauma of this house?! I am being targeted! If I don't get my bath salts, I am boycotting this entire task!"
                )
            return "I can't even with this house right now! Unbelievable!"

        return "I am watching everyone closely. Let's make sure our task succeeds."
