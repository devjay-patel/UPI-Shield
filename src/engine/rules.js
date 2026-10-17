/**
 * UPI Shield - Rule Configuration & Fraud Detection Knowledge Base
 * Cyber Samvad 2026 Hackathon | Team ThreatZero
 * 
 * All weights, phrase lists, caps, and heuristics are declared here.
 * Pure static configuration without UI or side effects.
 */

export const GROUP_CAPS = {
  GROUP_A: 40, // Secret request (PIN, OTP, remote desktop)
  GROUP_B: 30, // Money-trick (fake refund/cashback/fee/collect)
  GROUP_C: 15, // Urgency & coercive threats
  GROUP_D: 25, // Link & URL risks
  GROUP_E: 15, // Institutional/authority impersonation
  GROUP_F: 25  // Recipient identity & payment parameter checks
};

export const RISK_LEVELS = {
  LOW: {
    min: 0,
    max: 24,
    label: "LOW INDICATED RISK",
    color: "#10b981", // Emerald green
    badgeClass: "badge-low"
  },
  CAUTION: {
    min: 25,
    max: 49,
    label: "CAUTION",
    color: "#f59e0b", // Amber
    badgeClass: "badge-caution"
  },
  HIGH: {
    min: 50,
    max: 74,
    label: "HIGH RISK",
    color: "#ef4444", // Red
    badgeClass: "badge-high"
  },
  VERY_HIGH: {
    min: 75,
    max: 100,
    label: "VERY HIGH RISK",
    color: "#b91c1c", // Dark red
    badgeClass: "badge-very-high"
  }
};

export const MAIN_ACTIONS = {
  NO_PIN: "Do not share your PIN",
  PAUSE_VERIFY: "Pause and verify",
  CHECK_RECIPIENT: "Check recipient details",
  LOOKS_OKAY: "Looks okay – still confirm the name and amount before paying."
};

/**
 * Educational / Negation phrases.
 * If sensitive keywords (PIN, OTP) appear ONLY alongside these negation or advice phrases,
 * it is treated as a cyber safety awareness message.
 */
export const EDUCATIONAL_NEGATION_PHRASES = [
  "never share",
  "do not share",
  "don't share",
  "never give",
  "kabhi share mat karo",
  "kabhi mat share karo",
  "pin kisi ko mat batao",
  "otp kisi ko mat batao",
  "kisi ko mat dena",
  "awareness",
  "tips",
  "be careful",
  "alert",
  "advisory",
  "rbi says",
  "npci says",
  "do not need to enter",
  "never need to enter",
  "never enter",
  "do not enter",
  "don't enter",
  "not required to enter",
  // Hindi Devanagari Negation
  "पिन कभी शेयर मत करो",
  "पिन किसी को मत बताओ",
  "ओटीपी किसी को मत देना",
  "सावधान रहें",
  "सतर्क रहें",
  // Gujarati Negation
  "પિન ક્યારેય શેર કરશો નહીં",
  "પિન કોઈને આપશો નહીં",
  "ઓટીપી કોઈને કહેશો નહીં",
  "સાવચેત રહો"
];

/**
 * Secret Request Patterns (Group A - Cap 40)
 */
