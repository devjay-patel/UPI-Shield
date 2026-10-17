/**
 * In-Browser Offline Voice Alerts via Web Speech API
 * Zero network requests. Runs 100% locally.
 */

export function speakWarning(message, lang = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis API is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);

  // Set language
  if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (lang === 'gu') {
    utterance.lang = 'gu-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
