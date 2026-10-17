# Judge Q&A Defense Sheet – Cyber Samvad 2026 Hackathon
**Team**: ThreatZero | **Project**: UPI Shield

---

### Q1: "Why did you build a rule-based engine instead of using a deep learning / LLM model?"
**Winning Answer**:
> *"Three reasons: **Latency, Privacy, and Determinism**. 
> First, when a user is in a checkout flow, a cloud LLM API call adds 1 to 3 seconds of network latency and fails when connectivity drops. Our rule engine runs locally in the browser, with no network call, and keeps working offline.
> Second, privacy: sending personal payment notes, recipient VPAs, or SMS messages to external cloud AI servers introduces massive DPDP Act compliance liabilities.
> Third, in banking security, explainability is legally paramount. An auditor or judge needs to know exactly why a transaction was flagged (+40 pts for PIN request, +30 pts for collect request). A black-box neural network cannot provide auditable certainty."*

---

### Q2: "What if scammers change their wording to bypass your keyword lists?"
**Winning Answer**:
> *"Our engine evaluates **structural intent**, not just static words. 
> For example:
> 1. Even if the text avoids the word 'fraud', the combination of a **Collect Request type** paired with an **unknown VPA** and **rush language** triggers Group B and Group F.
> 2. In our roadmap, we designed an on-device hybrid architecture: rule-based heuristics act as a Tier-1 millisecond filter, while a lightweight quantized on-device Small Language Model (SLM) runs locally via WebGPU/TensorFlow.js to detect semantic paraphrase tricks without sending data to the cloud."*

---

### Q3: "How would this actually run in real life without rooting the user's phone or hacking into PhonePe/Google Pay?"
**Winning Answer**:
> *"There are two practical deployment pathways:
> 1. **Bank/UPI App Integration (Primary)**: Banks and PSPs (like PhonePe, Paytm, BHIM) can drop our lightweight `fraudEngine.js` directly into their payment confirmation views as a pre-authorization check before invoking the NPCI Common Library PIN screen.
> 2. **Android Accessibility / Digital Wellbeing Service (Consumer App)**: A dedicated security app (similar to Truecaller or Samsung Knox) can use Android's Accessibility API with explicit user consent to detect when a payment confirmation screen is active, inspect the text elements, and display our Pause Overlay."*

---

### Q4: "Does your Pause screen add friction that will annoy normal users?"
**Winning Answer**:
> *"We specifically designed an asymmetric friction model:
> For normal transactions (like Case 1: groceries to a saved merchant), the score is 0 / Low Risk. There is **zero interruption** and no countdown timer. 
> The Pause screen only activates when risk is Caution (3s) or High/Very High (5s). Cyberpsychology research shows that scammers rely on manufacturing tunnel vision. A 5-second mandatory pause breaks that adrenaline rush and allows cognitive verification to kick in."*

---

### Q5: "How do you prevent false positives on legitimate educational messages?"
**Winning Answer**:
> *"We implemented a dedicated **Contextual Negation Engine**. If words like 'PIN' or 'OTP' appear alongside negation patterns such as 'never share', 'do not enter', or 'advisory', the engine classifies it as an **Educational message** and suppresses false Group A alarms. However, if a scammer attempts a pretext bypass (e.g., 'Never share PIN, but enter PIN here to claim refund'), our affirmative conflict detector overrides the negation and flags the scam."*

---

### Q6: "What if a user accidentally types their real PIN or password into your tool?"
**Winning Answer**:
> *"We enforce a strict safety rule: **our application never asks for credentials, never logs them, and does not have any backend or database**. 
> Furthermore, we built a real-time regex scanner that detects 4–6 digit codes adjacent to PIN/OTP keywords or 16-digit card patterns, immediately triggers a safety alert, and masks the display with `••••••`."*

---

### Q7: "How does this help after a user has already fallen for a trick?"
**Winning Answer**:
> *"While our core mission is prevention before authorization, Screen D and our new **Export Incident Report** feature generate a structured brief ready to read to the **1930 National Cyber Crime Helpline** or upload to **cybercrime.gov.in**. Every second counts when freezing money before it is laundered through mule accounts."*

---

### Q8: "Why do you have a language toggle?"
**Winning Answer**:
> *"Financial inclusion in India is multilingual. Many UPI users are more comfortable in Hindi, Gujarati, or other regional languages than in English. In a moment of panic, reading a technical warning in English causes confusion. By providing immediate translation and audio voice warnings, we protect the most vulnerable citizens."*

---

### Q9: "Can you guarantee a transaction is 100% safe if the score is 0?"
**Winning Answer**:
> *"No, and we are honest about this in our disclaimer on every screen. A score of 0 means no known heuristic risk patterns were detected. We explicitly display: 'This score is a warning indicator, not proof. A low score does not guarantee safety.' We never use misleading words like 'verified' or '100% safe'."*

---

### Q10: "What makes Team ThreatZero different from existing bank warning messages?"
**Winning Answer**:
> *"Existing bank warnings are static, tiny disclaimers at the bottom of the screen that users suffer 'banner blindness' from. 
> UPI Shield is:
> 1. **Dynamic & Contextual**: Tailored to the specific request (PIN trick, QR scam, collect trap).
> 2. **Interventionist**: Forces a pause with a countdown timer before payment.
> 3. **Action-Oriented**: Offers a large, accessible 'Cancel Payment' button as the easiest choice."*
