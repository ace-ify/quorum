"""
Zero-dependency test runner for BlindCouncil using Python's built-in unittest framework.
"""
import unittest
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.switch.mock_client import MockSwitchClient
from src.review.models import RFCProposal, AuditScorecard, ADRDocument
from src.review.adr_generator import ADRGenerator
from src.agents.chair_agent import ChairAgent
from src.llm.client import LLMClient

class TestBlindCouncilIsolation(unittest.TestCase):
    def test_blind_chamber_isolation(self):
        async def run_test():
            switch = MockSwitchClient()
            received_sec = []
            received_scale = []
            received_fin = []

            await switch.register_agent("security", lambda e: received_sec.append(e))
            await switch.register_agent("scalability", lambda e: received_scale.append(e))
            await switch.register_agent("finops", lambda e: received_fin.append(e))

            # Provision rooms
            await switch.create_room("review-desk", ["chair", "security", "scalability", "finops", "human"])
            await switch.create_room("audit-security", ["chair", "security"])
            await switch.create_room("audit-scalability", ["chair", "scalability"])
            await switch.create_room("audit-finops", ["chair", "finops"])

            # Post in #review-desk -> all receive
            await switch.post_message("chair", "review-desk", "RFC Intake")
            self.assertEqual(len(received_sec), 1)
            self.assertEqual(len(received_scale), 1)
            self.assertEqual(len(received_fin), 1)

            # Post in #audit-security -> ONLY Security receives!
            await switch.post_message("security", "audit-security", "Security Score: 7/10")
            self.assertEqual(len(received_sec), 2)
            self.assertEqual(len(received_scale), 1) # Scale received 0 packets!
            self.assertEqual(len(received_fin), 1)   # FinOps received 0 packets!

            # Verify audit assertion
            self.assertTrue(switch.verify_isolation("scalability", "audit-security"))
            self.assertTrue(switch.verify_isolation("finops", "audit-security"))

        asyncio.run(run_test())

class TestConflictDetection(unittest.TestCase):
    def test_conflict_detection(self):
        chair = ChairAgent(
            agent_id="chair",
            name="Athena",
            system_prompt="",
            switch_client=None,
            llm_client=LLMClient(use_mock=True)
        )
        chair.scorecards = {
            "security": AuditScorecard("security", "Aegis", "Security", 7, "CONDITIONAL"),
            "scalability": AuditScorecard("scalability", "Vanguard", "Scalability", 9, "APPROVED"),
            "finops": AuditScorecard("finops", "Ledger", "FinOps", 6, "CONDITIONAL"),
        }
        report = chair.detect_conflicts()
        self.assertGreaterEqual(len(report.issues), 2)
        issue_titles = [i.title for i in report.issues]
        self.assertTrue(any("Redis Cluster" in t for t in issue_titles))
        self.assertTrue(any("Token Revocation" in t for t in issue_titles))

class TestADRGeneration(unittest.TestCase):
    def test_adr_markdown_format(self):
        scorecards = {
            "security": AuditScorecard("security", "Aegis", "Security", 8, "APPROVED"),
            "scalability": AuditScorecard("scalability", "Vanguard", "Scalability", 9, "APPROVED"),
            "finops": AuditScorecard("finops", "Ledger", "FinOps", 7, "APPROVED"),
        }
        doc = ADRDocument(
            adr_id="ADR-042",
            title="Real-Time Messaging Fabric",
            status="APPROVED WITH CONDITIONS",
            date_str="2026-11-06",
            author="LeadArchitect",
            reviewers=["Athena", "Aegis", "Vanguard", "Ledger"],
            context_summary="Migration from polling to WebSocket cluster.",
            scorecards=scorecards,
            resolved_trade_offs=[
                {"title": "Redis Sizing", "tension": "12 vs 4 nodes", "resolution": "Adopted 4 nodes"}
            ],
            action_items=["Deploy 4-node cluster", "Configure monitoring alarms"]
        )
        md = ADRGenerator.render_markdown(doc)
        self.assertIn("# ADR-042: Real-Time Messaging Fabric", md)
        self.assertIn("## 1. Executive Summary & Blind Scorecard", md)
        self.assertIn("Aegis", md)
        self.assertIn("Vanguard", md)
        self.assertIn("Ledger", md)
        self.assertIn("Redis Sizing", md)
        self.assertIn("- [ ] Deploy 4-node cluster", md)

if __name__ == "__main__":
    unittest.main()
