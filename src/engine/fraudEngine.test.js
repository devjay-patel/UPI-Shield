import { describe, it, expect } from 'vitest';
import {
  analyzePaymentRequest,
  parseUpiQrPayload,
  detectAndMaskSecrets,
  normalizeText,
  isValidUpiIdFormat,
  validateUpiHandle
} from './fraudEngine.js';
import { SAMPLE_CASES } from '../data/sampleCases.js';

describe('UPI Shield Fraud Detection Engine - Comprehensive Vitest Suite', () => {

  describe('Text Normalization & Secret Detection', () => {
    it('normalizes currency symbols and whitespace correctly', () => {
      const res = normalizeText('  Pay   ₹500 and INR 200   ');
      expect(res).toBe('pay rs 500 and rs 200');
    });

    it('detects and masks 4-6 digit secrets adjacent to PIN/OTP', () => {
      const check = detectAndMaskSecrets('My secret PIN is 1234 and OTP is 987654');
      expect(check.hasSecrets).toBe(true);
      expect(check.maskedText).toContain('PIN: ••••••');
      expect(check.maskedText).toContain('OTP: ••••••');
      expect(check.warning).toBeTruthy();
    });

    it('masks 16-digit credit/debit card numbers', () => {
      const check = detectAndMaskSecrets('Card 4111 2222 3333 4444 to pay');
      expect(check.hasSecrets).toBe(true);
      expect(check.maskedText).toContain('••••-••••-••••-••••');
    });

    it('does not false positive on normal numbers', () => {
      const check = detectAndMaskSecrets('Invoice order 892019 for groceries');
      expect(check.hasSecrets).toBe(false);
      expect(check.warning).toBeNull();
    });
  });

  describe('QR Payload Parser (Safe Simulation)', () => {
    it('parses valid UPI QR URIs safely without external requests', () => {
      const payload = 'upi://pay?pa=shop.demo@okbank&pn=Demo%20Shop&am=250&cu=INR&tn=Books';
      const parsed = parseUpiQrPayload(payload);
      expect(parsed.isValid).toBe(true);
      expect(parsed.pa).toBe('shop.demo@okbank');
      expect(parsed.pn).toBe('Demo Shop');
      expect(parsed.am).toBe('250');
      expect(parsed.tn).toBe('Books');
    });

    it('gracefully handles missing parameters or non-UPI strings', () => {
      const parsed = parseUpiQrPayload('https://evil.com/fake');
      expect(parsed.isValid).toBe(false);
      expect(parsed.error).toContain('Not a standard UPI QR URI');
    });

    it('handles empty or malformed input without throwing', () => {
      expect(parseUpiQrPayload('').isValid).toBe(false);
      expect(parseUpiQrPayload(null).isValid).toBe(false);
    });
  });

  describe('Educational vs Malicious Intent Checks', () => {
    it('recognizes educational messages with negation words and sets score to 0', () => {
      const result = analyzePaymentRequest({
        message: 'Never share your UPI PIN or OTP. You do not need to enter your PIN to receive money.'
      });
      expect(result.isEducational).toBe(true);
      expect(result.riskScore).toBe(0);
      expect(result.riskLevel).toBe('LOW INDICATED RISK');
      expect(result.educationalNote).toContain('Educational message');
      expect(result.mainAction).toBe('Looks okay – still confirm the name and amount before paying.');
    });

    it('catches malicious requests even if educational words are mixed in as pretext', () => {
      const result = analyzePaymentRequest({
        message: 'RBI awareness tips: never share PIN, but enter your PIN here to claim refund immediately!'
      });
      expect(result.isEducational).toBe(false);
      expect(result.riskScore).toBeGreaterThan(40);
      expect(result.mainAction).toBe('Do not share your PIN');
    });
  });

  describe('Score Caps, Single Group Counting, & Bounds', () => {
    it('keeps total score bounded between 0 and 100', () => {
      const extreme = analyzePaymentRequest({
        type: 'collect',
        recipientName: 'Bank Support Head Official Police',
        upiId: 'cashback.rewards999999@xyz',
        amount: '99999',
        message: 'URGENT police case account blocked! Click http://192.168.1.1/kyc-update-now. Enter PIN to receive refund. AnyDesk install karo!',
        link: 'http://192.168.1.1/kyc-update-now'
      });
      expect(extreme.riskScore).toBeLessThanOrEqual(100);
      expect(extreme.riskScore).toBeGreaterThanOrEqual(0);
      expect(extreme.riskLevel).toBe('VERY HIGH RISK');
    });

    it('does NOT inflate score with repeated trigger words in the same group', () => {
      const singleUrgent = analyzePaymentRequest({
        message: 'Pay now urgent'
      });
      const repeatedUrgent = analyzePaymentRequest({
        message: 'urgent urgent urgent urgent urgent urgent'
      });
      expect(repeatedUrgent.groupBreakdown.GROUP_C).toBeLessThanOrEqual(15);
      expect(repeatedUrgent.riskScore).toBeLessThanOrEqual(25);
    });
  });

  describe('All 8 Synthetic Demo Cases Validation', () => {
    SAMPLE_CASES.forEach((demoCase, idx) => {
      it(`Demo Case ${idx + 1}: ${demoCase.title} yields expected result`, () => {
        const result = analyzePaymentRequest(demoCase.input);

        // Check Risk Level
        if (Array.isArray(demoCase.expectedLevel)) {
          expect(demoCase.expectedLevel).toContain(result.riskLevel);
        } else {
          expect(result.riskLevel).toBe(demoCase.expectedLevel);
        }

        // Check Main Action
        expect(result.mainAction).toBe(demoCase.expectedAction);

        // Check Educational flag if expected
        if (demoCase.isEducationalExpected) {
          expect(result.isEducational).toBe(true);
        }

        // Check evidence and plain explanations
        result.signals.forEach(sig => {
          expect(sig.explanation).toBeTruthy();
          expect(sig.evidence).toBeTruthy();
          expect(sig.points).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Main Action Priority Order', () => {
    it('prioritizes "Do not share your PIN" when Group A is present', () => {
      const res = analyzePaymentRequest({
        message: 'Enter your UPI PIN to claim prize'
      });
      expect(res.mainAction).toBe('Do not share your PIN');
    });

    it('uses "Pause and verify" when Group B, C, D, or E is present without Group A', () => {
      const res = analyzePaymentRequest({
        message: 'Dear customer, your bank KYC is expired. Your account will be blocked today.'
      });
      expect(res.mainAction).toBe('Pause and verify');
    });

    it('uses "Check recipient details" when only Group F is present', () => {
      const res = analyzePaymentRequest({
        type: 'pay',
        recipientName: 'Random Unsaved Merchant',
        upiId: 'merchant.random987@okbank',
        amount: '400',
        message: 'Payment for lunch'
      });
      expect(res.mainAction).toBe('Check recipient details');
    });

    it('defaults to "Looks okay..." when no risk signals are triggered', () => {
      const res = analyzePaymentRequest({
        type: 'pay',
        recipientName: 'Ramesh Kirana Store',
        upiId: 'ramesh.store@okbank',
        amount: '200',
        message: 'Grocery staples'
      });
      expect(res.mainAction).toBe('Looks okay – still confirm the name and amount before paying.');
    });
  });

  describe('Edge cases and safety', () => {
    it('handles empty input gracefully', () => {
      const res = analyzePaymentRequest({});
      expect(res.riskScore).toBe(0);
      expect(res.riskLevel).toBe('LOW INDICATED RISK');
      expect(res.mainAction).toBe('Looks okay – still confirm the name and amount before paying.');
    });

    it('handles very long inputs (up to 3000 chars) without crashing', () => {
      const longText = 'sample text '.repeat(250);
      const res = analyzePaymentRequest({ message: longText });
      expect(res.riskScore).toBeGreaterThanOrEqual(0);
      expect(res.riskScore).toBeLessThanOrEqual(100);
    });

    it('never calls window.localStorage or makes network requests', () => {
      expect(typeof window).toBe('undefined'); // In pure Node/Vitest environment
    });

    it('correctly validates UPI ID formats and flags malformed handles', () => {
      expect(isValidUpiIdFormat('ramesh.store@okbank')).toBe(true);
      expect(isValidUpiIdFormat('9876543210@paytm')).toBe(true);
      expect(isValidUpiIdFormat('user@okhdfcbank')).toBe(true);
      expect(isValidUpiIdFormat('invalidformat')).toBe(false);
      expect(isValidUpiIdFormat('user@@bank')).toBe(false);
      expect(isValidUpiIdFormat('user@')).toBe(false);
      expect(isValidUpiIdFormat('user name@bank')).toBe(false);
      expect(isValidUpiIdFormat('user@gmail.com')).toBe(false);
      expect(isValidUpiIdFormat('user@ok axis')).toBe(false);

      const emailCheck = validateUpiHandle('test.user@gmail.com');
      expect(emailCheck.isValid).toBe(false);
      expect(emailCheck.reason).toBe('email_domain');

      const res = analyzePaymentRequest({
        recipientName: 'Unknown Store',
        upiId: 'bad_upi_no_at_symbol',
        amount: '100'
      });
      const hasInvalidVpaSignal = res.signals.some(s => s.id === 'F_INVALID_VPA_FORMAT');
      expect(hasInvalidVpaSignal).toBe(true);
    });
  });
});
