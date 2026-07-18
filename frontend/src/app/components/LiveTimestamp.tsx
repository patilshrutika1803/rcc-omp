import React, { useEffect, useMemo, useState } from "react";


export default function LiveTimestamp({
  className,
  updateIntervalMs = 1000,
  timeZoneLabel = "IST",
}: {
  className?: string;
  updateIntervalMs?: number;
  timeZoneLabel?: string;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), updateIntervalMs);
    return () => window.clearInterval(t);
  }, [updateIntervalMs]);

  const text = useMemo(() => {
    const weekday = now.toLocaleDateString("en-IN", { weekday: "long" });
    const day = now.getDate();
    const month = now.toLocaleDateString("en-IN", { month: "long" });
    const year = now.getFullYear();

    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${weekday}, ${day} ${month} ${year} • ${time} ${timeZoneLabel}`;
  }, [now, timeZoneLabel]);



  return <span className={className}>{text}</span>;
}


