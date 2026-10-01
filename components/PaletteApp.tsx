"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ColorWheel from "./ColorWheel";
import HarmonyPanel from "./HarmonyPanel";
import PaletteStrips from "./PaletteStrips";
import { HARMONY_NAMES, type HarmonyName, generatePalette, makeShades } from "@/lib/color";

// Fixed first render so server and client HTML match; randomised right after mount.
const INITIAL_PALETTE = ["#c9ac1c", "#a6f644", "#3ead34", "#d1cf40", "#75b11d"];

export default function PaletteApp() {
  const [palette, setPalette] = useState<string[]>(INITIAL_PALETTE);
  const [selected, setSelected] = useState(0);
  const [harmony, setHarmony] = useState<HarmonyName>("Triadic");
  const [shadeCol, setShadeCol] = useState<number | null>(null);
  const [shades, setShades] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const statusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const regenerate = useCallback(() => {
    setPalette(generatePalette());
    setSelected(0);
    setShadeCol(null);
    setStatus("");
  }, []);

  useEffect(() => {
    // random palette on first load (client only); deferred so it isn't a synchronous setState in an effect
    const id = setTimeout(regenerate, 0);
    return () => clearTimeout(id);
  }, [regenerate]);

  // Space = new palette, Esc = close the shade picker
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShadeCol(null);
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        regenerate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [regenerate]);

  const select = (i: number) => {
    setSelected(i);
    if (shadeCol !== null && i !== shadeCol) setShadeCol(null);
  };

  const openShades = (i: number) => {
    setSelected(i);
    setShades(makeShades(palette[i]));
    setShadeCol(i);
  };

  const pickShade = (col: number, hex: string) => {
    setPalette((p) => p.map((c, i) => (i === col ? hex : c)));
    setSelected(col);
    setShadeCol(null);
  };

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setStatus(`Copied ${hex}`);
    } catch {
      setStatus(`Couldn't copy — ${hex}`);
    }
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(""), 2000);
  };

  const base = palette[selected];

  return (
    <div className="grid w-full max-w-[1024px] gap-3 lg:h-[728px] lg:grid-cols-[1fr_230px] lg:grid-rows-[1fr_240px]">
      {/* palette */}
      <section aria-label="Palette"
               className="h-[420px] rounded-2xl bg-[#909090] px-9 py-5 lg:h-auto">
        <PaletteStrips palette={palette} selected={selected} shadeCol={shadeCol} shades={shades}
                       onSelect={select} onOpenShades={openShades} onPickShade={pickShade} />
      </section>

      {/* wheel + harmony picker */}
      <section aria-label="Color wheel"
               className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl bg-[#909090] p-6 text-white sm:px-9">
        <ColorWheel color={base} harmony={harmony} />

        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Harmony shown on the wheel</legend>
          {HARMONY_NAMES.map((name) => (
            <label key={name}
                   className={`flex cursor-pointer items-center gap-2 ${name === harmony ? "font-bold" : ""}`}>
              <input type="radio" name="harmony" value={name} checked={harmony === name}
                     onChange={() => setHarmony(name)}
                     className="h-4 w-4 cursor-pointer accent-[#555]" />
              {name}
            </label>
          ))}
        </fieldset>

        <div className="flex max-w-[220px] flex-col items-start gap-3 text-sm text-white/90">
          <button type="button" onClick={regenerate}
                  className="rounded-full bg-white px-4 py-1.5 font-medium text-[#333] hover:bg-white/85
                             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Generate (Space)
          </button>
          <p>Double-click a color — or press Enter — for 21 shades. Esc closes them.</p>
        </div>
      </section>

      {/* harmonies list */}
      <HarmonyPanel base={base} harmony={harmony} status={status} onCopy={copy} />
    </div>
  );
}
