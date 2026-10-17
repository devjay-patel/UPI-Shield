import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Smartphone,
  Volume2
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
    const analysis = analyzePaymentRequest(paymentData);
    setLatestAnalysis(analysis);

    if (analysis.riskScore >= 25) {
      // CAUTION, HIGH, or VERY HIGH: Trigger Pause Overlay with countdown
      const initialCountdown = analysis.riskScore >= 50 ? 5 : 3;
      setCountdown(initialCountdown);
      setCanContinue(false);
      setShowPauseOverlay(true);
      setSimulationStatus(null);
    } else {
      // LOW: Direct simulated payment success
      setSimulationStatus('completed');
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

  // Prevent Escape from dismissing overlay without decision
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault(); // Do not allow escaping without pressing Cancel
    }
  };

  const handleCancel = () => {
    setShowPauseOverlay(false);
    setSimulationStatus('cancelled');
    onCancelPayment(); // Increments sessionBlocksCount in memory
  };

  const handleContinueAnyway = () => {
    if (!canContinue) return;
    setShowPauseOverlay(false);
    setSimulationStatus('proceeded_warning');
  };

  const amountDisplay = paymentData.amount ? `₹${paymentData.amount}` : '₹0.00';
  const payeeName = paymentData.recipientName || 'Unspecified Merchant';
  const payeeId = paymentData.upiId || 'merchant@okbank';
  const noteDisplay = paymentData.message || paymentData.qrDescription || 'Payment simulation';

  return (
    <div id="panel-pause" role="tabpanel" aria-labelledby="tab-pause">
      <div className="phone-mockup-wrapper">
        <div className="phone-mockup">
          <div className="phone-speaker-notch" />

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
              <span style={{ textTransform: 'capitalize' }}>{paymentData.type || 'Pay'} Request</span>
            </div>
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

          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 10 }}>
            * Clicking Pay runs the live risk engine before authorization.
          </p>

          {/* Simulation Result Feedback states */}
          {simulationStatus === 'completed' && (
            <div style={{ marginTop: 20, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
              <CheckCircle size={28} style={{ color: 'var(--risk-low)', margin: '0 auto 6px auto' }} />
              <div style={{ fontWeight: 700, color: '#a7f3d0' }}>Payment Simulated Successfully</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                No strong warning signs detected. In real life, always confirm the payee name and amount. (Simulation only – no money moved).
              </p>
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
                <div className="countdown-timer-pill">
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
