/**
 * UPI Shield - Core Fraud Detection Engine (Pure Functions)
 * Cyber Samvad 2026 Hackathon | Team ThreatZero
 * 
 * Strict Safety & Architectural Constraints:
 * - 100% In-Browser Execution.
 * - No network calls, no external AI/ML APIs.
 * - No storage (no localStorage, cookies, IndexedDB, DB).
 * - Heuristic explainable rule-based engine.
 */

import {
  GROUP_CAPS,
  RISK_LEVELS,
  MAIN_ACTIONS,
  EDUCATIONAL_NEGATION_PHRASES,
  GROUP_A_RULES,
  GROUP_B_RULES,
  GROUP_C_RULES,
  GROUP_D_RULES,
  GROUP_E_RULES,
  GROUP_F_RULES,
  SUSPICIOUS_HANDLE_TOKENS
} from './rules.js';

import { isKnownContact } from '../data/sampleContacts.js';

/**
 * Normalizes input text: lowercases, trims whitespace, standardizes currency representations.
 */
export function normalizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[₹]/g, ' rs ')
    .replace(/\binr\b/g, ' rs ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks for accidentally pasted credentials (PIN, OTP, CVV, 16-digit Card).
 * Pure detection and masking - does not store anything.
 */
export function detectAndMaskSecrets(text) {
  if (!text || typeof text !== 'string') {
    return { hasSecrets: false, maskedText: text, warning: null };
  }

  let hasSecrets = false;
  let masked = text;

  // 16-digit card number pattern
  const cardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  if (cardRegex.test(text)) {
    hasSecrets = true;
    masked = masked.replace(cardRegex, '••••-••••-••••-••••');
  }

  // 4-6 digit numeric code immediately adjacent to PIN/OTP/CVV keywords
  const secretCodeRegex = /\b(pin|otp|cvv|password)\b(?:\s*(?:is|=|:|-)?\s*)([0-9]{4,6})\b/gi;
  if (secretCodeRegex.test(masked)) {
    hasSecrets = true;
    masked = masked.replace(secretCodeRegex, '$1: ••••••');
  }

  return {
    hasSecrets,
    maskedText: masked,
    warning: hasSecrets
      ? "Do not paste real PINs, OTPs, or passwords here. Any detected sensitive codes are masked for safety."
      : null
  };
}

/**
 * Safely parses a UPI URI without opening network connections.
 * Format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
 */
export function parseUpiQrPayload(payload) {
  if (!payload || typeof payload !== 'string') {
    return { isValid: false, error: 'Empty payload' };
  }

  const clean = payload.trim();
  if (!clean.startsWith('upi://pay')) {
    return {
      isValid: false,
      error: 'Not a standard UPI QR URI (expected scheme: upi://pay?...)'
    };
  }

  try {
    const questionIndex = clean.indexOf('?');
    if (questionIndex === -1) {
      return { isValid: false, error: 'Missing parameters in UPI payload' };
    }

    const queryString = clean.slice(questionIndex + 1);
    const params = new URLSearchParams(queryString);

    return {
      isValid: true,
      pa: params.get('pa') || '', // Payee VPA
      pn: params.get('pn') || '', // Payee Name
      am: params.get('am') || '', // Amount
      cu: params.get('cu') || 'INR',
      tn: params.get('tn') || '', // Note / Purpose
      rawParams: Object.fromEntries(params.entries())
    };
  } catch (err) {
    return { isValid: false, error: 'Failed to parse UPI QR parameters safely' };
  }
}

/**
 * Evaluates whether text is purely educational awareness (e.g. "Never share PIN").
 */
export function evaluateEducationalContext(normalizedText) {
  if (!normalizedText) return false;

  const hasNegation = EDUCATIONAL_NEGATION_PHRASES.some(phrase =>
    normalizedText.includes(phrase)
  );

  if (!hasNegation) return false;

  // Check if there is an affirmative conflict (e.g. "never share, but enter PIN here")
  const hasAffirmativeBypass =
    /\b(but|however|still|lekin|magar)\b.*(?:enter|share|daalo|batao)\s+(?:your\s+)?pin/i.test(
      normalizedText
    ) ||
    /click\s+here\s+to\s+receive/i.test(normalizedText) ||
    /approve\s+this\s+request/i.test(normalizedText);

  return hasNegation && !hasAffirmativeBypass;
}

/**
 * Safe Link Analyzer (Safe URL parse only, never visits or opens).
 */
export function analyzeLink(linkString, fullContextText = '') {
  if (!linkString || typeof linkString !== 'string') return null;

  const trimmed = linkString.trim();
  if (!trimmed) return null;

  const findings = [];
  let highestWeight = 0;

  // Check for HTTP
  if (trimmed.startsWith('http://')) {
    findings.push({
      rule: 'HTTP_INSECURE',
      weight: GROUP_D_RULES.WEIGHTS.HTTP,
      evidence: 'http:// (unencrypted connection)'
    });
    highestWeight = Math.max(highestWeight, GROUP_D_RULES.WEIGHTS.HTTP);
  }

  try {
    // Add protocol if missing to safely parse hostname
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = urlObj.hostname.toLowerCase();

    // Check raw IP address as host
    const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(host)) {
      findings.push({
        rule: 'IP_ADDRESS_HOST',
        weight: GROUP_D_RULES.WEIGHTS.IP_HOST,
        evidence: `Direct IP hostname (${host})`
      });
      highestWeight = Math.max(highestWeight, GROUP_D_RULES.WEIGHTS.IP_HOST);
    }

    // Check Shorteners
    const isShortener = GROUP_D_RULES.SHORTENERS.some(shortener =>
      host === shortener || host.endsWith('.' + shortener)
    );
    if (isShortener) {
      findings.push({
        rule: 'URL_SHORTENER',
        weight: GROUP_D_RULES.WEIGHTS.SHORTENER,
        evidence: `Known URL shortener (${host})`
      });
      highestWeight = Math.max(highestWeight, GROUP_D_RULES.WEIGHTS.SHORTENER);
    }

    // Check Suspicious Domain Words
    const matchedSuspiciousWord = GROUP_D_RULES.SUSPICIOUS_DOMAIN_WORDS.find(word =>
      host.includes(word)
    );
    if (matchedSuspiciousWord) {
      findings.push({
        rule: 'SUSPICIOUS_DOMAIN_WORD',
        weight: GROUP_D_RULES.WEIGHTS.SUSPICIOUS_WORD,
        evidence: `Domain contains keyword '${matchedSuspiciousWord}'`
      });
      highestWeight = Math.max(highestWeight, GROUP_D_RULES.WEIGHTS.SUSPICIOUS_WORD);
    }

    // Check Odd / Suspicious TLDs
    const matchedTld = GROUP_D_RULES.SUSPICIOUS_TLDS.find(tld =>
      host.endsWith(tld)
    );
    if (matchedTld) {
      findings.push({
        rule: 'SUSPICIOUS_TLD',
        weight: GROUP_D_RULES.WEIGHTS.LOOKALIKE_OR_ODD_TLD,
        evidence: `Unusual top-level domain (${matchedTld})`
      });
      highestWeight = Math.max(highestWeight, GROUP_D_RULES.WEIGHTS.LOOKALIKE_OR_ODD_TLD);
    }

    // Check if link is paired with request for secrets in context
    if (
      /(?:pin|otp|cvv|password|verify)/i.test(fullContextText) &&
      findings.length > 0
    ) {
      findings.push({
        rule: 'LINK_WITH_SECRET_REQUEST',
        weight: GROUP_D_RULES.WEIGHTS.LINK_WITH_SECRET_REQUEST,
        evidence: 'Link paired with credential or verification request'
      });
      highestWeight = Math.max(
        highestWeight,
        GROUP_D_RULES.WEIGHTS.LINK_WITH_SECRET_REQUEST
      );
    }
  } catch (e) {
    // Malformed URL
    findings.push({
      rule: 'MALFORMED_URL',
      weight: 5,
      evidence: 'Malformed URL structure'
    });
    highestWeight = Math.max(highestWeight, 5);
  }

  if (findings.length === 0) return null;

  return {
    findings,
    highestWeight: Math.min(highestWeight, GROUP_CAPS.GROUP_D)
  };
}

