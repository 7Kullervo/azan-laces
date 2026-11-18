"use client";

import { useEffect, useState } from "react";

export default function AnnouncementBar({ messages }: { messages: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, [messages.length]);

  if (!messages.length) return null;
  return (
    <div className="bg-ink text-ivory">
      <div className="container-page flex h-9 items-center justify-center text-center text-xs tracking-wide sm:text-[13px]">
        <p key={i} className="fade-up truncate">
          {messages[i]}
        </p>
      </div>
    </div>
  );
}
