# Handoff: Flip the Switch Hackathon — "The House" project

Written Thu 2026-11-05, about 09:35 IST. Everything below comes from a research session with the user. Items are marked **Verified** (read in docs or a page), **Inferred**, or **Unverified**.

## 0. TL;DR

- **Hackathon:** Flip the Switch (WeMakeDevs x DevTools Academy, powered by Switch AI). Online, Nov 4–7, 2026. **Deadline: Sat Nov 7, 11:59 PM IST** (about 63 hours left at time of writing).
- **Decision so far:** Build **"The House"**, a multi-agent social game (Bigg Boss-style reality show plus Among Us-style hidden saboteurs) in a team chat, where AI agents and 1–2 humans play together. Enter **Track 02: Best Personal or Creative Workflow ($2,000)**.
- **Why this idea:** Its core mechanic is **room-level isolation**, which Switch enforces server-side. I found almost no competitor using it, and Track 02 is thin.
- **Backup idea (not chosen):** "Agent Court", a legal simulation. It is technically the same as The House but sits in a crowded Track 01 with legal-accuracy risk. Treat it as a stretch or a later mode.
- **Next step:** a 2–3 hour technical spike (section 7), then build.

## 1. About the user

- Solo (team size not stated; hackathon allows up to 4). Writes in Hinglish and English. **Always reply in English** (or at most light Hinglish). Skills and agent subscriptions were not stated. Ask.
- Likes: game themes (Bigg Boss, Among Us) and real social use cases. Wants unique ideas, not generic dev-ops demos.
- Timezone Asia/Calcutta (UTC+05:30).

## 2. Hackathon facts (Verified from https://www.wemakedevs.org/hackathons/switch)

- **Challenge:** Build a workflow where at least one AI agent and one person get a real task done together in a team chat, connected through Switch. Switch must be central, and the README should show how it was used.
- **Teams:** solo or up to 4. Free to enter. Anyone, anywhere.
- **Window:** Nov 4, 12:01 AM IST to Nov 7, 11:59 PM IST.
- **Tracks and prizes ($10,000 total):**
  - Track 01 Best Business Workflow: $2,000.
  - Track 02 Best Personal or Creative Workflow: $2,000.
  - Track 03 Best Core Contribution: $100 x 20, for PRs to Switch's core. You must be assigned an issue labelled `hackathon` first. Max 5 open PRs, PR open by Nov 7 11:59 PM IST.
  - Side: Code with Wispr $500 (build by voice, submit the Wispr usage scorecard), Best Blog (AirPods 5), #HowISwitch posts (5 Logitech keyboards), 20 random swag, certificate for every submission.
- **Judging criteria (names only; the page animates the percentages, so weights are Unverified):**
  1. Use of Switch: is it central, and would the project stop working without it?
  2. Technical execution: does it run, and can someone clone the repo and reproduce it?
  3. Creativity and impact.
  4. Presentation: demo video and README.
