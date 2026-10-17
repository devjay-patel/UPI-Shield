import React, { useState } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  QrCode,
  Link,
  Gift,
  Headphones
} from 'lucide-react';
import { getTranslation } from '../i18n';

export default function ScreenChecklist({ language }) {
  const t = getTranslation(language);

  // In-memory tick box state only (never persisted to localStorage/cookies)
  const [checkedItems, setCheckedItems] = useState({});

  const icons = [ArrowRight, QrCode, Link, Gift, Headphones];

  const checklistItems = t.checklist?.items || [
    { id: 'item-1', text: 'Receiving money never needs your PIN.' },
    { id: 'item-2', text: 'A collect request means money will LEAVE your account.' },
    { id: 'item-3', text: 'Never share your PIN, OTP, or password. Banks never ask for them on call, chat, or SMS.' },
    { id: 'item-4', text: 'Check the recipient name before you confirm.' },
    { id: 'item-5', text: 'Do not rush. Scammers use fear and urgency.' },
    { id: 'item-6', text: 'Do not scan a QR code to "receive" money.' },
    { id: 'item-7', text: 'Do not click unknown links. Open your bank app yourself.' },
    { id: 'item-8', text: 'Do not install apps like AnyDesk because someone on a call asks.' },
    { id: 'item-9', text: 'Call the person on a number you already know if the request is from a "friend" or "relative".' }
  ];

  const rawScams = t.checklist?.scams || [
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
  ];

  const commonScams = rawScams.map((scam, i) => ({
    ...scam,
    icon: icons[i % icons.length]
  }));

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div id="panel-checklist" role="tabpanel" aria-labelledby="tab-checklist">
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h2 className="cyber-card-title">
            <CheckSquare className="text-cyan" size={22} />
            {t.tabs.checklist}
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
            {completedCount} of {checklistItems.length} {t.checklist?.verifiedCount || 'verified (session memory only)'}
          </span>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          {t.checklist?.heading || 'Before sending money or approving any UPI prompt, quickly verify these fundamental golden rules:'}
        </p>

        {/* Interactive Checklist Items */}
        <div className="checklist-container" style={{ marginBottom: 32 }}>
          {checklistItems.map(item => {
            const isChecked = !!checkedItems[item.id];
            return (
              <label
                key={item.id}
                className="checklist-item"
                style={{
                  borderColor: isChecked ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)',
                  background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(10, 15, 28, 0.4)'
                }}
              >
                <input
                  type="checkbox"
                  className="checklist-checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                />
                <span style={{ fontSize: '0.9rem', color: isChecked ? '#ffffff' : 'var(--text-muted)' }}>
                  {item.text}
                </span>
              </label>
            );
          })}
        </div>

        {/* Common UPI Scams Cards */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>
            {t.checklist?.scamsTitle || 'Common UPI Fraud Patterns'}
          </h3>
          <div className="scams-grid">
            {commonScams.map((scam, idx) => {
              const Icon = scam.icon;
              return (
                <div key={idx} className="scam-card">
                  <div className="scam-card-header">
                    <Icon size={18} style={{ color: 'var(--accent-blue)' }} />
                    <span>{scam.title}</span>
                  </div>
                  <p className="scam-card-desc">{scam.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ALREADY LOST MONEY? HELPLINE BOX */}
        <div className="helpline-box">
          <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: 16, borderRadius: '999px', color: '#38bdf8' }}>
            <PhoneCall size={36} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 700, letterSpacing: 0.8 }}>
              {t.checklist?.helplineTitle || 'Already Lost Money or Tricked?'}
            </div>
            <div className="helpline-dial-number">Dial 1930</div>
            <p style={{ fontSize: '0.92rem', color: '#e2e8f0', marginTop: 4 }}>
              {t.checklist?.helplineSub || 'National Cyber Crime Helpline (Ministry of Home Affairs, Govt. of India). Report immediately at cybercrime.gov.in. Notify your bank immediately to freeze the transaction before funds leave the UPI switch.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
