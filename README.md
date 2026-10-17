# UPI SHIELD – "Stop Fraud Before Payment"

**Event**: Cyber Samvad 2026 Hackathon, Adani University  
**Team**: ThreatZero  
**Topic**: UPI Fraud Prevention — Proactive Pre-Payment Heuristic Risk Warning & Intervention  

---

## 1. The Problem
Unified Payments Interface (UPI) payments are instant and hard to reverse. Cyber criminals routinely exploit user trust rather than cryptography. Victims are lured into:
1. **PIN-to-Receive Tricks**: Entering secret UPI PINs under the false pretext of receiving money, rewards, or refunds.
2. **Disguised Collect Requests**: Approving debit requests disguised as cashback or lottery credits.
3. **Manufactured Urgency & Panic**: Threatening immediate account suspension or legal action with malicious shortener links.
4. **Advance-Fee Scams**: Demanding small verification fees to claim fake prizes or jobs.

Once authorized, funds leave the victim's account in milliseconds, making recovery difficult.

---

## 2. The Solution: UPI Shield
**UPI Shield** is a privacy-first, 100% in-browser, explainable rule-based heuristic security layer. It operates **before** authorization:
- Analyzes payment requests, QR code payloads, and suspicious communication locally.
- Intercepts risky payments with an accessible **Pause Screen** featuring a mandatory countdown timer and a prominent "Cancel Payment" action.
- Explains **why** a warning triggered in plain language (English, हिंदी, ગુજરાતી) with exact evidence snippets.
- Enforces a single clear directive: *"Do not share your PIN"*, *"Pause and verify"*, or *"Check recipient details"*.

---

## 3. Key Features
- **4 Dedicated Screens**:
  - **Screen A (Check Request)**: 3 input modes (Payment Request, Safe QR Simulation, Freeform Message/Link), Live Demo Center with dynamic Pass/Fail testing, and saved sample contacts.
  - **Screen B (Result Analysis)**: 0–100 heuristic risk meter, 4-tier colored level badge, primary action banner, signal cards with evidence snippets, advice grid (What to Avoid & What to Do Now), and limits disclaimer.
  - **Screen C (Pause Demo)**: Generic simulated UPI mobile payment interface. Evaluates requests in real time. For Caution+ risk, triggers a full-screen Pause Overlay with a 3s/5s countdown timer, disabling the continue button and promoting cancellation. Maintains an in-memory session counter of prevented scams.
  - **Screen D (Safety Checklist & Help)**: In-memory interactive awareness checklist, common fraud vector cards, and direct instructions for the **1930 National Cyber Crime Helpline** & `cybercrime.gov.in`.
- **Accidental Secret Detection & Auto-Masking**: Detects 4–6 digit PINs/OTPs and 16-digit card numbers pasted into inputs, warning the user and automatically masking them.
- **Vernacular & Hinglish Recognition**: Evaluates vernacular Hindi/Gujarati urgency terms and Hinglish fraud phrases directly in input text.
- **Multilingual UI**: On-the-fly toggling between English, Hindi, and Gujarati.

---

## 4. Strict Safety & Privacy Architecture
1. **Zero Real Payments**: Simulated only. No money moves, and no banking APIs are connected.
2. **Zero Storage**: No `localStorage`, `sessionStorage`, `cookies`, `IndexedDB`, or backend databases. State resides purely in volatile memory.
3. **Zero Network Calls During Analysis**: 100% client-side execution; fully functional offline after loading.
4. **Safe URL & QR Handling**: Never opens, fetches, or visits decoded links. Uses standard URL parsing only.
5. **Heuristic Risk Indicator**: Clearly declared as a rule-based warning engine, never claimed as "AI", "ML", or a guarantee.
6. **No Secret Harvesting**: Never asks for PINs, OTPs, or passwords anywhere in the application.

---

## 5. How the Risk Engine Works
The detection engine (`src/engine/fraudEngine.js`) executes pure heuristic functions against configuration rules (`src/engine/rules.js`):

### Normalization & Educational Context Check
- Normalizes text, currency signs (`₹`, `Rs`, `INR`), and Hinglish variants.
- Scans for educational negation phrases (e.g. *"never share your UPI PIN or OTP"*). If no affirmative bypass exists, risk score remains 0 and results in an *"Educational message"*.