export const GROUP_A_RULES = {
  PIN_TO_RECEIVE: {
    id: "A_PIN_TO_RECEIVE",
    points: 40,
    label: "PIN requested to receive money / refund",
    explanation: "You NEVER need to enter your UPI PIN to receive money. Entering a PIN only sends money out of your account.",
    patterns: [
      /enter\s+(your\s+)?(upi\s+)?pin\s+to\s+(receive|get|claim|collect)/i,
      /type\s+(your\s+)?(upi\s+)?pin\s+to\s+(receive|get|claim|collect)/i,
      /scan\s+and\s+enter\s+(your\s+)?(upi\s+)?pin/i,
      /pin\s+daalo.*(?:refund|cashback|paisa|paise)/i,
      /pin\s+enter\s+karo.*(?:refund|cashback|paisa|paise|lene)/i,
      /pin\s+enter\s+karke\s+paisa/i,
      /enter\s+pin.*cashback/i,
      /enter\s+pin.*refund/i,
      // Hindi Devanagari
      /पिन\s+(?:डालो|दर्ज\s+करें|एंटर\s+करो).*(?:रिफंड|कैशबैक|पैसे|प्राप्त)/i,
      /पैसे\s+पाने\s+के\s+लिए\s+पिन/i,
      // Gujarati
      /પિન\s+(?:નાખો|દાખલ\s+કરો).*(?:રિફંડ|કેશબેક|પૈસા)/i,
      /પૈસા\s+મેળવવા\s+પિન/i
    ]
  },
  SECRET_DISCLOSURE: {
    id: "A_SECRET_DISCLOSURE",
    points: 40,
    label: "Request for PIN, OTP, password, or CVV",
    explanation: "Legitimate businesses, banks, and apps never ask you to share or tell your secret UPI PIN, OTP, or passwords.",
    patterns: [
      /(?:share|tell|send|provide|give)\s+(?:your\s+)?(?:upi\s+)?(?:pin|otp|password|cvv)/i,
      /(?:enter|put|type)\s+(?:your\s+)?(?:upi\s+)?(?:pin|otp|cvv)\s+here/i,
      /pin\s+(?:daalo|batao|bhejo|bolo)/i,
      /otp\s+(?:batao|bhejo|daalo|share\s+karo)/i,
      /pin\s+maang\s+raha/i,
      // Hindi Devanagari
      /पिन\s+(?:बताओ|भेजो|शेयर\s+करो)/i,
      /ओटीपी\s+(?:बताओ|भेजो|दर्ज\s+करो|शेयर\s+करो)/i,
      // Gujarati
      /પિન\s+(?:આપો|કહો|મોકલો)/i,
      /ઓટીપી\s+(?:આપો|કહો|શેર\s+કરો)/i
    ]
  },
  REMOTE_ACCESS: {
    id: "A_REMOTE_ACCESS",
    points: 35,
    label: "Remote screen sharing application requested",
    explanation: "Scammers use remote access tools (AnyDesk, TeamViewer) to view your screen and steal credentials.",
    patterns: [
      /\b(anydesk|teamviewer|quicksupport|any\s*desk|team\s*viewer|zoho\s*assist|rustdesk)\b/i,
      /install\s+app\s+for\s+support/i,
      /share\s+screen\s+to\s+verify/i,
      /screen\s+share\s+karo/i
    ]
  }
};

/**
 * Money-trick Patterns (Group B - Cap 30)
 */
