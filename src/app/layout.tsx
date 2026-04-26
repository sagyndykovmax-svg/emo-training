import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin", "cyrillic"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Emotion Training — тренажёр чтения эмоций по лицу",
  description:
    "Систематическая тренировка навыка распознавания эмоций по выражению лица на основе физиогномической традиции. Для рекрутеров, HR и всех, кто хочет научиться читать людей.",
  openGraph: {
    title: "Emotion Training",
    description: "Тренажёр чтения эмоций по лицу — глубина физиогномики, не угадайка.",
    type: "website",
    siteName: "Emotion Training",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
