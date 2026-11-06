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
        use_mock: bool = False,
    ):
        self.provider = (provider or os.getenv("LLM_PROVIDER") or "gemini").lower()
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.base_url = base_url or os.getenv("OPENAI_BASE_URL")
        self.model = model or os.getenv("GEMINI_MODEL") or os.getenv("OPENAI_MODEL") or "gemini-3.8-flash"
        self.use_mock = use_mock or (self.provider == "mock")

        self._client = None
        if not self.use_mock:
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
                self._client = AsyncOpenAI(api_key=self.api_key, base_url=gemini_base, timeout=8.0)
            else:
                # Standard OpenAI or FreeLLMAPI
                self._client = AsyncOpenAI(api_key=self.api_key, base_url=self.base_url, timeout=8.0)
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
                    # Determine role accurately: only mark assistant if sender matches non-empty character_id or role is assistant
                    sender = m.get("sender")
                    explicit_role = m.get("role")
                    if explicit_role:
                        role = explicit_role
                    elif character_id and sender and sender.lower() == character_id.lower():
                        role = "assistant"
                    else:
                        role = "user"

                    content = m.get("content", "")
                    prefix = f"{sender}: " if sender else ""
                    formatted_messages.append({"role": role, "content": f"{prefix}{content}"})

                # Invariant: Google Gemini / OpenAI protocol requires the prompt not to end on an assistant turn
                if not formatted_messages or formatted_messages[-1]["role"] == "assistant":
                    formatted_messages.append({"role": "user", "content": "Evaluate this architectural proposal through your sovereign domain rubric."})
                elif len(formatted_messages) == 1:
                    formatted_messages.append({"role": "user", "content": "Evaluate this architectural proposal through your sovereign domain rubric."})

                resp = await self._client.chat.completions.create(
                    model=self.model,
                    messages=formatted_messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    timeout=8.0,
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

        if cid in ["chair", "athena"]:
            return (
                "🏛️ As Council Chair, I synthesize the findings across Security, Scalability, FinOps, and Storage. "
                "We must balance resilience with cloud economics before locking our official ADR."
            )

        elif cid in ["security", "aegis"]:
            return (
                "🛡️ From a Zero-Trust threat modeling posture: In-band token refreshes without centralized revocation "
                "guarantees represent an unacceptable session hijacking risk. We mandate customer-managed KMS envelope encryption."
            )

        elif cid in ["scalability", "vanguard"]:
            return (
                "⚡ On distributed scalability and p99 latency: Synchronous multi-region database writes will spike "
                "checkout latency past 80ms. We require asynchronous event-stream batching with Redis Bloom filter caching."
            )

        elif cid in ["finops", "ledger"]:
            return (
                "💰 Reviewing infrastructure ROI: Starting with an un-sharded 12-node cluster produces $2,100/mo in idle compute waste. "
                "We recommend beginning with 4 provisioned nodes and auto-sharding triggers."
            )

        elif cid in ["database", "titan"]:
            return (
                "🏛️ Evaluating data consistency and storage engines: Dual-writes between Redis streams and relational storage "
                "will introduce ghost rows during worker crashes. A Transactional Outbox pattern with UUID idempotency keys is required."
            )

        elif cid in ["compliance", "verity"]:
            return (
                "⚖️ Evaluating regulatory posture: Retaining un-expirable user message history in append-only streams "
                "violates GDPR Article 17 Right to Erasure. Per-user crypto-shredding keys must be enforced."
            )

        return "Evaluating architectural proposal against core domain invariants."
