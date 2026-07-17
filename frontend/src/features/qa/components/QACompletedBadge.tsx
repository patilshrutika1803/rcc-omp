import type { CompletedStatus } from "../types/qa";
import { completedStatusCfg } from "../utils/qaHelpers";

export function QACompletedBadge({ status }: { status: CompletedStatus }) {
  const c = completedStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}
