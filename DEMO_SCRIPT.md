# UPI SHIELD – 3-Minute Hackathon Demo Script

**Event**: Cyber Samvad 2026 Hackathon, Adani University  
**Team**: ThreatZero  
**Target Duration**: 3 Minutes (180 Seconds)  

---

### [0:00 – 0:20] The Problem (20 Seconds)
> "Good morning judges. UPI fraud works because scammers rush people into acting. But here is the critical insight: **hackers don't break UPI's cryptography; they manipulate the user's psychology.** 
> Scammers trick people into entering their secret PIN to 'receive' money, approve collect requests disguised as cashback, or panic them with fake KYC threats. Once they tap Pay, that money is gone in milliseconds.
> Today, Team ThreatZero presents **UPI Shield: Stop Fraud Before Payment**."

---

### [0:20 – 0:50] 1. Normal Payment Demo (30 Seconds)
> *(Action: Open app at `http://localhost:5173/`, Screen A)*
> "UPI Shield operates entirely inside the user's browser, completely offline and private.
> Let's look at **Case 1**: A routine grocery payment of ₹250 to *Ramesh Kirana Store*, a saved contact. 
> We click **Check Risk**. 
> *(Action: Click Check Risk -> Screen B)*
> Notice the result: **Score 0 / 100**, **LOW INDICATED RISK** in green. The primary action advises: *'Looks okay – still confirm the name and amount before paying.'* No false alarms, no unnecessary friction for normal daily life."

---

### [0:50 – 1:30] 2. The Big Threat: Fake Cashback & The Pause Screen (40 Seconds)
> *(Action: Click 'Check Another Request' -> Click Load on Case 2: Fake Collect / Cashback Scam)*
> "Now, look at **Case 2**. This is one of the most devastating scams in India: a collect request of ₹4,999 from 'Cashback Team', telling the user: *'Approve this request and enter your UPI PIN to receive cashback. Urgent, expires in 5 minutes.'*
> We click **Check Risk**.
> *(Action: Click Check Risk -> Screen B)*
> Instantly: **VERY HIGH RISK (95/100)** in dark red. 
> The main directive is unmistakable: **'DO NOT SHARE YOUR PIN'**.
> Under *Why we flagged this*, every signal is explained in simple English:
> - Requesting PIN to receive money (+40 pts)
> - Collect request masquerading as cashback (+30 pts)
> - Urgent manufactured deadline (+15 pts)
> - Unknown recipient handle with scam tokens (+10 pts)
> 
> Now, watch our core defense mechanism: **Try in Pause Demo**.
> *(Action: Click 'Try in Pause Demo' -> Screen C -> Click 'Pay ₹4999')*
> The moment the user tries to pay, **UPI Shield forcefully intervenes with the Pause Screen!**
> The continue button is **locked with a mandatory countdown timer**. The largest, primary button is **'Cancel Payment'**.
> We click Cancel. The payment aborts immediately, and our in-memory counter increments: *1 risky action stopped in this demo session!*"

---

### [1:30 – 2:05] 3. KYC Link & Hinglish Detection (35 Seconds)
> *(Action: Go to Screen A -> Load Case 8: Hinglish Urgency Scam)*
> "In India, fraud is rarely in formal English. Look at **Case 8**:
> *'Turant pin daalo, aapka refund milega, warna account band ho jayega.'*
> We click **Check Risk**.
> UPI Shield's normalization engine detects Hinglish vernacular: *'turant'* (urgency), *'pin daalo'* (credential request), *'refund'* (money trick), and *'account band ho jayega'* (coercive threat).
> It immediately flags **VERY HIGH RISK** with the exact matched words highlighted as evidence!
> 
> Furthermore, if an educator sends: *'Never share your UPI PIN or OTP'*, our context-aware negation engine recognizes it as an **Educational message** and does NOT falsely flag it!"

---

### [2:05 – 2:35] 4. Safety Checklist & Emergency Help (30 Seconds)
> *(Action: Switch language to हिंदी, then ગુજરાતી to show instant localization, then click Screen D: Safety Checklist)*
> "Our application is fully accessible in **English, Hindi, and Gujarati**.
> On **Screen D**, users have an interactive safety checklist, cards explaining common UPI fraud techniques, and an emergency response box:
> If anyone has already been tricked, we direct them to **Dial 1930** (National Cyber Crime Helpline) and file a complaint at **cybercrime.gov.in** immediately."

---

### [2:35 – 3:00] 5. Privacy, Ethics & Honest Boundaries (25 Seconds)
> "Finally, our strict security design:
> 1. **Zero real payments** — strictly a safe simulation.
> 2. **Zero storage** — nothing is saved to localStorage, cookies, or databases. If a user pastes a real PIN or card number, it is instantly masked.
> 3. **Honest Engineering** — we do not call this a magical AI or guarantee. It is an explainable, rule-based heuristic barrier that gives citizens the single most valuable defense in cybersecurity: **a moment to pause, verify, and stay safe.**
> 
> Thank you! We are Team ThreatZero, and we are ready for your questions."
