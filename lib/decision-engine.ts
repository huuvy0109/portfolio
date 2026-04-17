export type GateResult = 'PASS' | 'FLAKY_DETECTED' | 'GATE_BLOCKED'

export function evaluate(failCount: number, retryCount: number): GateResult {
  if (failCount > 0) return 'GATE_BLOCKED'
  if (retryCount > 1) return 'FLAKY_DETECTED'
  return 'PASS'
}

export const GATE_RULES = [
  { condition: 'failCount > 0',  result: 'GATE_BLOCKED',    action: 'Block CI/CD. Human decision required.' },
  { condition: 'retryCount > 1', result: 'FLAKY_DETECTED',  action: 'Flag ⚠️ Flaky. Log to audit trail.' },
  { condition: 'default',        result: 'PASS',            action: 'Advance pipeline to next phase.' },
] as const
