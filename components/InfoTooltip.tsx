"use client";

import { useRef, useState } from "react";

interface InfoTooltipProps {
  text: string;
}

// A small "?" affordance whose tooltip is positioned with `fixed` coordinates
// read from the trigger's bounding box. This deliberately avoids an absolutely-
// positioned popup: the table header lives inside an `overflow-hidden` container,
// which would clip a normal absolute tooltip and make the icon look broken/empty.
export default function InfoTooltip({ text }: InfoTooltipProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const show = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left + r.width / 2, y: r.top });
  };
  const hide = () => setPos(null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={text}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold transition-colors hover:brightness-125"
        style={{ background: "rgba(100,116,139,0.2)", color: "#64748b" }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.stopPropagation();
          pos ? hide() : show();
        }}
      >
        ?
      </button>

      {pos && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[100] max-w-xs -translate-x-1/2 -translate-y-full rounded px-2.5 py-1.5 text-xs font-normal normal-case leading-snug tracking-normal shadow-lg"
          style={{
            left: pos.x,
            top: pos.y - 8,
            background: "var(--accent)",
            color: "#0f0f0f",
            whiteSpace: "normal",
          }}
        >
          {text}
        </div>
      )}
    </>
  );
}
