"use client";

import { useEffect, useState } from "react";

/** Local time where the work happens. Rendered after mount, so the server's
    clock never disagrees with the visitor's. */
export function LagosTime() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
    const tick = () => setNow(fmt.format(new Date()));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return (
    <span>
      Lagos <span className="tabular-nums">{now ?? "--:--"}</span>
    </span>
  );
}
