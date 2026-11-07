"""
Zero-dependency test runner for Quorum using Python's built-in unittest framework.
Runs all test suites across room isolation, conflict detection, ADR generation,
scaffolding contracts, specialist factory, and operational invariants.
"""
import unittest
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from tests.test_isolation import TestRoomIsolation
from tests.test_quorum import (
    TestQuorumIsolation,
    TestConflictDetection,
    TestADRAndImplementerBridge,
    TestFactoryAndIngestion,
    TestOperationalInvariants
)

def suite():
    s = unittest.TestSuite()
    s.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestRoomIsolation))
    s.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestQuorumIsolation))
    s.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestConflictDetection))
    s.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestADRAndImplementerBridge))
    s.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestFactoryAndIngestion))
    s.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(TestOperationalInvariants))
    return s

if __name__ == "__main__":
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite())
    if not result.wasSuccessful():
        sys.exit(1)
