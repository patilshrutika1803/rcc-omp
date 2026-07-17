import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { Notification } from "../types/notification";
import { getSeverityIconStyles } from "../utils/notificationHelpers";

export function NotificationIcon({ severity }: { severity: Notification["severity"] }) {
  const styles = getSeverityIconStyles(severity);

  if (severity === "critical") {
    return (
      <div className={`w-9 h-9 ${styles.wrapper} rounded-xl flex items-center justify-center shrink-0`}>
        <AlertTriangle size={16} className={styles.icon} />
      </div>
    );
  }
  if (severity === "warning") {
    return (
      <div className={`w-9 h-9 ${styles.wrapper} rounded-xl flex items-center justify-center shrink-0`}>
        <AlertTriangle size={16} className={styles.icon} />
      </div>
    );
  }
  if (severity === "success") {
    return (
      <div className={`w-9 h-9 ${styles.wrapper} rounded-xl flex items-center justify-center shrink-0`}>
        <CheckCircle2 size={16} className={styles.icon} />
      </div>
    );
  }
  return (
    <div className={`w-9 h-9 ${styles.wrapper} rounded-xl flex items-center justify-center shrink-0`}>
      <Info size={16} className={styles.icon} />
    </div>
  );
}