/**
 * Checks for recipient & payment anomalies (Group F)
 */
export function evaluateRecipientAndPayment({
  type,
  recipientName,
  upiId,
  amount,
  isKnown
}) {
  const matches = [];
  let highestWeight = 0;

  // 1. Recipient not in sample contacts
  if (upiId && !isKnown) {
    matches.push({
      id: GROUP_F_RULES.UNKNOWN_RECIPIENT.id,
      label: GROUP_F_RULES.UNKNOWN_RECIPIENT.label,
      explanation: GROUP_F_RULES.UNKNOWN_RECIPIENT.explanation,
      points: GROUP_F_RULES.UNKNOWN_RECIPIENT.points,
      evidence: `Recipient (${upiId}) is not in saved contacts`
    });
    highestWeight = Math.max(highestWeight, GROUP_F_RULES.UNKNOWN_RECIPIENT.points);
  }

  // 2. Name and UPI ID mismatch
  if (recipientName && upiId) {
    const normName = recipientName.toLowerCase();
    const handlePrefix = upiId.split('@')[0].toLowerCase();
    
    // Check if name claims to be official/support but handle is generic or disparate
    const isOfficialName = /(?:bank|support|helpdesk|official|service|customer|kyc)/i.test(normName);
    const handleHasDiscrepancy =
      isOfficialName &&
      !handlePrefix.includes('bank') &&
      !handlePrefix.includes('official') &&
      /\d{3,}/.test(handlePrefix);

    if (handleHasDiscrepancy || (normName.includes('bank') && !upiId.includes('bank'))) {
      matches.push({
        id: GROUP_F_RULES.NAME_ID_MISMATCH.id,
        label: GROUP_F_RULES.NAME_ID_MISMATCH.label,
        explanation: GROUP_F_RULES.NAME_ID_MISMATCH.explanation,
        points: GROUP_F_RULES.NAME_ID_MISMATCH.points,
        evidence: `Name '${recipientName}' does not match handle '${upiId}'`
      });
      highestWeight = Math.max(highestWeight, GROUP_F_RULES.NAME_ID_MISMATCH.points);
    }
  }

  // 3. Odd UPI handle tokens or excessive digits
  if (upiId) {
    const prefix = upiId.split('@')[0].toLowerCase();
    const hasSuspiciousToken = SUSPICIOUS_HANDLE_TOKENS.some(token =>
      prefix.includes(token)
    );
    const hasExcessiveDigits = /\d{5,}/.test(prefix);

    if (hasSuspiciousToken || hasExcessiveDigits) {
      matches.push({
        id: GROUP_F_RULES.ODD_UPI_HANDLE.id,
        label: GROUP_F_RULES.ODD_UPI_HANDLE.label,
        explanation: GROUP_F_RULES.ODD_UPI_HANDLE.explanation,
        points: GROUP_F_RULES.ODD_UPI_HANDLE.points,
        evidence: `UPI handle contains suspicious keywords or long digits: ${upiId}`
      });
      highestWeight = Math.max(highestWeight, GROUP_F_RULES.ODD_UPI_HANDLE.points);
    }
  }

  // 4. Amount unusually high (> 5,000)
  const numAmount = parseFloat(amount);
  if (!isNaN(numAmount) && numAmount > 5000) {
    matches.push({
      id: GROUP_F_RULES.HIGH_AMOUNT.id,
      label: GROUP_F_RULES.HIGH_AMOUNT.label,
      explanation: GROUP_F_RULES.HIGH_AMOUNT.explanation,
      points: GROUP_F_RULES.HIGH_AMOUNT.points,
      evidence: `Payment amount ₹${numAmount} exceeds standard baseline threshold`
    });
    highestWeight = Math.max(highestWeight, GROUP_F_RULES.HIGH_AMOUNT.points);
  }

  // 5. Collect request from an unknown recipient
  if (type === 'collect' && upiId && !isKnown) {
    matches.push({
      id: GROUP_F_RULES.UNKNOWN_COLLECT.id,
      label: GROUP_F_RULES.UNKNOWN_COLLECT.label,
      explanation: GROUP_F_RULES.UNKNOWN_COLLECT.explanation,
      points: GROUP_F_RULES.UNKNOWN_COLLECT.points,
      evidence: `Incoming collect request from unrecognized VPA: ${upiId}`
    });
    highestWeight = Math.max(highestWeight, GROUP_F_RULES.UNKNOWN_COLLECT.points);
  }

  return {
    matches,
    groupScore: Math.min(highestWeight, GROUP_CAPS.GROUP_F)
  };
}

