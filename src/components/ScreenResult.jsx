import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ArrowRight,
  RotateCcw,
  Ban,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Volume2,
  Download
} from 'lucide-react';
import { getTranslation } from '../i18n';
import { speakWarning } from '../utils/speechAlert';
import { generateIncidentReport } from '../utils/reportExporter';

export default function ScreenResult({
  analysis,
  paymentData = {},
  onNavigateToPause,
  onCheckAnother,
  language
}) {
  const t = getTranslation(language);

  if (!analysis) {
    return (
      <div className="cyber-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
        <HelpCircle size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 16px auto' }} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 8 }}>
          No Request Analyzed Yet
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
          Submit a payment request, QR payload, or message from the Check Request tab to view explainable risk results.
        </p>
        <button type="button" className="btn-primary" onClick={onCheckAnother}>
          Go to Check Request
        </button>
      </div>
    );
  }

  const {
    riskScore,
    riskLevel,
    mainAction,
    signals = [],
    avoid = [],
    whatToDoNow = [],
    educationalNote,
    isEducational,
    limitations = []
  } = analysis;

  // Determine styling based on risk level
  let badgeClass = 'badge-low';
  let calloutClass = 'callout-low';
  let meterColor = 'var(--risk-low)';
  let LevelIcon = ShieldCheck;

  if (riskLevel === 'VERY HIGH RISK') {
    badgeClass = 'badge-very-high';
    calloutClass = 'callout-very-high';
    meterColor = 'var(--risk-very-high)';
    LevelIcon = ShieldAlert;
  } else if (riskLevel === 'HIGH RISK') {
    badgeClass = 'badge-high';
    calloutClass = 'callout-high';
    meterColor = 'var(--risk-high)';
    LevelIcon = ShieldAlert;
  } else if (riskLevel === 'CAUTION') {
    badgeClass = 'badge-caution';
    calloutClass = 'callout-caution';
    meterColor = 'var(--risk-caution)';
    LevelIcon = AlertTriangle;
  }

  // Educational override styling
  if (isEducational) {
    LevelIcon = Info;
  }

  // Dynamic "How this helps you avoid a risky action" message
  let howThisHelps = "UPI Shield evaluated this request against known fraud vectors before any transaction was initiated.";
  if (signals.some(s => s.group === 'GROUP_A')) {
    howThisHelps = "UPI Shield stopped you before entering a PIN to receive money. Receiving money never needs a PIN.";
  } else if (signals.some(s => s.group === 'GROUP_B')) {
    howThisHelps = "UPI Shield flagged this payment trick. Approving collect requests or paying upfront fees for refunds directly drains your money.";
  } else if (signals.some(s => s.group === 'GROUP_D')) {
    howThisHelps = "UPI Shield alerted you to an unverified link, preventing credential harvesting or unauthorized app installations.";
  } else if (signals.some(s => s.group === 'GROUP_C')) {
    howThisHelps = "UPI Shield broke the manufactured urgency cycle, giving you time to pause and independently verify.";
  }

  return (
    <div id="panel-result" role="tabpanel" aria-labelledby="tab-result">
      <div className="cyber-card">
        {/* Top Level Row */}
        <div className="result-header-badge-row">
          <div className={`risk-level-badge ${badgeClass}`}>
            <LevelIcon size={22} />
            <span>{riskLevel}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              title="Listen spoken audio warning in selected language"
              onClick={() => {
                const speechMsg = `${riskLevel}. ${mainAction}. ${signals?.[0]?.explanation || ''}`;
                speakWarning(speechMsg, language);
              }}
            >
              <Volume2 size={15} style={{ color: 'var(--accent-blue)' }} />
              <span>{t.buttons.listenVoiceAlert}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              title="Generate a plain text incident brief ready for 1930 / cybercrime.gov.in"
              onClick={() => generateIncidentReport(analysis, paymentData)}
            >
              <Download size={15} style={{ color: 'var(--accent-blue)' }} />
              <span>{t.buttons.exportReport}</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={onNavigateToPause}
            >
              <Smartphone size={15} />
              <span>{t.buttons.tryPauseDemo}</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              onClick={onCheckAnother}
            >
              <RotateCcw size={15} />
              <span>{t.buttons.checkAnother}</span>
            </button>
          </div>
        </div>

        {/* Educational Banner if detected */}
        {isEducational && (
          <div className="secret-alert-banner" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#bae6fd', marginBottom: 20 }}>
            <Info size={18} />
            <div>
              <strong>{educationalNote}</strong>
              <div style={{ fontSize: '0.8rem', marginTop: 2 }}>{t.educational.explanation}</div>
            </div>
          </div>
        )}

        {/* 0-100 Risk Score Meter */}
        <div className="risk-meter-container">
          <div className="meter-numeric">
            <span className="meter-number" style={{ color: meterColor }}>
              {riskScore}
            </span>
            <span className="meter-scale-text">out of 100</span>
          </div>

          <div className="meter-track-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
              <span>{t.common.score}</span>
              <span style={{ color: meterColor }}>{riskLevel}</span>
            </div>
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{
                  width: `${Math.max(riskScore, 4)}%`,
                  backgroundColor: meterColor
                }}
              />
            </div>
            <div className="meter-labels">
              <span>0 (Low)</span>
              <span>25 (Caution)</span>
              <span>50 (High)</span>
              <span>75 (Very High)</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* ONE BIG MAIN ACTION LINE */}
        <div className={`main-action-callout ${calloutClass}`}>
          <div style={{ color: meterColor, flexShrink: 0 }}>
            <LevelIcon size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-dim)', fontWeight: 700 }}>
              Primary Recommended Action
            </div>
            <h2 className="action-headline-text" style={{ color: '#ffffff' }}>
              {mainAction}
            </h2>
          </div>
        </div>

        {/* What this means for you */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24 }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 4, color: 'var(--accent-blue)' }}>
            What this means for you
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
            {riskScore >= 50
              ? "High warning signals indicate typical deception techniques (such as asking for your PIN to receive money, fake collect requests, or urgent panic messaging). Do not rush."
              : riskScore >= 25
              ? "Some parameters in this transaction require verification. Confirm the recipient's identity through another trusted channel before authorizing."
              : "No strong fraud indicators were triggered by our heuristic patterns. Still verify the payee name and exact rupee amount before entering your PIN."}
          </p>
        </div>

        {/* Why we flagged this: Signals with evidence */}
        <div className="signals-section">
          <h3>
            <AlertTriangle size={18} style={{ color: 'var(--accent-blue)' }} />
            Why we flagged this ({signals.length} {signals.length === 1 ? 'signal' : 'signals'})
          </h3>

          {signals.length === 0 ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: 16, color: '#a7f3d0', fontSize: '0.9rem' }}>
              ✓ No strong warning signs found in this text. Remember that a low score is a heuristic indicator and does not replace your own vigilance.
            </div>
          ) : (
            signals.map((sig, idx) => {
              const groupClass = sig.group ? sig.group.toLowerCase().replace('_', '-') : 'group-a';
              return (
                <div key={idx} className={`signal-card ${groupClass}`}>
                  <div className="signal-title-row">
                    <span>{sig.label}</span>
                    <span className="signal-points-badge">+{sig.points} pts</span>
                  </div>
                  <p className="signal-explanation">{sig.explanation}</p>
                  {sig.evidence && (
                    <div className="signal-evidence-box">
                      <strong>{t.common.evidence}</strong> "{sig.evidence}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Two Column Advice: What to Avoid & What to Do Now */}
        <div className="advice-grid">
          <div className="advice-card" style={{ borderLeft: '3px solid var(--risk-high)' }}>
            <h4>
              <Ban size={16} style={{ color: 'var(--risk-high)' }} />
              What to Avoid
            </h4>
            <ul>
              {avoid.length > 0 ? (
                avoid.map((item, idx) => (
                  <li key={idx}>
                    <span style={{ color: 'var(--risk-high)' }}>•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li>
                  <span style={{ color: 'var(--risk-high)' }}>•</span>
                  <span>Never enter your UPI PIN on screens claiming you will receive money.</span>
                </li>
              )}
            </ul>
          </div>

          <div className="advice-card" style={{ borderLeft: '3px solid var(--risk-low)' }}>
            <h4>
              <CheckCircle size={16} style={{ color: 'var(--risk-low)' }} />
              What to Do Now
            </h4>
            <ul>
              {whatToDoNow.map((item, idx) => (
                <li key={idx}>
                  <span style={{ color: 'var(--risk-low)' }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How this helps you avoid a risky action box */}
        <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: 4 }}>
            How this helps you avoid a risky action
          </div>
          <p style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
            {howThisHelps}
          </p>
        </div>

        {/* Limits of this check */}
        <div className="limits-note-box">
          <strong style={{ color: 'var(--text-muted)' }}>Limits of this check:</strong>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            {limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* Bottom Navigation Row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCheckAnother}
          >
            <RotateCcw size={16} />
            <span>{t.buttons.checkAnother}</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateToPause}
          >
            <span>{t.buttons.tryPauseDemo}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
