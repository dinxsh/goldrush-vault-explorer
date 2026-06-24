import { useState } from "react";

interface InfoTooltipProps {
  text: string;
  children?: React.ReactNode;
}

export default function InfoTooltip({ text, children }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold transition-colors hover:bg-opacity-80"
        style={{ background: "rgba(100,116,139,0.2)", color: "#64748b" }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(!visible)}
        title={text}
      >
        ?
      </button>

      {visible && (
        <div
          className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap z-50"
          style={{
            background: "var(--accent)",
            color: "#0f0f0f",
          }}
        >
          {text}
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-0.5"
            style={{
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: `4px solid var(--accent)`,
            }}
          />
        </div>
      )}

      {children}
    </div>
  );
}
