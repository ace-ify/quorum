# Game Design Document (GDD)

## Title: The House Imposter: AI Reality Show
**Genre:** Social Deduction / Multi-Agent Reality TV Simulation  
**Platform:** Discord via Switch Protocol (or Terminal Simulator)  
**Tone:** Dramatic, Suspenseful, Satirical, Fast-Paced  

---

## 1. Lore & Premise

Welcome to **The House**. Five housemates (four autonomous AI personalities and one human player) are locked inside an isolated digital mansion monitored 24/7 by an all-powerful, mysterious entity known only as **"The Big Voice"**.

To survive and keep their rations, the housemates must cooperate on weekly survival tasks. But one housemate is not who they claim to be. Behind closed doors, **The Saboteur** has been promised immunity if they can subtly ruin the house's tasks, spark paranoia, and frame innocent housemates for eviction.

The only place of truth is **The Confession Room**—a soundproof chamber where contestants whisper their deepest fears and secret nominations to The Big Voice. But beware: *The Big Voice loves television ratings, and secrets rarely stay buried forever.*

---

## 2. The 1,000-Point Luxury Budget Task

### 2.1 The Objective
The House is credited with **1,000 Luxury Points** at the beginning of the week. The housemates must collectively debate, negotiate, and submit a single finalized list of grocery and luxury items before time expires.

### 2.2 The Official Catalog
| Item | Category | Cost (Pts) | Housemate Value / Cravings |
| :--- | :--- | :--- | :--- |
| **Flour & Rice Bag** | Essential | 150 | Mandatory staple for house survival |
| **Lentils & Dal Pack** | Essential | 100 | Mandatory staple for house survival |
| **Cooking Oil & Spices** | Essential | 100 | Mandatory staple for house survival |
| **Eggs (30-Pack)** | Essential / Food | 120 | Marcus demands this for basic meals |
| **Whey Protein Tub** | Protein / Fitness | 250 | **Marcus's obsession** — he will throw a tantrum without it |
| **Imported Espresso Roast** | Luxury / Drink | 200 | **Elena's obsession** — refuses to function on instant coffee |
| **High-Speed Wi-Fi Pass (24h)**| Luxury / Tech | 250 | **Arthur & Human preference** — for staying connected |
| **Luxury Spa & Bath Salts** | Luxury / Comfort | 200 | **Maya's obsession** — threatens emotional breakdown if denied |
| **Gourmet Chocolate Box** | Comfort / Sweet | 150 | Universal temptation |
| **Instant Cup Noodles (10x)** | Backup Food | 80 | Budget filler |
| **Energy Drinks (6-Pack)** | Drink | 100 | Quick stimulant |
| **Premium Scented Candles** | Luxury / Useless | 100 | Wasteful aesthetic item |

### 2.3 The Strict Rules
1. **The Budget Ceiling:** Total combined cost of submitted items must be **$\le$ 1,000 Points**.
2. **The Nutritional Mandate:** The submitted basket **MUST** include at least **three (3) Essential items** (Flour/Rice, Lentils, Oil).
3. **If Violated:** 
   - Budget > 1,000 pts OR < 3 Essentials $\implies$ **TASK FAILED**.
   - Punishment: Luxury items confiscated. The House is placed on a penalty diet of dry crackers and water.
4. **If Succeeded:**
   - The House receives all items. 
   - Each housemate whose personal obsession was included gains +10 Morale.

### 2.4 The Saboteur's Playbook
The Saboteur receives their mission secretly in `#saboteur-den`:
- **Tactic A (The Sneak Splurge):** Agree to essentials, but push aggressively for two high-ticket luxury items (e.g. Protein 250 + Espresso 200 + Spa Salts 200 + Wifi 250 + Essentials = 1,170 pts!) while confusing the math.
- **Tactic B (The Quiet Drop):** Offer to "help finalize the list" and silently drop Cooking Oil or Lentils to sneak in another luxury, causing the task to fail the Nutritional Mandate.
- **Tactic C (The Framing Gambit):** Vocally support an innocent player's greedy demand (e.g. egging Marcus on to demand two protein tubs) so the blame falls on them when the budget bursts.

---

## 3. Character Dossiers

