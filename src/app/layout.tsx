import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "cyrillic"],
  variable: "--font-source-serif",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Emotion Training — тренажёр чтения эмоций по лицу",
  description:
    "Систематическая тренировка распознавания эмоций по мимическим маркерам. Глубокий разбор каждой карточки на основе FACS Экмана и физиогномической традиции. Для рекрутеров, HR и всех, кто хочет научиться читать людей.",
  metadataBase: new URL("https://emo-training.vercel.app"),
  openGraph: {
    title: "Emotion Training — читать лица, не угадывать эмоции",
    description: "Тренажёр распознавания эмоций по лицу. 70 карточек, 19 эмоций, 3 уровня. Глубокий разбор каждого ответа на основе FACS и физиогномической традиции.",
    type: "website",
    siteName: "Emotion Training",
    locale: "ru_RU",
    images: [{ url: "/og-cover.jpg", width: 1200, height: 630, alt: "Emotion Training" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emotion Training",
    description: "Читать лица, не угадывать эмоции. 70 карточек × 19 эмоций × 3 уровня.",
    images: ["/og-cover.jpg"],
  },
  robots: { index: true, follow: true },
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
    <html lang="ru" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
