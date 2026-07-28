import type { QAStatus } from "../types/qa";
import { activeStatusColor } from "../utils/qaHelpers";

export function QACompletedBadge({ status }: { status: QAStatus }) {
  const c = activeStatusColor(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}