/**
 * Registers all matches of one group. Every match is shown to the user as a
 * sign, but the group score uses only the highest-weight match (counted once).
 */
function registerGroup(signals, groupScores, groupKey, matches, cap) {
  if (!matches.length) return;
  const best = matches.reduce((max, cur) => (cur.points > max.points ? cur : max));
  groupScores[groupKey] = Math.min(best.points, cap);
  matches.forEach(m => signals.push({ ...m, group: groupKey, counted: m === best }));
}

// Plain-language text for each link finding
const LINK_SIGNAL_INFO = {
  HTTP_INSECURE: ['Link uses http instead of https', 'An http link is not encrypted. This is a warning sign, not proof.'],
  URL_SHORTENER: ['Link is shortened', 'Shortened links hide the real website address, so you cannot see where they lead.'],
  IP_ADDRESS_HOST: ['Link uses a number address instead of a name', 'Real services usually use a normal website name, not a bare number address.'],
  SUSPICIOUS_DOMAIN_WORD: ['Link name contains words like kyc, verify or refund', 'Scam links often copy words that sound official.'],
  SUSPICIOUS_TLD: ['Link ends with an unusual domain ending', 'Some endings such as .xyz or .top are often used in throwaway links.'],
  LINK_WITH_SECRET_REQUEST: ['Link comes with a request to verify or share details', 'A link plus a request for PIN, OTP or verification is a common trick.'],
  MALFORMED_URL: ['Link looks broken or oddly written', 'Odd link formatting can be used to confuse readers.']
};