export const GROUP_B_RULES = {
  COLLECT_AS_REFUND: {
    id: "B_COLLECT_AS_REFUND",
    points: 30,
    label: "Collect request used as refund or reward",
    explanation: "A collect request takes money OUT of your bank account. It can never be used to send you money or a refund.",
    patterns: [
      /approve\s+(this\s+)?request.*(?:receive|get|claim|cashback|refund)/i,
      /collect\s+request.*(?:refund|cashback|prize|lottery)/i
    ]
  },
  QR_RECEIVE_TRICK: {
    id: "B_QR_RECEIVE_TRICK",
    points: 30,
    label: "QR payment disguised as receiving money",
    explanation: "Scanning a QR code is exclusively for paying money, never for receiving incoming funds.",
    patterns: [
      /(?:scan|scan\s+this).*receive/i,
      /(?:scan|scan\s+this).*paisa\s+milega/i,
      /qr.*(?:refund|cashback|prize)/i
    ]
  },
  PROCESSING_FEE_PRIZE: {
    id: "B_PROCESSING_FEE_PRIZE",
    points: 30,
    label: "Processing fee demanded to claim prize or lottery",
    explanation: "Demanding upfront fee or payment to release prize money or lottery winnings is a hallmark advance-fee scam.",
    patterns: [
      /(?:pay|processing)\s+fee.*(?:prize|reward|lottery|won|receive)/i,
      /(?:congratulations|you\s+won).*pay.*(?:fee|processing)/i,
      /fee\s+now\s+to\s+receive\s+your\s+prize/i
    ]
  },
  REFUND_PRIZE_PAYMENT: {
    id: "B_REFUND_PRIZE_PAYMENT",
    points: 25,
    label: "Claim of prize, lottery, or refund requiring action",
    explanation: "Scammers lure victims with fake lottery winnings or refunds, then demand approval or processing payments.",
    patterns: [
      /(?:you\s+won|won|winner|lottery|lucky\s+draw|jackpot).*(?:claim|fee|pay|processing)/i,
      /(?:claim|get|receive)\s+(?:your\s+)?(?:cashback|refund|prize|reward)/i,
      /refund\s+milega/i,
      /inaam\s+jeeta\s+hai/i,
      /congratulations!.*you\s+won/i
    ]
  },
  PAY_TO_VERIFY: {
    id: "B_PAY_TO_VERIFY",
    points: 25,
    label: "Pay small amount / fee to verify or claim",
    explanation: "Demanding a 'processing fee' or 'token payment of ₹1 / ₹10' to verify accounts or claim prizes is a common trap.",
    patterns: [
      /pay\s+(?:small\s+amount|processing\s+fee|token|rs\.?\s*\d+|₹\s*\d+)\s+to\s+(?:verify|claim|activate)/i,
      /processing\s+fee.*(?:prize|reward|lottery)/i,
      /paisa\s+bhejo\s+verify\s+ke\s+liye/i,
      /pay\s+rs\s*\d+\s+to\s+verify/i
    ]
  }
};

/**
 * Urgency & Threat Phrases (Group C - Cap 15)
 */
export const GROUP_C_RULES = {
  SINGLE_URGENCY: 8,
  MULTIPLE_URGENCY_OR_THREAT: 15,
  URGENCY_WORDS: [
    "urgent",
    "immediately",
    "last chance",
    "within 10 minutes",
    "within 5 minutes",
    "today only",
    "turant",
    "abhi",
    "jaldi",
    "expires soon",
    "expires in",
    "act fast",
    "limited time",
    "now",
    "right now",
    "pay now",
    // Vernacular urgency
    "तुरंत",
    "अभी",
    "जल्दी",
    "તાત્કાલિક",
    "હમણાં",
    "જલ્દી"
  ],
  THREAT_WORDS: [
    "account blocked",
    "account suspended",
    "legal action",
    "police",
    "arrest",
    "sim blocked",
    "electricity disconnect",
    "power cut",
    "deactivated",
    "penalty",
    "account band ho jayega",
    "police case",
    "court notice",
    // Vernacular threats
    "खाता बंद",
    "खाता ब्लॉक",
    "पुलिस केस",
    "सिम ब्लॉक",
    "વીજળી કાપ",
    "ખાતું બ્લોક",
    "ખાતું બંધ"
  ]
};

/**
 * Link Risk Rules (Group D - Cap 25)
 * Safe parsing only - never visit or fetch.
 */
export const GROUP_D_RULES = {
  SHORTENERS: [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "cutt.ly",
    "is.gd",
    "buff.ly",
    "ow.ly",
    "rb.gy",
    "goo.gl"
  ],
  SUSPICIOUS_DOMAIN_WORDS: [
    "kyc",
    "verify",
    "update",
    "reward",
    "refund",
    "bank-login",
    "secure-login",
    "helpline",
    "cashback",
    "claim"
  ],
  SUSPICIOUS_TLDS: [
    ".xyz",
    ".top",
    ".click",
    ".work",
    ".gq",
    ".cf",
    ".tk",
    ".ml",
    ".buzz",
    ".rest"
  ],
  WEIGHTS: {
    SHORTENER: 8,
    HTTP: 5,
    IP_HOST: 12,
    SUSPICIOUS_WORD: 10,
    LOOKALIKE_OR_ODD_TLD: 10,
    LINK_WITH_SECRET_REQUEST: 10
  }
};

