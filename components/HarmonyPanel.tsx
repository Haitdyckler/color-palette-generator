"use client";

import { HARMONIES, type HarmonyName, harmonyColors, textColorFor } from "@/lib/color";

type Props = {
  base: string;
  harmony: HarmonyName;
  status: string;
  onCopy: (hex: string) => void;
};

export default function HarmonyPanel({ base, harmony, status, onCopy }: Props) {
  return (
    <aside className="relative flex flex-col gap-3 rounded-2xl bg-[#909090] p-4 text-white lg:row-span-2">
      <h2 className="text-lg font-bold leading-snug">
        Harmonies of
        <br />
        <span className="font-mono">{base}</span>
      </h2>

      <div className="flex flex-col gap-3 overflow-y-auto">
        {(Object.keys(HARMONIES) as HarmonyName[]).map((name) => (
          <section key={name}>
            <h3 className={`mb-1 text-sm ${name === harmony ? "font-bold" : ""}`}>{name}</h3>
            <ul className="flex flex-col gap-px">
              {harmonyColors(base, HARMONIES[name]).map((color, i) => (
                <li key={i}>
                  <button type="button" onClick={() => onCopy(color)}
                          title="Click to copy"
                          style={{ backgroundColor: color, color: textColorFor(color) }}
                          className="w-full cursor-pointer py-1 text-center font-mono text-xs
                                     focus-visible:outline-2 focus-visible:outline-white">
                    {color}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p role="status" aria-live="polite"
         className="mt-auto min-h-5 text-center text-sm">{status}</p>
    </aside>
  );
}