### Signal Groups & Caps
- **Group A (Secret Request, Cap 40)**: PIN/OTP/CVV sharing, entering PIN to receive funds, AnyDesk/TeamViewer remote installation.
- **Group B (Money-Trick, Cap 30)**: Collect request as refund/cashback, QR receive tricks, prize/lottery upfront fees.
- **Group C (Urgency & Threat, Cap 15)**: Time limits (*turant*, *abhi*, *urgent*), threats of account blockage/police.
- **Group D (Link Risk, Cap 25)**: URL shorteners, raw IP hosts, HTTP, suspicious domain words (`kyc`, `refund`), lookalike TLDs.
- **Group E (Impersonation, Cap 15)**: Claims of being RBI, bank KYC team, police, or coercive secrecy instructions.
- **Group F (Recipient & Payment Verification, Cap 25)**: Unrecognized VPA, name/ID mismatch, suspicious handle tokens, amounts > ₹5,000, unknown collect.

### Combination Bonuses
- Group A present + (Group C or D present): `+10`
- Group B present + Group C present: `+5`

### Risk Levels & Main Actions
| Score Range | Risk Level | Indicator Color | Priority Main Action |
| :--- | :--- | :--- | :--- |
| **0 – 24** | **LOW INDICATED RISK** | Green | *"Looks okay – still confirm the name and amount before paying."* |
| **25 – 49** | **CAUTION** | Amber | *"Check recipient details"* or *"Pause and verify"* |
| **50 – 74** | **HIGH RISK** | Red | *"Pause and verify"* |
| **75 – 100** | **VERY HIGH RISK** | Dark Red | *"Do not share your PIN"* (if Group A) or *"Pause and verify"* |

---

## 6. Tech Stack
- **Frontend Framework**: React 19 + Vite 8
- **Styling**: Vanilla CSS with custom cybersecurity design system (Dark navy, glassmorphism, responsive)
- **Icons**: Lucide React
- **Unit Testing**: Vitest 5 (26 unit tests for the engine; coverage is not measured and some rules are not yet tested)
- **Zero Backend / Zero Analytics**

---

## 7. Folder Structure
```
cyber-samvad/
├── index.html                     # Entry HTML with meta & fonts
├── package.json                   # Dependencies & npm scripts
├── vite.config.js                 # Vite configuration
├── src/
│   ├── main.jsx                   # React root entry
│   ├── App.jsx                    # Top-level shell & in-memory state
│   ├── index.css                  # Dark cybersecurity design system
│   ├── components/
│   │   ├── SafetyBanner.jsx       # Persistent top banner on all screens
│   │   ├── TopHeader.jsx          # Header with tabs & language toggle
│   │   ├── ScreenCheck.jsx        # Screen A: Inputs, QR parser, Demo Center
│   │   ├── ScreenResult.jsx       # Screen B: 0-100 meter, signals, advice
│   │   ├── ScreenPauseDemo.jsx    # Screen C: Simulated UPI & Pause overlay
│   │   └── ScreenChecklist.jsx    # Screen D: Awareness checklist & 1930 help
│   ├── engine/
│   │   ├── rules.js               # Rules, weights, caps, regex patterns
│   │   ├── fraudEngine.js         # Pure functional heuristic risk engine
│   │   └── fraudEngine.test.js    # 26 automated Vitest unit tests
│   ├── data/
│   │   ├── sampleCases.js         # 8 synthetic demo test cases
│   │   └── sampleContacts.js      # Baseline saved contacts
│   └── i18n/
│       ├── index.js               # Translation resolver
│       ├── en.js                  # English translations
│       ├── hi.js                  # Hindi translations
│       └── gu.js                  # Gujarati translations
```

---

## 8. Installation & Running Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Start local development server
npm run dev

# 4. Build production bundle
npm run build
```
Local application runs at: `http://localhost:5173/`

---

## 9. Current Limitations
- **Rule-Based Heuristic**: Relies on defined linguistic patterns and structural cues; adversarial evasion with novel spelling may require rule updates.
- **No Direct Bank/NPCI Feed**: Does not query central NPCI fraud databases or live bank blacklists.
- **Simulation Only**: Designed as an educational and workflow demonstrator; not embedded inside production banking apps.

---

## 10. Future Roadmap
1. **SDK / In-App Overlay Integration**: Package as an Android Accessibility / UPI plugin overlay for real-time app warnings with user consent.
2. **Audio Warnings**: Multilingual voice advisories for semi-literate users before entering PINs.
3. **On-Device Machine Learning**: Lightweight quantized on-device NLP model trained on verified cybercrime complaints to supplement heuristic rules.
4. **Offline Bluetooth / Peer Verification**: Peer confirmation for high-value transactions.
