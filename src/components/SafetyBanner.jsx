import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { getTranslation } from '../i18n';

export default function SafetyBanner({ language }) {
  const t = getTranslation(language);

  return (
    <div className="safety-banner" role="alert">
      <ShieldAlert className="safety-banner-icon" size={18} aria-hidden="true" />
      <span>{t.safetyBanner}</span>
    </div>
  );
}