### 3.1 The Host: "The Big Voice"
- **Role:** Master of ceremonies, room administrator, judge of tasks.
- **Tone:** Deep, sardonic, authoritative, calm. Speaks in third person ("The Big Voice notes with amusement...").
- **Signature Behavior:** Drops dramatic sound effects (in text: `*SIREN WAILS*`, `*CHIME SOUNDS*`), leaks confidential snippets into `#living-room` at the climax of debates.

### 3.2 Marcus — "The Fitness Buff"
- **Personality:** Loud, intense, physically disciplined, easily agitated by long debates.
- **Motivation:** Must secure eggs and protein at all costs. Views anyone cutting his nutrition as personal enemies.
- **Catchphrases:** "Look at the nutrition facts!", "We don't need scented candles, we need fuel!", "Don't play games with my diet!"
- **Vulnerability:** Highly predictable; easy for the Saboteur to bait into arguing about protein.

### 3.3 Elena — "The Sweet Influencer"
- **Personality:** Polished, ultra-polite, smiley in public, calculating behind closed doors.
- **Motivation:** Needs her premium coffee and aesthetic comforts. Master of passive-aggressive guilt trips.
- **Catchphrases:** "Guys, let's keep the vibe positive!", "I'm literally just asking for one little espresso...", "I hate drama, but honestly..."
- **Confession Behavior:** Instantly drops the sweet persona in `#confession-elena` and speaks like a ruthless political operative.

### 3.4 Arthur — "The Cold Analyst"
- **Personality:** Emotionless, statistical, condescending toward emotional arguments.
- **Motivation:** Keeping the numbers balanced; finding the mathematical optimum.
- **Catchphrases:** "The probability of failure is currently 84%.", "Your feelings do not alter the arithmetic.", "Let us verify the sum line by line."
- **Vulnerability:** Because he is blunt and unemotional, players often mistake his coldness for guilt.

### 3.5 Maya — "The Drama Queen"
- **Personality:** Volatile, theatrical, highly expressive, prone to taking anything as a personal insult.
- **Motivation:** Demands luxury spa comforts to manage her "overwhelming stress levels."
- **Catchphrases:** "I am being targeted and everyone knows it!", "This house is a toxic nightmare!", "After all I've done for this team?!"
- **Confession Behavior:** Weeps, vents, accuses at least two people of conspiring against her.

---

## 4. The Confession Room & The Leak Algorithm

### 4.1 The Confession Protocol
During Phase 4, The Big Voice summons each contestant:
```
[The Big Voice in #confession-maya]:
"Maya. Welcome to the Confession Room. Here, the walls have ears, but only mine. 
Who do you nominate for eviction this week, and what is your reason?"
```

Each player must provide:
1. `nominee`: Exactly one active housemate.
2. `public_excuse`: A sanitized reason they would say in public.
3. `raw_confession`: The unfiltered, scandalous truth.

### 4.2 The Dramatic Leak Algorithm
In Phase 3 (The Leak Phase), The Big Voice selects one high-impact quote to drop into `#living-room`:
- **Eligibility:** Any quote from an `#alliance` room or earlier `#confession` where a player accused or schemed against an ally.
- **Anonymization Option:** The Host can either reveal the speaker or redact the name:
  > *"The Big Voice intercepted this transmission from a private corner of the house: 'Let Marcus think we're buying his protein, then drop it at the last second and blame Arthur.' Discuss."*
- **Impact:** Automatically boosts suspicion meter between the conspirators and victims.

---

## 5. Eviction & Endgame Rules

### 5.1 The Nomination Tally
- Each valid nomination equals 1 vote.
- In case of a tie, the Human player's vote acts as the tie-breaker (giving the human decisive agency!).

### 5.2 The Eviction Ceremony
1. The Big Voice assembles everyone on the couch in `#living-room`.
2. The Big Voice reveals the votes:
   > *"Arthur: 3 votes. Maya: 1 vote. Marcus: 1 vote."*
3. The evicted player gives a final 1-line exit speech.
4. **The Dramatic Reveal:**
   - If Arthur is innocent: *"Arthur was INNOCENT. The Saboteur remains in The House."*
   - If Arthur was the Saboteur: *"Arthur was THE SABOTEUR! The Housemates have won the game!"*

### 5.3 Win Conditions
- **Housemates Win:** The Saboteur is identified and evicted.
- **Saboteur Wins:** The Saboteur survives until only 2 housemates remain (1 Innocent + 1 Saboteur), rendering eviction mathematically impossible.

