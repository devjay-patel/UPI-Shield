import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Smartphone,
  Volume2,
  Lock,
  Check,
  Delete
} from 'lucide-react';
import { analyzePaymentRequest } from '../engine/fraudEngine';
import { speakWarning } from '../utils/speechAlert';
import { getTranslation } from '../i18n';

export default function ScreenPauseDemo({
  paymentData,
  onCancelPayment,
  sessionBlocksCount,
  onResetSession,
  language
}) {
  const t = getTranslation(language);

  const SCENARIOS = [
    {
      id: 'scam',
      label: '🚨 Fake Cashback Scam',
      badge: 'Triggers 5s Pause Barrier',
      data: {
        type: 'collect',
        recipientName: 'Cashback Team',
        upiId: 'cashback.rewards786@upi',
        amount: '4999',
        message: 'Congratulations! Approve this request and enter your UPI PIN to receive your cashback. Urgent, expires in 5 minutes.'
      }
    },
    {
      id: 'caution',
      label: '⚠️ Unknown Recipient',
      badge: 'Triggers 3s Barrier',
      data: {
        type: 'pay',
        recipientName: 'New Contact 98765',
        upiId: 'unknown.user@okaxis',
        amount: '800',
        message: 'A new contact asked for Rs 800. Please verify the recipient and reason.'
      }
    },
    {
      id: 'normal',
      label: '🟢 Safe Grocery Merchant',
      badge: 'Direct Safe Simulation',
      data: {
        type: 'pay',
        recipientName: 'Ramesh Kirana Store',
        upiId: 'ramesh.store@okbank',
        amount: '250',
        message: 'Grocery payment'
      }
    }
  ];

  // Active payment being evaluated in the phone
  const [activePayment, setActivePayment] = useState(paymentData);
  const [selectedScenarioId, setSelectedScenarioId] = useState('custom');

  // Simulated PIN Step State (Pure visual dummy, NO input fields)
  const [isPinScreenOpen, setIsPinScreenOpen] = useState(false);
  const [enteredPinDots, setEnteredPinDots] = useState(0); // 0 to 4 dots

  useEffect(() => {
    setActivePayment(paymentData);
    setSimulationStatus(null);
    setShowPauseOverlay(false);
    setIsPinScreenOpen(false);
    setEnteredPinDots(0);
  }, [paymentData]);

  const handleSelectScenario = (sc) => {
    setSelectedScenarioId(sc.id);
    setActivePayment(sc.data);
    setSimulationStatus(null);
    setShowPauseOverlay(false);
    setIsPinScreenOpen(false);
    setEnteredPinDots(0);
  };

  // Keyboard typing support for simulated PIN screen (0..9 and Backspace)
  useEffect(() => {
    if (!isPinScreenOpen) return;

    const handleKeyInput = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        setEnteredPinDots(prev => Math.min(4, prev + 1));
      } else if (e.key === 'Backspace') {
        setEnteredPinDots(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Enter' && enteredPinDots === 4) {
        handleConfirmPinSimulation();
      } else if (e.key === 'Escape') {
        setIsPinScreenOpen(false);
        setEnteredPinDots(0);
      }
    };

    window.addEventListener('keydown', handleKeyInput);
    return () => window.removeEventListener('keydown', handleKeyInput);
  }, [isPinScreenOpen, enteredPinDots]);

  // Local state for the simulated payment flow
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(null); // 'completed' | 'cancelled' | 'proceeded_warning'
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const overlayRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // Evaluate risk engine when Pay is tapped
  const handleInitiatePay = () => {
    const analysis = analyzePaymentRequest(activePayment);
    setLatestAnalysis(analysis);

    if (analysis.riskScore >= 25) {
      // CAUTION, HIGH, or VERY HIGH: Trigger Pause Overlay with countdown
      const initialCountdown = analysis.riskScore >= 50 ? 5 : 3;
      setCountdown(initialCountdown);
      setCanContinue(false);
      setShowPauseOverlay(true);
      setSimulationStatus(null);
      setIsPinScreenOpen(false);
    } else {
      // LOW: Go to simulated dummy PIN authorization screen
      setIsPinScreenOpen(true);
      setSimulationStatus(null);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (showPauseOverlay && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showPauseOverlay && countdown === 0) {
      setCanContinue(true);
    }
    return () => clearTimeout(timer);
  }, [showPauseOverlay, countdown]);

  // Focus management for accessible overlay
  useEffect(() => {
    if (showPauseOverlay && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [showPauseOverlay]);

  // Accessible focus trap and keyboard control
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault(); // Escape does not skip the countdown
      return;
    }
    if (e.key === 'Tab' && overlayRef.current) {
      const focusables = overlayRef.current.querySelectorAll(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  const handleCancel = () => {
    setShowPauseOverlay(false);
    setIsPinScreenOpen(false);
    setSimulationStatus('cancelled');
    onCancelPayment(); // Increments sessionBlocksCount in memory
  };

  const handleContinueAnyway = () => {
    if (!canContinue) return;
    setShowPauseOverlay(false);
    // Proceed to simulated PIN step with override state
    setIsPinScreenOpen(true);
  };

  const handleConfirmPinSimulation = () => {
    setIsPinScreenOpen(false);
    if (latestAnalysis && latestAnalysis.riskScore >= 25) {
      setSimulationStatus('proceeded_warning');
    } else {
      setSimulationStatus('completed');
    }
  };

  const amountDisplay = activePayment.amount ? `₹${activePayment.amount}` : '₹0.00';
  const payeeName = activePayment.recipientName || 'Unspecified Merchant';
  const payeeId = activePayment.upiId || 'merchant@okbank';
  const noteDisplay = activePayment.message || activePayment.qrDescription || 'Payment simulation';

  return (
    <div id="panel-pause" role="tabpanel" aria-labelledby="tab-pause">
      <div className="phone-mockup-wrapper">
        {/* SCENARIO SELECTOR: Allows testing both normal and scam flows immediately */}
        <div className="scenario-switcher-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield className="text-cyan" size={18} />
                Demonstrate UPI Shield's Uniqueness
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Normal payments go through directly. To see UPI Shield <strong>actively block fraud before PIN entry</strong>, switch scenario:
              </p>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
              Live Security Barrier
            </span>
          </div>

          <div className="scenario-pills-row">
            {SCENARIOS.map(sc => (
              <button
                key={sc.id}
                type="button"
                className={`scenario-pill-btn ${selectedScenarioId === sc.id ? 'active' : ''}`}
                onClick={() => handleSelectScenario(sc)}
              >
                <span>{sc.label}</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({sc.badge})</span>
              </button>
            ))}
            {paymentData && (
              <button
                type="button"
                className={`scenario-pill-btn ${selectedScenarioId === 'custom' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedScenarioId('custom');
                  setActivePayment(paymentData);
                  setSimulationStatus(null);
                  setShowPauseOverlay(false);
                }}
              >
                <span>📋 Screen A Custom Request</span>
              </button>
            )}
          </div>
        </div>

        <div className="phone-mockup">
          <div className="phone-speaker-notch" />

          {isPinScreenOpen ? (
            <div className="simulated-pin-screen">
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span className="sim-watermark-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
                  Demo only — no real PIN
                </span>
                <div style={{ marginTop: 12, display: 'inline-flex', padding: 12, borderRadius: '999px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
                  <Lock size={26} />
                </div>
                <h3 style={{ marginTop: 8, fontSize: '1.15rem', color: '#ffffff' }}>Simulated Payment Authorization</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Paying <strong style={{ color: '#ffffff' }}>{amountDisplay}</strong> to <strong style={{ color: '#38bdf8' }}>{payeeName}</strong>
                </p>
              </div>

              {/* Visible Security Warning: Demo only — no real PIN */}
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '8px 12px', margin: '8px 0 12px 0', fontSize: '0.78rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>Demo only — no real PIN. Do NOT enter or type your real bank PIN here.</span>
              </div>

              {/* Fictional Demo PIN Helper & Interactive Dots (NO input field, zero keystroke storage) */}
              <div style={{ textAlign: 'center', margin: '8px 0 10px 0' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 8 }}>
                  Fictional Demo PIN: [ 0 0 0 0 ] ({enteredPinDots}/4 keys tapped)
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
                  {[0, 1, 2, 3].map(idx => (
                    <span
                      key={idx}
                      className={`dummy-pin-dot ${idx < enteredPinDots ? 'filled' : ''}`}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: enteredPinDots === 4 ? '#34d399' : 'var(--text-dim)', fontWeight: enteredPinDots === 4 ? 700 : 400 }}>
                    {enteredPinDots === 4 ? '✓ 4 Fictional Digits Simulated' : 'Tap any 4 keys or autofill:'}
                  </span>
                  {enteredPinDots < 4 && (
                    <button
                      type="button"
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        color: '#38bdf8',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onClick={() => setEnteredPinDots(4)}
                    >
                      Autofill Demo PIN (0000)
                    </button>
                  )}
                </div>
              </div>

              {/* On-screen Numeric Keypad for direct tap simulation */}
              <div className="sim-keypad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    type="button"
                    className="sim-keypad-btn"
                    onClick={() => setEnteredPinDots(prev => Math.min(4, prev + 1))}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  className="sim-keypad-btn"
                  aria-label="Delete"
                  title="Delete"
                  onClick={() => setEnteredPinDots(prev => Math.max(0, prev - 1))}
                >
                  <Delete size={18} />
                </button>
                <button
                  type="button"
                  className="sim-keypad-btn"
                  onClick={() => setEnteredPinDots(prev => Math.min(4, prev + 1))}
                >
                  0
                </button>
                <button
                  type="button"
                  className="sim-keypad-btn check-btn"
                  aria-label="Confirm Simulated Payment"
                  title="Confirm Simulated Payment"
                  disabled={enteredPinDots < 4}
                  onClick={handleConfirmPinSimulation}
                >
                  <Check size={20} />
                </button>
              </div>

              {/* Security Golden Rule Callout */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: 10, margin: '12px 0', fontSize: '0.75rem', color: '#a7f3d0', lineHeight: 1.4 }}>
                <ShieldCheck size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                <strong>Golden Safety Rule:</strong> Your UPI PIN is only needed to SEND money. Receiving money never requires entering a PIN. (No real PIN is recorded).
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', justifyContent: 'center', fontSize: '0.88rem' }}
                  disabled={enteredPinDots < 4}
                  onClick={handleConfirmPinSimulation}
                >
                  Confirm Payment (Simulation Only)
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '10px 16px', justifyContent: 'center' }}
                  onClick={() => {
                    setIsPinScreenOpen(false);
                    setEnteredPinDots(0);
                  }}
                >
                  Cancel
                </button>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 8 }}>
                * Local simulation only. Zero network requests. Never connected to real banks.
              </div>
            </div>
          ) : (
            <>
              {/* Simulated UPI Screen Header */}
              <div className="sim-payment-header">
                <span className="sim-watermark-pill">
                  {t.common.simulationNotice}
                </span>
                <h3 style={{ marginTop: 8 }}>Simulated UPI App</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Standard Pre-Payment Authorization Interface
                </p>
              </div>

              {/* Amount Display */}
              <div className="payee-amount-display">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paying</div>
                <div className="payee-amount-number">{amountDisplay}</div>
              </div>

              {/* Payee Details Card */}
              <div className="payee-details-box">
                <div className="payee-row">
                  <span>To:</span>
                  <strong style={{ color: '#ffffff' }}>{payeeName}</strong>
                </div>
                <div className="payee-row">
                  <span>UPI ID:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{payeeId}</span>
                </div>
                <div className="payee-row">
                  <span>Note:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{noteDisplay}</span>
                </div>
                <div className="payee-row">
                  <span>Type:</span>
                  <span style={{ textTransform: 'capitalize' }}>{activePayment.type || 'Pay'} Request</span>
                </div>
              </div>

              {/* UPI Shield Gate Active Indicator */}
              <div className="upi-shield-gate-indicator">
                <Shield size={15} style={{ color: '#38bdf8' }} />
                <span><strong>UPI Shield Gate Active:</strong> Inspecting pre-payment risk</span>
              </div>

              {/* Simulated Pay Action Button */}
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', justifyContent: 'center' }}
                onClick={handleInitiatePay}
              >
                Pay {amountDisplay}
              </button>

              <p style={{ fontSize: '0.8rem', color: '#38bdf8', textAlign: 'center', marginTop: 8, fontWeight: 600 }}>
                {t.common.simulationNotice}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 4 }}>
                * Clicking Pay runs the live risk engine before authorization.
              </p>
            </>
          )}

          {/* Simulation Result Feedback states */}
          {simulationStatus === 'completed' && (
            <div style={{ marginTop: 20, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.2)', padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', color: '#6ee7b7', fontWeight: 700, marginBottom: 6 }}>
                <CheckCircle size={13} /> UPI SHIELD PRE-CHECK: PASSED (SCORE 0)
              </div>
              <div style={{ fontWeight: 700, color: '#a7f3d0' }}>Payment Simulated Successfully</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                No strong warning signs detected. In real life, always confirm the payee name and amount. (Simulation only – no money moved).
              </p>
              <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 10px', borderRadius: 6 }}>
                👉 Select <strong>"🚨 Fake Cashback Scam"</strong> above and tap <strong>Pay</strong> to see how UPI Shield interrupts fraud with the unskippable Pause Barrier!
              </div>
            </div>
          )}

          {simulationStatus === 'cancelled' && (
            <div style={{ marginTop: 20, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
              <ShieldCheck size={28} style={{ color: 'var(--risk-low)', margin: '0 auto 6px auto' }} />
              <div style={{ fontWeight: 700, color: '#a7f3d0' }}>Payment Cancelled by User</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                You safely intervened before transferring funds. In real life, this simple pause prevents irreversible UPI loss.
              </p>
            </div>
          )}

          {simulationStatus === 'proceeded_warning' && (
            <div style={{ marginTop: 20, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
              <AlertTriangle size={28} style={{ color: 'var(--risk-high)', margin: '0 auto 6px auto' }} />
              <div style={{ fontWeight: 700, color: '#fca5a5' }}>Simulation Ended with Override</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Simulation ended. In real life, always verify independently before overriding. If you have been tricked, call 1930 immediately. (No money was sent).
              </p>
            </div>
          )}

          {/* In-memory Session Counter */}
          <div className="demo-session-counter-badge">
            {t.common.demoSessionBlocks}
            <strong>{sessionBlocksCount}</strong> {t.common.demoOnly}
          </div>
        </div>
      </div>

      {/* FULL SCREEN ACCESSIBLE PAUSE OVERLAY */}
      {showPauseOverlay && latestAnalysis && (
        <div
          className="pause-overlay-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-heading"
          onKeyDown={handleKeyDown}
          ref={overlayRef}
        >
          <div className="pause-overlay-card">
            {/* Modal Safety Banner */}
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: 6, padding: '6px 10px', fontSize: '0.75rem', color: '#bae6fd', textAlign: 'center', marginBottom: 16 }}>
              {t.safetyBanner}
            </div>

            <div className="pause-overlay-header">
              <div className="pause-warning-icon">
                <ShieldAlert size={36} />
              </div>
              <h2 id="pause-heading" className="pause-overlay-title">
                Pause. Check before you pay.
              </h2>
              <div className="pause-overlay-subtitle">
                {latestAnalysis.mainAction}
              </div>
            </div>

            {/* Recipient details to inspect */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>
                Verify Recipient Details:
              </div>
              <div><strong>Name:</strong> {payeeName}</div>
              <div><strong>UPI ID:</strong> {payeeId}</div>
              <div><strong>Amount:</strong> {amountDisplay}</div>
            </div>

            {/* Top 3 Triggered Signs */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
                Top Warning Signals Detected:
              </div>
              <ul style={{ listStyle: 'none' }}>
                {latestAnalysis.signals.slice(0, 3).map((sig, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: '0.85rem',
                      color: '#fca5a5',
                      marginBottom: 6,
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '6px 10px',
                      borderRadius: 6
                    }}
                  >
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{sig.label}: {sig.explanation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="pause-overlay-actions">
              {/* Voice Warning Button */}
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  const speechMsg = `Warning. ${latestAnalysis.mainAction}. ${latestAnalysis.signals?.[0]?.explanation || ''}`;
                  speakWarning(speechMsg, language);
                }}
              >
                <Volume2 size={16} style={{ color: 'var(--accent-blue)' }} />
                <span>{t.buttons.listenVoiceAlert}</span>
              </button>

              {/* PRIMARY: CANCEL BUTTON (Largest & Easiest to press) */}
              <button
                ref={cancelBtnRef}
                type="button"
                className="btn-danger"
                onClick={handleCancel}
              >
                <XCircle size={20} />
                <span>{t.buttons.cancelPayment}</span>
              </button>

              {/* SECONDARY: Disabled until countdown expires */}
              <button
                type="button"
                className="btn-secondary"
                disabled={!canContinue}
                onClick={handleContinueAnyway}
                style={{
                  opacity: canContinue ? 1 : 0.45,
                  cursor: canContinue ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem'
                }}
              >
                {t.buttons.continuePayment}
              </button>

              {!canContinue && (
                <div
                  className="countdown-timer-pill"
                  role="timer"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Verification pause active: continue button unlocks in <strong>{countdown}s</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
