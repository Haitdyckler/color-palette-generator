"use client";

import { textColorFor } from "@/lib/color";

type Props = {
  palette: string[];
  selected: number;
  shadeCol: number | null;
  shades: string[];
  onSelect: (i: number) => void;
  onOpenShades: (i: number) => void;
  onPickShade: (col: number, hex: string) => void;
};

export default function PaletteStrips({
  palette, selected, shadeCol, shades, onSelect, onOpenShades, onPickShade,
}: Props) {
  const mid = Math.floor(shades.length / 2);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl">
      {palette.map((color, i) => {
        const fg = textColorFor(color);
        const isSelected = i === selected;

        // ---- shade picker: 21 stacked rows, current color in the middle ----
        if (i === shadeCol) {
          return (
            <div key={i} className="flex min-w-0 flex-1 flex-col border-l border-white first:border-l-0"
                 role="listbox" aria-label={`Shades of ${color}`}>
              {shades.map((shade, j) => (
                <button key={j} type="button" role="option" aria-selected={j === mid}
                        onClick={(e) => { e.stopPropagation(); onPickShade(i, shade); }}
                        onDoubleClick={(e) => e.stopPropagation()}
                        style={{ backgroundColor: shade, color: textColorFor(shade) }}
                        className={`flex min-h-0 flex-1 cursor-pointer items-center justify-center
                          font-mono text-[10px] leading-none sm:text-xs
                          ${j === mid ? "font-bold ring-2 ring-inset ring-white" : ""}`}>
                  {shade}
                </button>
              ))}
            </div>
          );
        }

        // ---- normal column ----
        return (
          <div key={i}
               role="button" tabIndex={0}
               aria-label={`Color ${i + 1}, ${color}. Double-click or press Enter for shades`}
               aria-pressed={isSelected}
               onClick={() => onSelect(i)}
               onDoubleClick={() => onOpenShades(i)}
               onKeyDown={(e) => {
                 if (e.key === "Enter") { e.preventDefault(); onOpenShades(i); }
                 if (e.key === " " && e.target === e.currentTarget) { e.preventDefault(); onSelect(i); }
               }}
               style={{ backgroundColor: color, color: fg }}
               className="flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-2
                          border-l border-white first:border-l-0 outline-none
                          focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/80">
            <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "" : "opacity-0"}`}
                  style={{ backgroundColor: fg }} />
            <span className={`font-mono text-sm sm:text-base ${isSelected ? "font-bold" : ""}`}>{color}</span>
            {/* touch-friendly alternative to double-click */}
            <button type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenShades(i); }}
                    onDoubleClick={(e) => e.stopPropagation()}
                    style={{ borderColor: fg }}
                    className={`rounded-full border px-2 py-0.5 text-xs ${isSelected ? "" : "invisible"}`}
                    tabIndex={isSelected ? 0 : -1}>
              Shades
            </button>
          </div>
        );
      })}
    </div>
  );
}