/**
 * Impersonation (Group E - Cap 15)
 */
export const GROUP_E_RULES = {
  AUTHORITY_IMPERSONATION: {
    id: "E_AUTHORITY",
    points: 15,
    label: "Claim of official bank, RBI, police, or authority",
    explanation: "Fraudsters often impersonate the Reserve Bank of India, bank officials, police, or KYC teams to induce panic.",
    patterns: [
      /\b(rbi|reserve\s+bank|npci|sbi\s+team|hdfc\s+team|icici\s+team|axis\s+team)\b/i,
      /\b(kyc\s+team|kyc\s+department|customer\s+care|electricity\s+office|courier\s+team)\b/i,
      /\b(police\s+officer|cyber\s+cell|cbi|income\s+tax)\b/i,
      /relative\s+in\s+emergency/i,
      /dear\s+customer.*(?:kyc|account)/i
    ]
  },
  SECRECY_COERCION: {
    id: "E_SECRECY",
    points: 15,
    label: "Instructions to conceal or bypass bank warnings",
    explanation: "Telling you to hide conversations or ignore bank warnings is a strong sign of fraud.",
    patterns: [
      /do\s+not\s+tell\s+anyone/i,
      /don't\s+call\s+(the\s+)?bank/i,
      /ignore\s+bank\s+messages/i,
      /kisi\s+ko\s+mat\s+batana/i,
      /keep\s+this\s+confidential/i
    ]
  }
};

/**
 * Recipient & Payment Checks (Group F - Cap 25)
 */
export const GROUP_F_RULES = {
  UNKNOWN_RECIPIENT: {
    points: 8,
    id: "F_UNKNOWN_RECIPIENT",
    label: "Recipient not found in saved contacts",
    explanation: "This recipient is not in your sample saved contacts list. Double-check before sending money."
  },
  NAME_ID_MISMATCH: {
    points: 12,
    id: "F_NAME_ID_MISMATCH",
    label: "Name and UPI ID show significant mismatch",
    explanation: "The displayed name and the underlying UPI address do not correlate, which frequently happens with deceptive accounts."
  },
  ODD_UPI_HANDLE: {
    points: 10,
    id: "F_ODD_HANDLE",
    label: "UPI ID contains suspicious keywords or excessive digits",
    explanation: "Handles containing scam words (cashback, reward, refund, kyc, support) or strange digit strings warrant verification."
  },
  HIGH_AMOUNT: {
    points: 5,
    id: "F_HIGH_AMOUNT",
    label: "Amount exceeds sample threshold (₹5,000)",
    explanation: "Higher payments carry greater financial risk if sent to an unintended recipient."
  },
  UNKNOWN_COLLECT: {
    points: 10,
    id: "F_UNKNOWN_COLLECT",
    label: "Collect request initiated by unknown contact",
    explanation: "Collect requests directly debit your bank account. Accepting one from an unknown sender is dangerous."
  },
  INVALID_VPA_FORMAT: {
    points: 15,
    id: "F_INVALID_VPA_FORMAT",
    label: "Invalid or malformed UPI ID (VPA) format",
    explanation: "Standard UPI addresses follow the 'username@bank' structure without spaces or illegal symbols. A malformed handle indicates a fake or deceptive payment request."
  }
};

/**
 * Common UPI Handle suspicious tokens
 */
export const SUSPICIOUS_HANDLE_TOKENS = [
  "cashback",
  "reward",
  "rewards",
  "refund",
  "support",
  "kyc",
  "helpdesk",
  "desk",
  "claim",
  "lottery"
];