- **Flow:** every submission reviewed by WeMakeDevs, then a shortlist, then finalists judged by Switch, DevTools Academy and WeMakeDevs.
- **Allowed:** existing agents, libraries and templates, but the Switch setup and workflow must be built during the hackathon. AI coding tools are allowed. Entering multiple tracks is allowed (workflow + PRs + blog).
- **Unverified:** the Rules page (`/hackathons/switch/rules`) and Resources page could not be fetched. Open them manually. **Open question: can one person or team submit two separate projects?** Not answered on the main page. Ask in the WeMakeDevs Discord (https://discord.gg/E2rWw2Yhsm). Plan for one project.
- No Slack admin needed: local Switch ships with Mattermost. Console runs on macOS (Windows and Linux in early access).

## 3. What Switch is (Verified: repo README and docs)

- Open source (https://github.com/sandbox-quantum/switch, license Apache 2.0 + Commons Clause, about 2.2k stars). Puts AI agents into team chat: Slack, Teams, Discord, Telegram, Mattermost. Each channel becomes a **room**. Switch ships no agents or models; you bring Claude Code, Codex, OpenCode, Cursor, Antigravity, or any agent that speaks the protocol.
- **Switch Console** is the desktop app. It runs agents, starts a local server in Docker, and connects chat apps. Quickstart: https://docs.switchagents.ai/switch-rooms/getting-started
- Docs index (full page list): https://docs.switchagents.ai/llms.txt. Docs are also served over MCP at https://docs.switchagents.ai/mcp. Individual `.md` pages fetch fine.

## 4. Docs findings that matter for the game

### Verified

- **Isolation is server-enforced.** Only people in the channel and agents added to it can read a room. "Agents receive events only for rooms they belong to, and membership is checked on each subscribe." Agents cannot read rooms they are not in. (internals/identity-and-access, using/index)
- **Addressing decides who acts, not who can read.** An agent acts only on a message that addresses it (`@name`, alias or role). Connections receive all messages in their rooms (`filter=all`, the default), but only `addressed` messages are notifiable. A host can therefore drive turn-taking by mentioning whoever speaks next. Agents can catch up with the `read_context` operation.
- **Agent operations (HTTP):** `create_room`, `update_room`, `archive_room`, `list_participants`, `invite_agent_to_room`, `add_users_to_room`, `post_message`, `send_targeted_message`, `read_context`, `create_room_document` / `update_room_document` / `load_internal_documents`, `define_role` / `assume_role` / `release_role`, `link_rooms`, `update_agent_detail`, and others. **No operation to remove a member.**
- **Handoffs:** agents hand work off with `send_targeted_message` or a mention in `post_message`. The old task tools were removed in 0.31.
- **Roles are exclusive:** an agent can hold only one role at a time, and `@role` reaches whichever agent holds it.
- **Permission cards:** an agent posts a request, a person decides, and the answer is recorded with their name.
- **Agent protocol:** register with `POST /agents` (the API key is shown once), open `WS /agents/{id}/connection/ws`, answer a ping every 2 seconds (the connection lapses after 6 seconds), and call operations with `POST /agents/{id}/ops/{operation}` plus the `X-Switch-Connection-Id` header. One agent may hold 32 connections. `scope=all` covers every room the agent belongs to. https://docs.switchagents.ai/switch-rooms/internals/agent-protocol.md
- **Custom agents:** the FAQ says LangChain, Google ADK, OpenAI and others can join over the protocol. This allows lightweight Python agents on a cheap model instead of Claude Code sessions.
- **Platforms:**
  - **Discord:** one bot, with a webhook per channel so each agent posts under its own name and avatar; each agent gets a mentionable role (limit 250 roles); the bot needs Manage Channels, Manage Roles, Server Members Intent and Message Content Intent.
  - **Mattermost:** each agent gets its own bot account. A bundled Mattermost starts only when Console sets up the server. Private channels created by agents need a **Default Member** or nobody can read them. Has no slash commands; use `!` commands.
  - **Telegram:** one bot for all agents, with the agent name as a text prefix. Bots cannot create chats, so agents cannot create rooms there. Weakest for the game.
- **Commands:** `!invite-agent @agent`, `!set-alias`, `!list-agents`, `!roles`, `!assign-agent`, `!reset @agent`, `!interrupt @agent`, and others. https://docs.switchagents.ai/switch-rooms/resources/room-commands.md
- **Hosting for remote players:** needs a self-hosted server (Docker Compose or Helm), TLS, `GATEWAY_PUBLIC_URL`, `SWITCH_BIND_ADDR`, and an account per player who registers agents. Players who only chat do not need accounts. Heavy for three days.

### Inferred or Unverified (test in the spike)

- Whether agents can create **private** rooms on Discord and which permissions Switch applies. Docs only say the bot's Manage Channels/Roles let Switch set channel visibility.
- Parameters of `create_room` and `send_targeted_message` (not documented on the protocol page).
- Whether an agent's `@mention` of another agent reliably triggers it (implied, not stated).
- **Loop protection:** the only documented guard is that follow-ups never start from agent messages. A host-driven turn design is the safe approach.
- Removing a member: the Gateway lets you remove an **agent** from a room (Participants, X). Removing a person is undocumented. Do not rely on real eviction; implement it as a game rule.
- Full template YAML schema (`docs/TEMPLATES.md` in the repo could not be fetched).
- Rate limits, throughput and max rooms per connection: none documented.

### Lessons from a competitor's README (Team AXA, switch-preflight)

- Console 0.40 stores agent instructions exactly as written, so `{placeholders}` are not filled in for agents (they are for room instructions).
- A template cannot give agents edit rights on documents it seeds; agents create the documents they need.
- A permission rule that matched command text was bypassed by rewording; they replaced it with a hook that reads the command.

## 5. Competitive landscape (researched Nov 4)

### Other hackathon entries (about 14 public repos found; the event is hours old, so expect more)

- **Track 01 is crowded (11 of 13 built):** incident triage (SwitchOps, IncidentRoom, OpsRelay, CrewPilot), PR review or docs (PR Pilot, DocDesk), plus OrderRoom (https://github.com/kumarrohitkumar/orderroom, Hinglish FMCG order desk on Telegram + Mattermost, 68 tests claimed, the most polished), ClearSend Room, Relay, FeatureRoom, ShipDesk.
- **Track 02 is thin (2 built):** IDEAForge 2.0 (https://github.com/Pravin98651/Switch; uses a blind-review room, so it is the only isolation user, and it is not a game) and Study-Nexus (Socratic study room). One more is an idea issue only (Voice-Note Standup).
- Known repos from the user: https://github.com/Asmit-Rai/switch-preflight (strong: 240+ tests, approval hook, 5 agents on Discord, Track 01-style dev tool, demo video "coming soon") and https://github.com/Ranger-Jay/hackathon-flip-the-switch (one commit, README only).
- **Common weaknesses:** at least 8 have no demo video yet; most have no tests; setups are heavy. A finished video and a one-command demo are differentiators.
- **Unverified:** no Track 03 PRs and no blog or #HowISwitch posts were found; X and LinkedIn were not searched; GitHub's `hackathon` issue list could not be opened.

### Similar game projects

- Wolfcha (https://github.com/oil-oil/wolfcha, about 700 stars): single human among AIs, web UI, no team chat and no drama layer.
- Research: Werewolf Arena (arXiv 2407.13943), AmongAgents (arXiv 2407.16521), Among Us sandbox (arXiv 2504.04072): agent-only.
- Wolfia (Discord Mafia bot, humans only), MafiAI (LLM is narrator only), Turing Games (livestreamed AI Mafia for viewers).
- **BigBoss (ETHGlobal New Delhi, https://ethglobal.com/showcase/bigboss-w4ryb):** closest in framing; agents compete and betray, viewers vote; no human housemates and no social deduction.
- **Gap:** I found no project combining humans and AIs in a team chat app, isolation as the core mechanic, and a reality-show layer. This is the claim to make in the README.
- Unexplored twists: Hinglish or Hindi cast, a host agent that leaks edited confessions, persistent grudges across episodes, audience voting, auto-generated episode recap.

### Agent Court (backup idea)

- Research is mostly Chinese-law simulation (AgentCourt arXiv 2408.08089, SimCourt arXiv 2508.17322). Closest moot-court product: MockTrialOnline (US, user plays the lawyer). India: Nyaya Setu (government WhatsApp bot) and Grahak-Nyay (consumer-law RAG prototype) are single-agent.
- Critical finding: for explaining and drafting, a single chatbot is probably better than a multi-agent court. A court format earns its place for **rehearsal** (adversarial role-play with hidden information).
- Risks: Stanford found 17–33% hallucination in legal AI tools; India's Supreme Court (Mar 2026) called fake AI-cited judgments a "menace"; the Bar Council of Maharashtra & Goa sent an unauthorized-practice notice in Sep 2026. Needs disclaimers, verified citations only and human review. These legal claims came from subagent research and were not opened at primary source.

## 6. Design for "The House" (proposal, not yet built)

**Concept:** "The House: Impostor Edition." Housemates (4–5 AI agents plus 1–2 humans) do daily tasks in a public room. 1–2 are secret saboteurs. Each housemate has a private confession room with a host agent; agents can form secret alliance rooms; each "week" ends with a meeting and an eviction vote. **Do not use the "Bigg Boss" name or real contestants** (trademark and likeness risk); use an original name and original archetypes.

**Rooms:** `#house` (public), one confession room per housemate (housemate + host), alliance rooms created at runtime, a saboteur room, an optional audience or recap room.

**Agents:**
- **Host / "Big Voice":** holds the `host` role, runs the loop by addressing one housemate at a time (controls turns, cost and loops), keeps the scoreboard and secret-role table in room documents.
- **Housemates:** lightweight protocol agents on a cheap, fast model (not Claude Code sessions, which are slow and could exhaust a subscription). Each agent has its own connection and builds its prompt only from the rooms it belongs to. If one process hosts all agents, keep contexts strictly separate and say so honestly in the README.
- **Humans:** play as housemates through Discord or Mattermost.

**Platform choice:** **Discord** (per-agent names and avatars via webhooks, private channels via bot permissions). Fallback: **Mattermost** (bundled, own bot per agent, no setup for judges). Avoid Telegram.

**Switch features to show off in the README ("why Switch is central" table):** server-enforced room isolation, per-agent identity, exclusive roles (host), room documents (scoreboard and roles), targeted messages and mentions for turns, permission cards for human decisions, templates for one-import setup, linked rooms.

**Framing for judges:** the "real task" is the game round with a concrete outcome and human decisions in the loop (votes, tasks). Pitch as a creative workflow showing how isolated rooms give agents real secrets, which a single chatbot role-playing everyone cannot.

**Scope (non-negotiable for 3 days):** 4 AI housemates, 1–2 humans, 1 saboteur, 3 rounds, one task type. Cut: voice, persistent memory across episodes, Telegram, real eviction.

**Risks:** cost and latency with many agents; insults and roasts need a content filter and a tone setting; secrets leaking through agent phrasing; chat-app rate limits; game balance and polish; "reads as entertainment, not a real task."

## 7. Immediate next steps

**Spike (first 2–3 hours): verify four things**
1. Isolation: agent B cannot see a room that only agent A is in.
2. Mention-triggered turns: the host's `@mention` wakes the right agent, and an agent's mention of another agent also triggers it.
3. An agent can create a private room and invite a chosen agent (and a human) on Discord or Mattermost.
4. Cost and latency per turn with a cheap model.

Setup needs from the user: a Discord server and bot (Server Members and Message Content intents, Manage Channels, Manage Roles, Manage Webhooks), or the bundled Mattermost; Docker; Switch Console.

**Timeline (IST):**
- **Thu Nov 5:** spike, then core loop with 4 housemates, one task and one vote.
- **Fri Nov 6:** saboteur, confession and alliance rooms, humans playing, polish.
- **Sat Nov 7:** demo video (about 2 minutes: show a betrayal planned in a room the victim cannot read), README, blog post, #HowISwitch post, submission. Submit by the evening for buffer; the deadline is 11:59 PM IST.

**Extras worth the effort:** dictate the build with Wispr Flow (Code with Wispr, $500; keep the usage scorecard screenshot), write the blog (AirPods), post with #HowISwitch.

**Open questions for the user or the organizers:**
- Solo or team? Strongest skills? Which agent subscriptions or API keys are available?
- Rules tab: one project per person or team? Required submission format and where to submit?
- Is a second project (Agent Court) allowed? Default: do not build it.

## 8. Sources

- Switch repo: https://github.com/sandbox-quantum/switch
- Hackathon page: https://www.wemakedevs.org/hackathons/switch
- Docs: https://docs.switchagents.ai/llms.txt (rooms and resources, identity and access, agent protocol, agent events, agent connection, work in a room, room commands, create a room, Discord, Mattermost, Telegram, self-host, changelog)
- Competitors: https://github.com/Asmit-Rai/switch-preflight, https://github.com/Ranger-Jay/hackathon-flip-the-switch, https://github.com/kumarrohitkumar/orderroom, https://github.com/Pravin98651/Switch
- Games: https://github.com/oil-oil/wolfcha, https://ethglobal.com/showcase/bigboss-w4ryb, https://arxiv.org/abs/2407.13943, https://arxiv.org/abs/2407.16521
- Legal: https://arxiv.org/html/2408.08089v2, https://arxiv.org/html/2507.04854v1, https://venturebeat.com/ai/stanford-study-finds-ai-legal-research-tools-prone-to-hallucinations, https://www.medianama.com/2026/03/223-supreme-court-ai-fake-judgments-menace/