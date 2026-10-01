import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Palette Generator & Color Wheel",
  description: "Generate color palettes, explore harmonies on a color wheel, and pick shades.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
