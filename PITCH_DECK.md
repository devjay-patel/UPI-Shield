# UPI SHIELD: Pitch Deck (7 Slides)
**Event**: Cyber Samvad 2026 Hackathon, Adani University  
**Team**: ThreatZero  
**Tagline**: *Stop Fraud Before Payment*  

---

## Slide 1: Title & Hook
- **Title**: UPI SHIELD – "Stop Fraud Before Payment"
- **Subtitle**: A Privacy-First, Pre-Payment Heuristic Defense Layer
- **Team**: ThreatZero (Cyber Samvad 2026, Adani University)
- **The Hook**: 
  > *"UPI payments are instant and hard to reverse. Once a victim enters their PIN, the money is gone. Reporting after the fact is necessary, but a warning BEFORE authorization is what can actually stop the loss."*

---

## Slide 2: The Problem – Psychological Exploitation, Not Broken Crypto
- **Key Insight**: Scammers do not break UPI's 256-bit encryption; they manipulate human psychology.
- **Top 4 Real-World Vectors**:
  1. **PIN-to-Receive Illusion**: Victims are convinced they must enter their secret UPI PIN to receive cashback, refunds, or lottery winnings.
  2. **Disguised Collect Requests**: An incoming debit request is dressed up as a prize disburser.
  3. **Panic & Fabricated Urgency**: Messages claiming electricity cutoffs, SIM blockages, or expired KYC within 10 minutes.
  4. **Unregulated Link Traps**: Shorteners and lookalike domains designed to collect credentials or promote remote screen-sharing tools (AnyDesk/TeamViewer).
- **The Gap**: Existing banking apps warn you *after* an incident or with static disclaimers that users habitually ignore.

---

## Slide 3: The Solution – Explainable Heuristic Pre-Authorization Shield
- **Core Concept**: An active, explainable checkpoint that intercepts the payment flow *before* the user touches the PIN pad.
- **Three Pillars**:
  1. **Pause**: Physically breaks the cognitive rush with a full-screen, countdown-locked intervention screen.
  2. **Explain**: Pinpoints *why* this transaction is dangerous with exact extracted evidence phrases, not a black-box mystery score.
  3. **Guide**: Delivers a single unambiguous directive (*"Do not share your PIN"* or *"Pause and verify"*).
- **100% Client-Side**: No backend, no bank API dependencies, fully offline-ready.

---

## Slide 4: System Architecture & The 6-Group Engine
- **Input Modalities**:
  - Payment Request parameters (Pay vs Collect, VPA, Amount, Message)
  - QR Payload parser (`upi://pay?` query analyzer with offline canvas image decoder)
  - Freeform SMS / WhatsApp text scanner
- **Engine Rules & Group Caps**:
  - **Group A (Cap 40)**: Secret & PIN Requests (PIN to receive, AnyDesk, OTP)
  - **Group B (Cap 30)**: Money-Tricks (Collect-as-cashback, advance prize fees)
  - **Group C (Cap 15)**: Urgency & Threats (*turant*, account blocked)
  - **Group D (Cap 25)**: Link Risks (URL shorteners, raw IP, insecure HTTP)
  - **Group E (Cap 15)**: Institutional Impersonation (RBI, Police, Bank KYC)
  - **Group F (Cap 25)**: Recipient & Parameter Checks (Unknown VPA, mismatch)
- **Combinatorial Synergies**: Secret request + Urgency = +10 bonus points.
- **Educational Filter**: Distinguishes advisory text (*"Never share your PIN"*) from actual scam attempts.

---

## Slide 5: Live Demonstration Highlights
- **Case 1 (Baseline)**: Normal grocery payment to *Ramesh Kirana Store* -> **Score 0 (Low Indicated Risk)**. Zero false alarm friction.
- **Case 2 (The Collect Scam)**: Cashback Team demanding ₹4,999 -> **Score 95 (Very High Risk)** -> *"DO NOT SHARE YOUR PIN"*.
- **The Pause Intervention**: Clicking Pay triggers a mandatory 5-second countdown lock, making "Cancel Payment" the prominent primary action.
- **Vernacular Recognition**: Detects Hinglish (*"Turant pin daalo, refund milega"*) with zero external NLP network latency.
- **Multilingual Voice Output**: Speaks warning aloud in English, Hindi, and Gujarati for accessibility.
- **One-Click 1930 Incident Brief**: Auto-generates an investigation-ready incident report for `cybercrime.gov.in`.

---

## Slide 6: Safety, Ethics & Privacy By Design
- **Zero Real Payments**: Simulation sandbox only.
- **Zero Secret Harvesting**: Never asks for PIN, OTP, or CVV. If pasted accidentally, secrets are masked (`••••••`) immediately.
- **Zero Data Retention**: No `localStorage`, no `sessionStorage`, no cookies, no tracking telemetry. State lives exclusively in volatile RAM.
- **Honest Positioning**: This is an explainable, rule-based warning engine. It gives a heuristic indicator, not proof or a safety guarantee.

---

## Slide 7: Impact & Roadmap to Production
- **Immediate Utility**: Ready for deployment as a public cyber-awareness portal during Cyber Samvad.
- **Production Integration Path**:
  1. **Android Accessibility / Assist Layer**: System overlay triggering on UPI app confirmation screens before PIN entry.
  2. **NPCI / Bank SDK**: Lightweight client-side library embeddable into BHIM, PhonePe, or bank applications.
  3. **On-Device SLM (Small Language Model)**: Quantized 1.5B/2B offline model (via WebGPU) for conversational pretext detection without cloud data transfer.
  4. **Dial 1930 Direct API**: Direct push to the Ministry of Home Affairs cybercrime reporting pipeline.
- **Team ThreatZero**: *"Helping people pause, verify, and stop fraud before payment."*