/**
 * Main Detection Engine Function
 * Pure function: takes request parameters, evaluates heuristic rules, returns structured risk report.
 */
export function analyzePaymentRequest(input = {}) {
  const {
    type = 'pay',
    recipientName = '',
    upiId = '',
    amount = '',
    message = '',
    link = '',
    qrPayload = '',
    qrDescription = '',
    language = 'en'
  } = input;

  // Process safe QR payload if provided
  let effectiveRecipientName = recipientName;
  let effectiveUpiId = upiId;
  let effectiveAmount = amount;
  let qrContext = '';

  if (qrPayload) {
    const parsedQr = parseUpiQrPayload(qrPayload);
    if (parsedQr.isValid) {
      effectiveRecipientName = effectiveRecipientName || parsedQr.pn;
      effectiveUpiId = effectiveUpiId || parsedQr.pa;
      effectiveAmount = effectiveAmount || parsedQr.am;
      qrContext = `[QR: payee=${parsedQr.pa}, name=${parsedQr.pn}, note=${parsedQr.tn}]`;
    }
  }

  // Composite raw & normalized text
  const compositeRaw = [
    message,
    qrDescription,
    qrContext,
    link
  ].filter(Boolean).join(' ');

  const normalized = normalizeText(compositeRaw);

  // Check for accidentally entered secrets
  const secretCheck = detectAndMaskSecrets(compositeRaw);

  // Step 2: Context Check (Educational awareness vs real fraud request)
  const isPureEducational = evaluateEducationalContext(normalized);

  // Signal collection & group scoring
  const signals = [];
  const groupScores = {
    GROUP_A: 0,
    GROUP_B: 0,
    GROUP_C: 0,
    GROUP_D: 0,
    GROUP_E: 0,
    GROUP_F: 0
  };

  // If purely educational, bypass threat groups A & B
  if (!isPureEducational) {
    // GROUP A: Secret Request
    let groupAMatches = [];
    for (const ruleKey of Object.keys(GROUP_A_RULES)) {
      const rule = GROUP_A_RULES[ruleKey];
      for (const pattern of rule.patterns) {
        if (pattern.test(normalized)) {
          const match = normalized.match(pattern);
          groupAMatches.push({
            id: rule.id,
            group: 'GROUP_A',
            label: rule.label,
            points: rule.points,
            explanation: rule.explanation,
            evidence: match ? match[0].slice(0, 70) : 'PIN/secret request'
          });
          break;
        }
      }
    }

    registerGroup(signals, groupScores, 'GROUP_A', groupAMatches, GROUP_CAPS.GROUP_A);

    // GROUP B: Money Trick
    let groupBMatches = [];

    // Collect request masquerading as refund/cashback
    if (type === 'collect' && /(?:cashback|refund|prize|receive|reward)/i.test(normalized)) {
      groupBMatches.push({
        id: GROUP_B_RULES.COLLECT_AS_REFUND.id,
        group: 'GROUP_B',
        label: GROUP_B_RULES.COLLECT_AS_REFUND.label,
        points: GROUP_B_RULES.COLLECT_AS_REFUND.points,
        explanation: GROUP_B_RULES.COLLECT_AS_REFUND.explanation,
        evidence: 'Incoming Collect Request claiming cashback/refund'
      });
    }

    // QR receive-money trick
    if (
      qrPayload &&
      /(?:receive|paisa\s+milega|enter\s+pin\s+to\s+receive)/i.test(qrDescription)
    ) {
      groupBMatches.push({
        id: GROUP_B_RULES.QR_RECEIVE_TRICK.id,
        group: 'GROUP_B',
        label: GROUP_B_RULES.QR_RECEIVE_TRICK.label,
        points: GROUP_B_RULES.QR_RECEIVE_TRICK.points,
        explanation: GROUP_B_RULES.QR_RECEIVE_TRICK.explanation,
        evidence: 'Pay QR described as receiving money / entering PIN'
      });
    }

    // Regex checks for Group B
    for (const ruleKey of ['PROCESSING_FEE_PRIZE', 'REFUND_PRIZE_PAYMENT', 'PAY_TO_VERIFY']) {
      const rule = GROUP_B_RULES[ruleKey];
      if (!rule) continue;
      for (const pattern of rule.patterns) {
        if (pattern.test(normalized)) {
          const match = normalized.match(pattern);
          groupBMatches.push({
            id: rule.id,
            group: 'GROUP_B',
            label: rule.label,
            points: rule.points,
            explanation: rule.explanation,
            evidence: match ? match[0].slice(0, 70) : 'Money trick pattern'
          });
          break;
        }
      }
    }

    registerGroup(signals, groupScores, 'GROUP_B', groupBMatches, GROUP_CAPS.GROUP_B);
  }

  // GROUP C: Urgency / Threat
  if (!isPureEducational) {
    const matchedUrgency = GROUP_C_RULES.URGENCY_WORDS.filter(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(normalized);
    });
    const matchedThreats = GROUP_C_RULES.THREAT_WORDS.filter(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(normalized);
    });

    const totalUrgencyTriggers = matchedUrgency.length + matchedThreats.length;
    if (totalUrgencyTriggers > 0) {
      const hasMultipleOrThreat = totalUrgencyTriggers >= 2 || matchedThreats.length >= 1 || /fee\s+now/i.test(normalized);
      const points = hasMultipleOrThreat
        ? GROUP_C_RULES.MULTIPLE_URGENCY_OR_THREAT
        : GROUP_C_RULES.SINGLE_URGENCY;

      groupScores.GROUP_C = Math.min(points, GROUP_CAPS.GROUP_C);
      signals.push({
        id: 'C_URGENCY_THREAT',
        group: 'GROUP_C',
        counted: true,
        label: hasMultipleOrThreat
          ? 'Severe urgency or threat language detected'
          : 'High urgency wording detected',
        points,
        explanation:
          'Scammers use artificial time limits and threats (e.g., account suspension) to prevent you from thinking clearly.',
        evidence: [...matchedUrgency, ...matchedThreats].slice(0, 3).join(', ')
      });
    }
  }

  // GROUP D: Link Risk (Safe URL parsing only)
  // Extract URLs from message and explicit link field
  const explicitLink = link;
  const embeddedLinks = compositeRaw.match(/https?:\/\/[^\s]+/gi) || [];
  const candidateLinks = [explicitLink, ...embeddedLinks].filter(Boolean);

  if (candidateLinks.length > 0 && !isPureEducational) {
    const seenRules = new Set();
    const linkMatches = [];

    for (const urlStr of candidateLinks) {
      const result = analyzeLink(urlStr, normalized);
      if (!result) continue;
      for (const f of result.findings) {
        if (seenRules.has(f.rule)) continue;
        seenRules.add(f.rule);
        const info = LINK_SIGNAL_INFO[f.rule] || ['Link warning sign', 'This link has a warning sign.'];
        linkMatches.push({
          id: 'D_' + f.rule,
          label: info[0],
          points: f.weight,
          explanation: info[1],
          evidence: f.evidence
        });
      }
    }

    registerGroup(signals, groupScores, 'GROUP_D', linkMatches, GROUP_CAPS.GROUP_D);
  }

  // GROUP E: Impersonation
  if (!isPureEducational) {
    let groupEMatches = [];
    for (const ruleKey of Object.keys(GROUP_E_RULES)) {
      const rule = GROUP_E_RULES[ruleKey];
      for (const pattern of rule.patterns) {
        if (pattern.test(normalized)) {
          const match = normalized.match(pattern);
          groupEMatches.push({
            id: rule.id,
            group: 'GROUP_E',
            label: rule.label,
            points: rule.points,
            explanation: rule.explanation,
            evidence: match ? match[0].slice(0, 70) : 'Impersonation pattern'
          });
          break;
        }
      }
    }

    registerGroup(signals, groupScores, 'GROUP_E', groupEMatches, GROUP_CAPS.GROUP_E);
  }

  // GROUP F: Recipient and Payment Verification
  const isKnown = isKnownContact(effectiveUpiId, effectiveRecipientName);
  const recipientCheck = evaluateRecipientAndPayment({
    type,
    recipientName: effectiveRecipientName,
    upiId: effectiveUpiId,
    amount: effectiveAmount,
    isKnown
  });

  if (recipientCheck.matches.length > 0 && !isPureEducational) {
    registerGroup(signals, groupScores, 'GROUP_F', recipientCheck.matches, GROUP_CAPS.GROUP_F);
  }

  // STEP 4: Combination Bonus
  let combinationBonus = 0;
  if (groupScores.GROUP_A > 0 && (groupScores.GROUP_C > 0 || groupScores.GROUP_D > 0)) {
    combinationBonus += 10;
  }
  if (groupScores.GROUP_B > 0 && groupScores.GROUP_C > 0) {
    combinationBonus += 5;
  }

  // STEP 5: Total Score calculation with cap 100
  const baseGroupSum = Object.values(groupScores).reduce((acc, v) => acc + v, 0);
  const rawTotal = baseGroupSum + combinationBonus;
  const riskScore = Math.min(Math.max(rawTotal, 0), 100);

  // STEP 6: Risk Level Assignment
  let riskLevel = RISK_LEVELS.LOW.label;
  if (riskScore >= RISK_LEVELS.VERY_HIGH.min) {
    riskLevel = RISK_LEVELS.VERY_HIGH.label;
  } else if (riskScore >= RISK_LEVELS.HIGH.min) {
    riskLevel = RISK_LEVELS.HIGH.label;
  } else if (riskScore >= RISK_LEVELS.CAUTION.min) {
    riskLevel = RISK_LEVELS.CAUTION.label;
  }

  // STEP 7: Main Action (Exact priority order)
  let mainAction = MAIN_ACTIONS.LOOKS_OKAY;
  if (groupScores.GROUP_A > 0) {
    mainAction = MAIN_ACTIONS.NO_PIN;
  } else if (
    groupScores.GROUP_B > 0 ||
    groupScores.GROUP_C > 0 ||
    groupScores.GROUP_D > 0 ||
    groupScores.GROUP_E > 0 ||
    riskScore >= 50
  ) {
    mainAction = MAIN_ACTIONS.PAUSE_VERIFY;
  } else if (groupScores.GROUP_F > 0) {
    mainAction = MAIN_ACTIONS.CHECK_RECIPIENT;
  }

  // Plain-Language What to Avoid & What to Do Now
  const avoidList = [];
  const whatToDoList = [];

  if (groupScores.GROUP_A > 0) {
    avoidList.push("Do not enter your PIN to receive money. Receiving money never needs a PIN.");
    avoidList.push("Do not share OTPs, passwords, or bank account numbers with anyone.");
  }
  if (groupScores.GROUP_B > 0) {
    avoidList.push("Do not approve collect requests claiming to give refunds or prizes.");
    avoidList.push("Do not pay advance processing fees to claim lottery or rewards.");
  }
  if (groupScores.GROUP_D > 0) {
    avoidList.push("Do not click shortened or unknown links sent over SMS or WhatsApp.");
    whatToDoList.push("Open your bank's official app or website directly by typing the address yourself.");
  }
  if (groupScores.GROUP_C > 0) {
    avoidList.push("Do not rush. Scammers manufacture urgent deadlines to stop you from verifying.");
    whatToDoList.push("Take a pause. No legitimate bank will cancel your account in 10 minutes.");
  }
  if (groupScores.GROUP_E > 0) {
    avoidList.push("Do not trust caller ID or claims of being RBI / Police without independent verification.");
    whatToDoList.push("Call your bank's official number listed on the back of your debit card.");
  }

  // Universal checks
  whatToDoList.push("Check the recipient name shown on the UPI confirmation screen before you authorize.");
  whatToDoList.push("If paying a friend or merchant, confirm their identity on a trusted channel.");

  // Educational note if detected
  const educationalNote = isPureEducational
    ? "Educational message – no request to share secrets detected"
    : null;

  return {
    riskScore: isPureEducational ? 0 : riskScore,
    riskLevel: isPureEducational ? RISK_LEVELS.LOW.label : riskLevel,
    mainAction: isPureEducational ? MAIN_ACTIONS.LOOKS_OKAY : mainAction,
    signals,
    reasons: signals.map(s => `${s.label}: ${s.explanation}`),
    avoid: avoidList.slice(0, 4),
    whatToDoNow: whatToDoList.slice(0, 3),
    educationalNote,
    isEducational: isPureEducational,
    limitations: [
      "Rule-based heuristic warning engine (not machine learning and not a guarantee).",
      "Analysis runs 100% locally in your browser with zero network or bank API access.",
      "A low score indicates no known pattern was found, but you should always confirm details before paying."
    ],
    secretWarning: secretCheck.warning,
    maskedInput: secretCheck.maskedText,
    groupBreakdown: groupScores,
    combinationBonus
  };
}
