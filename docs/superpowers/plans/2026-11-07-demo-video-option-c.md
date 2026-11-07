# Option C Master Demo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a high-production-value, 1080p hackathon demo video (`blindcouncil_final_demo.mp4`, ~2m 05s) showing authentic multi-turn agent clash, a rendered visual architecture diagram, human steering, and live ADR & Claude Code terminal handoff.

**Architecture:** Python automation renders 5 high-fidelity 1080p Discord UI scenes with real visual diagram image attachments, compiles video clips matching exact narration timestamps, and muxes with high-quality AAC voiceover track using FFmpeg.

**Tech Stack:** Python 3.11, Chromium Headless (Brave), FFmpeg, SVG/Canvas rendering, Discord API Webhooks.

---

### Task 1: Visual Architecture Diagram Asset Generator

**Files:**
- Create: `scripts/generate_diagram_asset.py`
- Output: `assets/diagram_rfc042_resolved.png` and `assets/diagram_rfc042_resolved.svg`

- [ ] **Step 1: Write standalone diagram generator script**
- [ ] **Step 2: Generate dark-mode SVG with connected colored blocks (Clients ➔ NLB ➔ 4-Node Cluster ➔ Redis Bloom Filter ➔ Outbox ➔ Kafka)**
- [ ] **Step 3: Convert SVG to 1920x1080 high-res PNG asset using Brave headless**
- [ ] **Step 4: Verify image output exists and is crisp**
- [ ] **Step 5: Commit `assets/diagram_rfc042_resolved.png`**

---

### Task 2: Multi-Turn Heated Clash & Visual Embed Discord Engine

**Files:**
- Create: `scripts/populate_dynamic_discord.py`
- Modify: `src/engine/council_coordinator.py:300-340`

- [ ] **Step 1: Update Discord webhook script with multi-turn clash (Aegis blocking ➔ Vanguard DB crash warning ➔ Aegis edge compromise ➔ Vanguard Redis Bloom ➔ Ledger $25k budget intervention ➔ Titan Outbox guarantee)**
- [ ] **Step 2: Attach visual diagram PNG directly to Discord when `!diagram` is called**
- [ ] **Step 3: Run script and verify Discord `#review-desk` contains full debate and image attachment**
- [ ] **Step 4: Commit changes**

---

### Task 3: Production-Grade 1080p Scene Composer

**Files:**
- Create: `scripts/render_master_demo_v2.py`
- Output: `demo_scenes_v2/scene_[1-5].png`, `demo_scenes_v2/clip_[1-5].mp4`

- [ ] **Step 1: Build 5 HTML scene templates with Discord dark theme, genuine member list, avatars, active typing states, and rendered diagram embed**
- [ ] **Step 2: Render 1080p PNGs using Brave headless**
- [ ] **Step 3: Encode 5 MP4 clips matched to exact narration segment durations**
- [ ] **Step 4: Concatenate into visual track `demo_scenes_v2/visual_track.mp4`**
- [ ] **Step 5: Commit scene composer**

---

### Task 4: Voiceover Audio Master & Synchronization

**Files:**
- Create: `scripts/build_narration_track_v2.py`
- Output: `demo_narration_master_v2.wav`

- [ ] **Step 1: Generate updated narration segments for the heated clash and diagram reveal**
- [ ] **Step 2: Measure exact audio durations and pad with 1.2s silence**
- [ ] **Step 3: Concatenate into master audio track**
- [ ] **Step 4: Verify audio plays cleanly**

---

### Task 5: Final Video Assembly & Verification

**Files:**
- Output: `blindcouncil_final_demo.mp4`

- [ ] **Step 1: Mux visual track with master audio track using FFmpeg**
- [ ] **Step 2: Verify duration (00:02:05 - 00:02:15), video stream (1080p 25fps), audio stream (AAC 44.1kHz)**
- [ ] **Step 3: Verify video in media player**
- [ ] **Step 4: Commit final deliverables**
