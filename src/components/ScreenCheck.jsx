import React, { useState } from 'react';
import {
  FileText,
  QrCode,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Camera,
  Upload
} from 'lucide-react';
import { parseUpiQrPayload, detectAndMaskSecrets, analyzePaymentRequest } from '../engine/fraudEngine';
import { decodeQrImageFile } from '../utils/qrImageDecoder';
import { SAMPLE_CASES } from '../data/sampleCases';
import { SAMPLE_CONTACTS } from '../data/sampleContacts';
import { getTranslation } from '../i18n';

export default function ScreenCheck({
  formData,
  setFormData,
  onAnalyze,
  language
}) {
  const t = getTranslation(language);
  const [activeInputMode, setActiveInputMode] = useState('payment'); // 'payment' | 'qr' | 'message'
  const [emptyWarning, setEmptyWarning] = useState(false);
  const [qrUploadStatus, setQrUploadStatus] = useState(null);

  // QR state
  const parsedQr = formData.qrPayload ? parseUpiQrPayload(formData.qrPayload) : null;

  // Real-time secret check
  const activeSecretCheck = detectAndMaskSecrets(
    activeInputMode === 'message'
      ? formData.message
      : `${formData.message} ${formData.link} ${formData.qrDescription}`
  );

  const handleInputChange = (field, value) => {
    setEmptyWarning(false);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData({
      type: 'pay',
      recipientName: '',
      upiId: '',
      amount: '',
      message: '',
      link: '',
      qrPayload: '',
      qrDescription: ''
    });
    setEmptyWarning(false);
  };

  const handleLoadDemoCase = (demoCase) => {
    setFormData({
      type: demoCase.input.type || 'pay',
      recipientName: demoCase.input.recipientName || '',
      upiId: demoCase.input.upiId || '',
      amount: demoCase.input.amount || '',
      message: demoCase.input.message || '',
      link: demoCase.input.link || '',
      qrPayload: demoCase.input.qrPayload || '',
      qrDescription: demoCase.input.qrDescription || ''
    });

    if (demoCase.input.qrPayload) {
      setActiveInputMode('qr');
    } else if (demoCase.input.message && !demoCase.input.recipientName) {
      setActiveInputMode('message');
    } else {
      setActiveInputMode('payment');
    }

    setEmptyWarning(false);
  };

  const handleLoadExample = () => {
    setEmptyWarning(false);
    if (activeInputMode === 'qr') {
      setFormData(prev => ({
        ...prev,
        qrPayload: 'upi://pay?pa=buyer.refund99@xyz&pn=Refund%20Desk&am=2000&cu=INR&tn=Refund',
        qrDescription: 'Scan this and enter PIN to receive Rs 2000'
      }));
    } else if (activeInputMode === 'message') {
      setFormData(prev => ({
        ...prev,
        message: 'Dear customer, your bank KYC is expired. Your account will be blocked today. Click http://bit.ly/kyc-update-now and pay Rs 10 to verify.'
      }));
    } else {
      handleLoadDemoCase(SAMPLE_CASES[1]);
    }
  };

  const handleTriggerAnalyze = () => {
    // Basic validation
    const hasContent =
      formData.recipientName ||
      formData.upiId ||
      formData.message ||
      formData.link ||
      formData.qrPayload ||
      formData.qrDescription;

    if (!hasContent) {
      setEmptyWarning(true);
      return;
    }

    onAnalyze(activeInputMode);
  };

  return (
    <div id="panel-check" role="tabpanel" aria-labelledby="tab-check">
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h2 className="cyber-card-title">
            <ShieldCheck className="text-cyan" size={22} />
            {t.tabs.check}
          </h2>
          <span className="demo-pass-pill pill-pass">
            100% In-Browser Simulation
          </span>
        </div>

        {/* Secret Warning Banner if user accidentally pastes credentials */}
        {activeSecretCheck.hasSecrets && (
          <div className="secret-alert-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{t.secretWarning}</span>
          </div>
        )}

        {/* Input Mode Tabs */}
        <div className="input-mode-tabs" role="tablist" aria-label="Input Mode Selection">
          <button
            type="button"
            role="tab"
            aria-selected={activeInputMode === 'payment'}
            className={`mode-tab-btn ${activeInputMode === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveInputMode('payment')}
          >
            <FileText size={16} />
            <span>Payment Request</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeInputMode === 'qr'}
            className={`mode-tab-btn ${activeInputMode === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveInputMode('qr')}
          >
            <QrCode size={16} />
            <span>QR Code Simulation</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeInputMode === 'message'}
            className={`mode-tab-btn ${activeInputMode === 'message' ? 'active' : ''}`}
            onClick={() => setActiveInputMode('message')}
          >
            <MessageSquare size={16} />
            <span>Message / Link</span>
          </button>
        </div>

        {/* Empty state warning */}
        {emptyWarning && (
          <div className="secret-alert-banner" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}>
            <AlertTriangle size={18} />
            <span>Please enter request details, scan description, or select a demo case below to evaluate risk.</span>
          </div>
        )}

        {/* MODE 1: PAYMENT REQUEST FORM */}
        {activeInputMode === 'payment' && (
          <div className="payment-mode-section">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="req-type">Request Type</label>
                <select
                  id="req-type"
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="pay">Pay Request (Sending money to merchant/person)</option>
                  <option value="collect">Collect Request (Someone asking money from you)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="req-recipient">Recipient Name</label>
                <input
                  id="req-recipient"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Kirana Store, Bank Support"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="req-upi-id">UPI ID (VPA)</label>
                <input
                  id="req-upi-id"
                  type="text"
                  className="form-input"
                  placeholder="e.g. ramesh.store@okbank"
                  value={formData.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="req-amount">Amount (₹)</label>
                <input
                  id="req-amount"
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 250"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label htmlFor="req-msg">Message / Note / Purpose</label>
              <textarea
                id="req-msg"
                className="form-textarea"
                rows="2"
                placeholder="e.g. Grocery payment, or 'Congratulations! Enter UPI PIN to claim cashback'"
                value={formData.message}
                maxLength={3000}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
              <div className="char-counter">
                {formData.message.length} / 3000 {t.common.charCount}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label htmlFor="req-link">Attached Link (Optional - safe parse only)</label>
              <input
                id="req-link"
                type="text"
                className="form-input"
                placeholder="e.g. http://bit.ly/kyc-update-now"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
              />
            </div>

            {/* Saved contacts helper */}
            <div className="contacts-helper">
              <div className="contacts-helper-header">
                <Users size={14} />
                <span>Your saved contacts (sample baseline for unknown-recipient check):</span>
              </div>
              <div className="contacts-chip-list">
                {SAMPLE_CONTACTS.map((c) => (
                  <button
                    key={c.upiId}
                    type="button"
                    className="contact-chip"
                    onClick={() => {
                      handleInputChange('recipientName', c.name);
                      handleInputChange('upiId', c.upiId);
                    }}
                  >
                    + {c.name} ({c.upiId})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: QR CODE SIMULATION */}
        {activeInputMode === 'qr' && (
          <div className="qr-mode-section">
            <div className="secret-alert-banner" style={{ background: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.3)', color: '#bae6fd' }}>
              <QrCode size={18} />
              <span>
                <strong>QR Safety Simulation:</strong> Parses standard UPI QR string locally. No camera upload, no network requests, and decoded links are never opened.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label htmlFor="qr-payload-input">Sample UPI QR Payload String</label>
              <input
                id="qr-payload-input"
                type="text"
                className="form-input"
                placeholder="upi://pay?pa=shop.demo@okbank&pn=Demo%20Shop&am=250&cu=INR&tn=Books"
                value={formData.qrPayload}
                onChange={(e) => handleInputChange('qrPayload', e.target.value)}
              />
            </div>

            {/* Client-side offline QR Screenshot upload */}
            <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <Upload size={16} style={{ color: 'var(--accent-blue)' }} />
                  <span><strong>{t.buttons.uploadQrImage}</strong> (Decoded via browser canvas, zero upload)</span>
                </div>
                <label className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer' }}>
                  Choose Image File
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setQrUploadStatus('Decoding QR image locally...');
                      try {
                        const decodedData = await decodeQrImageFile(file);
                        handleInputChange('qrPayload', decodedData);
                        setQrUploadStatus('✓ QR successfully decoded locally!');
                      } catch (err) {
                        setQrUploadStatus(`Error: ${err.message}`);
                      }
                    }}
                  />
                </label>
              </div>
              {qrUploadStatus && (
                <div style={{ fontSize: '0.78rem', marginTop: 6, color: qrUploadStatus.startsWith('✓') ? '#a7f3d0' : '#fca5a5' }}>
                  {qrUploadStatus}
                </div>
              )}
            </div>

            {/* Preset Synthetic QR Buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  handleInputChange('qrPayload', 'upi://pay?pa=shop.demo@okbank&pn=Demo%20Shop&am=250&cu=INR&tn=Books');
                  handleInputChange('qrDescription', 'Paying for bookstore purchase');
                }}
              >
                Load Normal QR Example
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  handleInputChange('qrPayload', 'upi://pay?pa=buyer.refund99@xyz&pn=Refund%20Desk&am=2000&cu=INR&tn=Refund');
                  handleInputChange('qrDescription', 'Scan this and enter PIN to receive Rs 2000');
                }}
              >
                Load Refund Scam QR
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  handleInputChange('qrPayload', 'upi://pay?pa=lottery.agent@okbank&pn=Prize%20Disbursal&am=5000&cu=INR&tn=Prize');
                  handleInputChange('qrDescription', 'Scan QR and type PIN to claim prize');
                }}
              >
                Load PIN Scam QR
              </button>
            </div>

            {/* Decoded QR Fields */}
            {parsedQr && !parsedQr.isValid && (
              <div className="secret-alert-banner" role="alert" style={{ marginBottom: 16 }}>
                <AlertTriangle size={18} />
                <span>{parsedQr.error}</span>
              </div>
            )}
            {parsedQr && parsedQr.isValid && (
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 8 }}>
                  ✓ Locally Decoded UPI Parameters:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: '0.85rem' }}>
                  <div><strong>Payee VPA (pa):</strong> {parsedQr.pa || 'N/A'}</div>
                  <div><strong>Payee Name (pn):</strong> {parsedQr.pn || 'N/A'}</div>
                  <div><strong>Amount (am):</strong> {parsedQr.am ? `₹${parsedQr.am}` : 'Dynamic / Not fixed'}</div>
                  <div><strong>Note (tn):</strong> {parsedQr.tn || 'None'}</div>
                </div>
                {(() => {
                  const pnWords = (parsedQr.pn || '').toLowerCase().split(/\s+/).filter(w => w.length >= 3);
                  const paLower = (parsedQr.pa || '').toLowerCase();
                  const amt = parseFloat(parsedQr.am);
                  const checks = [
                    { text: 'Payee name looks different from the UPI ID', hit: pnWords.length > 0 && !pnWords.some(w => paLower.includes(w)) },
                    { text: 'Amount is unusually high (above ₹5,000)', hit: !isNaN(amt) && amt > 5000 },
                    { text: 'Note contains scam-related words', hit: /refund|cashback|prize|lottery|reward|kyc|claim/i.test(parsedQr.tn || '') },
                    { text: 'Described as a "receive money" QR', hit: /receive|milega|get money|paisa/i.test(formData.qrDescription || '') }
                  ];
                  return (
                    <ul style={{ listStyle: 'none', marginTop: 12, fontSize: '0.82rem' }}>
                      {checks.map(c => (
                        <li key={c.text} style={{ color: c.hit ? '#fcd34d' : 'var(--text-muted)', marginBottom: 4 }}>
                          {c.hit ? '⚠ Check this: ' : '✓ Not noticed: '}{c.text}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label htmlFor="qr-desc-input">Describe what the person or QR asks you to do:</label>
              <input
                id="qr-desc-input"
                type="text"
                className="form-input"
                placeholder="e.g. 'Scan and enter PIN to receive Rs 2000' or 'Approve to get money'"
                value={formData.qrDescription}
                onChange={(e) => handleInputChange('qrDescription', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* MODE 3: MESSAGE / LINK */}
        {activeInputMode === 'message' && (
          <div className="message-mode-section">
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label htmlFor="free-msg-input">Paste suspicious SMS, WhatsApp message, or payment description:</label>
              <textarea
                id="free-msg-input"
                className="form-textarea"
                rows="5"
                placeholder="Paste message here (e.g. 'Dear customer, your bank KYC is expired. Your account will be blocked today. Click http://bit.ly/kyc-update-now and pay Rs 10 to verify.')"
                value={formData.message}
                maxLength={3000}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
              <div className="char-counter">
                {formData.message.length} / 3000 {t.common.charCount}
              </div>
            </div>
          </div>
        )}

        {/* Form Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleTriggerAnalyze}
          >
            <Sparkles size={16} />
            <span>{t.buttons.checkRisk}</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClear}
          >
            <RotateCcw size={16} />
            <span>{t.buttons.clear}</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleLoadExample}
          >
            <Sparkles size={16} />
            <span>{t.buttons.loadExample}</span>
          </button>
        </div>

        {/* DEMO CENTER: 8 Synthetic Test Cases */}
        <div className="demo-center-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800 }}>
                Demo Center – Synthetic demo data
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                One-click load test cases evaluated live through the real fraud engine.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
              Live Computed Results
            </span>
          </div>

          <div className="demo-cases-grid">
            {SAMPLE_CASES.map((demoCase) => {
              // Real-time engine evaluation on this demo case
              const liveResult = analyzePaymentRequest(demoCase.input);
              const isLevelMatch = Array.isArray(demoCase.expectedLevel)
                ? demoCase.expectedLevel.includes(liveResult.riskLevel)
                : liveResult.riskLevel === demoCase.expectedLevel;
              const isActionMatch = liveResult.mainAction === demoCase.expectedAction;
              const isPass = isLevelMatch && isActionMatch;

              let badgeClass = 'badge-tag-suspicious';
              if (demoCase.badge === 'Normal') badgeClass = 'badge-tag-normal';
              if (demoCase.badge === 'Educational') badgeClass = 'badge-tag-educational';
              if (demoCase.badge.includes('Caution')) badgeClass = 'badge-tag-verify';

              return (
                <div key={demoCase.id} className="demo-case-card">
                  <div>
                    <div className="demo-case-header">
                      <span>{demoCase.title}</span>
                      <span className={`demo-badge-tag ${badgeClass}`}>
                        {demoCase.badge}
                      </span>
                    </div>
                    <p className="demo-case-desc" style={{ marginTop: 6 }}>
                      {demoCase.description}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.5 }}>
                      <div><strong>Expected:</strong> {Array.isArray(demoCase.expectedLevel) ? demoCase.expectedLevel.join(' or ') : demoCase.expectedLevel} – {demoCase.expectedAction}</div>
                      <div><strong>Actual:</strong> {liveResult.riskLevel} ({liveResult.riskScore}) – {liveResult.mainAction}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isPass ? (
                        <span className="demo-pass-pill pill-pass">
                          <CheckCircle2 size={12} /> PASS
                        </span>
                      ) : (
                        <span className="demo-pass-pill pill-fail">
                          <XCircle size={12} /> FAIL
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Score: {liveResult.riskScore}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleLoadDemoCase(demoCase)}
                    >
                      Load Case
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
