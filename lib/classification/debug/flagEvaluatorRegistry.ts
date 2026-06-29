import type { FlagEvaluator, MlTelemetryEventInsert } from '@/lib/classification/debug/types';

const evaluators: FlagEvaluator[] = [];

export function registerFlagEvaluator(evaluator: FlagEvaluator): void {
  evaluators.push(evaluator);
}

export function evaluateFlags(event: MlTelemetryEventInsert, hints: string[] = []): string[] {
  const flags = new Set<string>(hints);
  for (const evaluate of evaluators) {
    if (evaluate(event) && evaluate.flagName) {
      flags.add(evaluate.flagName);
    }
  }
  return [...flags].sort();
}

export function defineFlag(name: string, evaluate: (event: MlTelemetryEventInsert) => boolean): FlagEvaluator {
  const fn = evaluate as FlagEvaluator;
  fn.flagName = name;
  return fn;
}
