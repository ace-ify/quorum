# RFC-089: Zero-Downtime Migration from PostgreSQL to DynamoDB for Global Order Ledger

**Author:** Principal Data Platform Engineer  
**Target Date:** Q2 2027  
**Status:** Under Council Review  
**Traffic Target:** 50,000 Order Transactions/sec Peak, 2 Billion Historical Records  

---

## 1. Problem Statement & Business Context
Our existing PostgreSQL database cluster (hosted on AWS RDS Aurora PostgreSQL `db.r6g.16xlarge`) is reaching vertical scaling limits during flash sales. Vacuuming overhead, lock contention on the `orders` table, and write IOPS saturation have caused multiple 2-second API freezes during Black Friday.

We propose migrating the core order processing pipeline to **Amazon DynamoDB** with Global Tables to achieve predictable single-digit millisecond latency worldwide and infinite horizontal scalability.

---

## 2. Proposed Architecture & Migration Strategy

### A. Data Modeling (Single-Table Design)
- **Primary Key:**
  - Partition Key (`PK`): `ORG#<tenant_id>`
  - Sort Key (`SK`): `ORDER#<order_id>`
- **Global Secondary Indexes (GSIs):**
  - `GSI-1`: `USER#<user_id>` -> `CREATED_AT` (for user order history queries)
  - `GSI-2`: `STATUS#<order_status>` -> `TOTAL_AMOUNT` (for operations queue)
- **Attribute Storage:**
  - Order metadata, items array, payment receipt tokens, customer billing addresses stored as JSON attributes.

### B. Dual-Write & Zero-Downtime Cutover Plan
1. **Phase 1 (Shadow Pipeline):** Lambda workers consume Change Data Capture (CDC) streams from Postgres via Debezium and replicate updates into DynamoDB in real-time.
2. **Phase 2 (Dual Reads):** Application queries DynamoDB and compares results against Postgres in background shadow mode to verify 100% data parity.
3. **Phase 3 (Primary Cutover):** Flip API write traffic directly to DynamoDB; deprecate Postgres Aurora cluster.

### C. Capacity Planning & Cost Projections
- DynamoDB configured in **On-Demand Capacity Mode** initially to accommodate unpredictably spiky flash sales.
- Global Tables enabled across `us-east-1`, `eu-west-1`, and `ap-southeast-1` with Point-in-Time Recovery (PITR) enabled.
- Estimated monthly cloud spend: ~$14,200/month.

