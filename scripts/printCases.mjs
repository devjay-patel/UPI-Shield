import { analyzePaymentRequest } from '../src/engine/fraudEngine.js';
import { SAMPLE_CASES } from '../src/data/sampleCases.js';

for (const c of SAMPLE_CASES) {
  const r = analyzePaymentRequest(c.input);
  const exp = Array.isArray(c.expectedLevel) ? c.expectedLevel.join(' / ') : c.expectedLevel;
  const ok = (Array.isArray(c.expectedLevel) ? c.expectedLevel.includes(r.riskLevel) : r.riskLevel === c.expectedLevel) && r.mainAction === c.expectedAction;
  console.log(`${c.title}\n  expected: ${exp} | ${c.expectedAction}\n  actual:   ${r.riskLevel} (${r.riskScore}) | ${r.mainAction}\n  signals:  ${r.signals.map(s => s.id + '+' + s.points).join(', ') || 'none'}\n  ${ok ? 'PASS' : 'FAIL'}\n`);
}
