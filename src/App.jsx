import React, { useState } from 'react';
import SafetyBanner from './components/SafetyBanner';
import TopHeader from './components/TopHeader';
import ScreenCheck from './components/ScreenCheck';
import ScreenResult from './components/ScreenResult';
import ScreenPauseDemo from './components/ScreenPauseDemo';
import ScreenChecklist from './components/ScreenChecklist';
import { analyzePaymentRequest, parseUpiQrPayload } from './engine/fraudEngine';
import { getTranslation } from './i18n';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('check'); // 'check' | 'result' | 'pause' | 'checklist'

  // In-Memory Localization State only (Never stored in localStorage)
  const [language, setLanguage] = useState('en'); // 'en' | 'hi' | 'gu'
  const t = getTranslation(language);

  // In-Memory Form State
  const [formData, setFormData] = useState({
    type: 'pay',
    recipientName: '',
    upiId: '',
    amount: '',
    message: '',
    link: '',
    qrPayload: '',
    qrDescription: ''
  });

  // In-Memory Analysis State
  const [analysisResult, setAnalysisResult] = useState(null);

  // In-Memory Pause Demo Data
  const [paymentSimulationData, setPaymentSimulationData] = useState({
    type: 'pay',
    recipientName: 'Demo Shop',
    upiId: 'shop.demo@okbank',
    amount: '250',
    message: 'Store purchase'
  });

  // In-Memory Blocked Count (Never persisted)
  const [sessionBlocksCount, setSessionBlocksCount] = useState(0);

  // Trigger Analysis
  const handleAnalyze = (mode) => {
    let input;
    let sim;

    if (mode === 'qr') {
      const qr = parseUpiQrPayload(formData.qrPayload);
      input = { type: 'pay', qrPayload: formData.qrPayload, qrDescription: formData.qrDescription, language };
      sim = {
        type: 'pay',
        recipientName: (qr.isValid && qr.pn) || 'Unknown payee',
        upiId: (qr.isValid && qr.pa) || 'not-decoded',
        amount: (qr.isValid && qr.am) || '',
        message: formData.qrDescription || (qr.isValid && qr.tn) || 'QR payment',
        qrDescription: formData.qrDescription
      };
    } else if (mode === 'message') {
      input = { type: 'pay', message: formData.message, language };
      sim = { type: 'pay', recipientName: 'Unknown sender', upiId: 'unknown@upi', amount: '', message: formData.message };
    } else {
      input = {
        type: formData.type,
        recipientName: formData.recipientName,
        upiId: formData.upiId,
        amount: formData.amount,
        message: formData.message,
        link: formData.link,
        language
      };
      sim = {
        type: formData.type || 'pay',
        recipientName: formData.recipientName || 'Unknown recipient',
        upiId: formData.upiId || 'unknown@upi',
        amount: formData.amount,
        message: formData.message,
        link: formData.link
      };
    }

    setAnalysisResult(analyzePaymentRequest(input));
    setPaymentSimulationData(sim);

    // Switch to Screen B (Result)
    setActiveTab('result');
  };

  // Navigate to Pause Demo from Screen B
  const handleNavigateToPause = () => {
    setActiveTab('pause');
  };

  // Check Another Request (Return to Screen A)
  const handleCheckAnother = () => {
    setActiveTab('check');
  };

  // Cancel in Pause Screen -> Increment in-memory counter
  const handleCancelPayment = () => {
    setSessionBlocksCount(prev => prev + 1);
  };

  // Reset entire in-memory session
  const handleResetSession = () => {
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
    setAnalysisResult(null);
    setSessionBlocksCount(0);
    setActiveTab('check');
  };

  return (
    <>
      {/* Mandatory Safety Banner across ALL screens */}
      <SafetyBanner language={language} />

      {/* Top Header & Navigation */}
      <TopHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onResetSession={handleResetSession}
      />

      {/* Main Viewport: Exact 4 Screens */}
      <main className="main-viewport">
        {activeTab === 'check' && (
          <ScreenCheck
            formData={formData}
            setFormData={setFormData}
            onAnalyze={handleAnalyze}
            language={language}
          />
        )}

        {activeTab === 'result' && (
          <ScreenResult
            analysis={analysisResult}
            paymentData={paymentSimulationData}
            onNavigateToPause={handleNavigateToPause}
            onCheckAnother={handleCheckAnother}
            language={language}
          />
        )}

        {activeTab === 'pause' && (
          <ScreenPauseDemo
            paymentData={paymentSimulationData}
            onCancelPayment={handleCancelPayment}
            sessionBlocksCount={sessionBlocksCount}
            onResetSession={handleResetSession}
            language={language}
          />
        )}

        {activeTab === 'checklist' && (
          <ScreenChecklist language={language} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <strong>UPI Shield</strong> • Cyber Samvad 2026 Hackathon • Team ThreatZero (Adani University)
        </div>
        <div style={{ marginTop: 4, fontSize: '0.78rem' }}>
          Explainable, rule-based heuristic prototype • 100% Client-side • Zero real payments • Zero credential requests
        </div>
      </footer>
    </>
  );
}
