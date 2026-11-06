# RFC-042: Real-Time Messaging & Event Streaming Architecture

**Author:** Staff Platform Engineer  
**Target Date:** Q1 2027  
**Status:** Under Council Review  
**Traffic Target:** 100,000 Concurrent WebSocket Connections (peak 25,000 msg/sec)

---

## 1. Problem Statement
Our current HTTP long-polling infrastructure is exhausting server memory, creating 450ms p99 message delivery latency, and driving database connection spikes during peak enterprise hours. We need a modern, scalable real-time messaging fabric.

---

## 2. Proposed Architecture
1. **Transport Layer:**
   - Terminate TLS at Cloudflare / AWS ALB.
   - Route persistent WebSocket connections to an auto-scaling cluster of Node.js / Go gateway pods on Amazon EKS.
2. **Pub/Sub Broker:**
   - Multi-node Redis Enterprise Cluster (12-node shard with active replication) to fan out room messages across gateway instances.
3. **Persistence & Data Store:**
   - Ephemeral messages buffered in Redis Streams for 24 hours.
   - Asynchronous batch worker writes message logs to Amazon Aurora PostgreSQL (Serverless v2).
4. **Security & Authentication:**
   - JWT tokens validated on initial WebSocket handshake (15-minute expiry).
   - Long-lived connections refresh tokens via an in-band WebSocket heartbeat ping every 5 minutes.
   - Data at rest encrypted via AWS KMS default keys.
5. **Cost Projection:**
   - Estimated monthly infrastructure spend: ~$8,200/month (EKS pods: $3,200, Redis Cluster: $3,500, Aurora: $1,500).
