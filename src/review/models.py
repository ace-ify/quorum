"""
Data models for BlindCouncil RFC Reviews and ADRs.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any

@dataclass
class RFCProposal:
    rfc_id: str
    title: str
    author: str
    content: str
    target_traffic: str = ""

@dataclass
class AuditScorecard:
    specialist_id: str
    specialist_name: str
    dimension: str
    score: int # 1 to 10
    verdict: str # APPROVED, CONDITIONAL, REJECTED
    strengths: List[str] = field(default_factory=list)
    critical_risks: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    evidence_citations: List[str] = field(default_factory=list) # Grounded citations from RFC text to prevent hallucinations
    raw_analysis: str = ""

@dataclass
class ConflictIssue:
    dimensions: List[str] # e.g. ["Security", "Scalability", "FinOps"]
    title: str
    description: str
    specialist_a_view: str
    specialist_b_view: str
    resolution_prompt: str
    primary_domain: str = "" # Domain that holds sovereign authority over the underlying risk/constraint
    trade_off_type: str = "PARETO_COMPROMISE" # PARETO_COMPROMISE or EXECUTIVE_POLICY_DECISION

@dataclass
class ConflictReport:
    issues: List[ConflictIssue] = field(default_factory=list)

@dataclass
class ADRDocument:
    adr_id: str
    title: str
    status: str # APPROVED, APPROVED WITH CONDITIONS, REJECTED
    date_str: str
    author: str
    reviewers: List[str]
    context_summary: str
    scorecards: Dict[str, AuditScorecard]
    resolved_trade_offs: List[Dict[str, str]]
    action_items: List[str]

