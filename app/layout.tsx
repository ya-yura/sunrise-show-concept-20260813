import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Музыкальные вечера и шоу в «Санрайзе»",
  description: "Выберите программу и даты проживания в отеле «Санрайз» в Витязево — одним понятным запросом.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

