import React from 'react';
import { Shield, RotateCcw, Search, BarChart3, PauseCircle, CheckSquare } from 'lucide-react';
import { getTranslation } from '../i18n';

export default function TopHeader({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onResetSession
}) {
  const t = getTranslation(language);

  const tabsConfig = [
    { id: 'check', label: t.tabs.check, icon: Search },
    { id: 'result', label: t.tabs.result, icon: BarChart3 },
    { id: 'pause', label: t.tabs.pause, icon: PauseCircle },
    { id: 'checklist', label: t.tabs.checklist, icon: CheckSquare }
  ];

  return (
    <header className="top-header" role="banner">
      <div className="top-header-inner">
        <div className="brand-section">
          <div className="brand-icon-box" aria-hidden="true">
            <Shield size={24} />
          </div>
          <div className="brand-titles">
            <h1>
              {t.appTitle}
              <span className="team-badge">{t.teamName}</span>
            </h1>
          </div>
        </div>

        <div className="header-controls">
          <div className="lang-selector" role="group" aria-label="Language Selector">
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
              onClick={() => setLanguage('hi')}
            >
              हिंदी
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'gu' ? 'active' : ''}`}
              onClick={() => setLanguage('gu')}
            >
              ગુજરાતી
            </button>
          </div>

          <button
            type="button"
            className="reset-btn"
            onClick={onResetSession}
            title={t.buttons.resetSession}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <nav className="nav-tabs-wrapper" aria-label="Main Navigation">
        <div className="nav-tabs" role="tablist">
          {tabsConfig.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`nav-tab-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
