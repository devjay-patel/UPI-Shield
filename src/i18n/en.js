export const en = {
  appTitle: "UPI Shield",
  tagline: "Stop Fraud Before Payment",
  teamName: "ThreatZero",
  event: "Cyber Samvad 2026 Hackathon | Adani University",
  safetyBanner: "Demo prototype. Analysis runs in your browser. No real payments. Never enter your real PIN, OTP, or password.",
  tabs: {
    check: "Check Request",
    result: "Result Analysis",
    pause: "Pause Demo",
    checklist: "Safety Checklist"
  },
  riskLevels: {
    low: "LOW INDICATED RISK",
    caution: "CAUTION",
    high: "HIGH RISK",
    veryHigh: "VERY HIGH RISK"
  },
  disclaimer: "This score is a warning indicator, not proof. A low score does not guarantee safety.",
  mainActions: {
    noPin: "Do not share your PIN",
    pauseVerify: "Pause and verify",
    checkRecipient: "Check recipient details",
    looksOkay: "Looks okay – still confirm the name and amount before paying."
  },
  educational: {
    title: "Educational message – no request to share secrets detected",
    explanation: "This message contains cyber safety awareness advice or negation phrases rather than an attempt to steal money or credentials."
  },
  secretWarning: "Do not paste real PINs, OTPs, or passwords here. Any detected sensitive codes will be masked immediately.",
  buttons: {
    checkRisk: "Check Risk",
    clear: "Clear",
    loadExample: "Load Example",
    tryPauseDemo: "Try in Pause Demo",
    checkAnother: "Check Another Request",
    cancelPayment: "Cancel Payment (Recommended)",
    continuePayment: "I understand the risk, continue",
    resetSession: "Reset Session",
    listenVoiceAlert: "Listen Voice Alert",
    exportReport: "Download Incident Report",
    uploadQrImage: "Upload QR Screenshot (Local Offline)"
  },
  common: {
    simulationNotice: "Simulation only – no money is sent.",
    demoSessionBlocks: "Risky actions stopped in this demo session: ",
    demoOnly: "(in-memory demo only)",
    charCount: "characters",
    evidence: "Evidence found:",
    score: "Risk Score"
  },
  checklist: {
    heading: "Before sending money or approving any UPI prompt, quickly verify these fundamental golden rules:",
    verifiedCount: "verified (session memory only)",
    items: [
      { id: 'item-1', text: 'Receiving money never needs your PIN.' },
      { id: 'item-2', text: 'A collect request means money will LEAVE your account.' },
      { id: 'item-3', text: 'Never share your PIN, OTP, or password. Banks never ask for them on call, chat, or SMS.' },
      { id: 'item-4', text: 'Check the recipient name before you confirm.' },
      { id: 'item-5', text: 'Do not rush. Scammers use fear and urgency.' },
      { id: 'item-6', text: 'Do not scan a QR code to "receive" money.' },
      { id: 'item-7', text: 'Do not click unknown links. Open your bank app yourself.' },
      { id: 'item-8', text: 'Do not install apps like AnyDesk because someone on a call asks.' },
      { id: 'item-9', text: 'Call the person on a number you already know if the request is from a "friend" or "relative".' }
    ],
    scamsTitle: "Common UPI Fraud Patterns",
    scams: [
      {
        title: 'Fake Collect Request',
        summary: 'Scammer sends a collect/request money notification disguised as cashback. Approving transfers money OUT.'
      },
      {
        title: 'QR Refund Scam',
        summary: 'Victim is told to scan a QR code and enter their PIN to "receive" an e-commerce refund or prize.'
      },
      {
        title: 'Fake KYC Update Link',
        summary: 'SMS threatens immediate bank account freeze unless you click a link and make a ₹1 or ₹10 verification payment.'
      },
      {
        title: 'Prize / Lottery Fee Trick',
        summary: 'Bogus notification says you won ₹25,000, but demands an upfront "processing tax or fee" first.'
      },
      {
        title: 'Fake Customer Care / AnyDesk',
        summary: 'Fraudster poses as bank support on Google search, instructing you to install remote screen sharing software.'
      }
    ],
    helplineTitle: "Already Lost Money or Tricked?",
    helplineSub: "National Cyber Crime Helpline (Ministry of Home Affairs, Govt. of India). Report immediately at cybercrime.gov.in. Notify your bank immediately to freeze the transaction before funds leave the UPI switch."
  }
};
