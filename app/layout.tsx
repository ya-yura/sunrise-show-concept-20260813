import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ya-yura.github.io/sunrise-show-concept-20260813/"),
  title: "Музыкальные вечера и шоу в «Санрайзе»",
  description: "Музыкальные вечера и шоу в отеле «Санрайз» в Витязево. Подберите даты проживания и подготовьте один понятный запрос.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Музыкальные вечера и шоу в «Санрайзе»",
    description: "Подберите даты проживания под программу и подготовьте один понятный запрос.",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/assets/sunrise/hero/evening.jpg",
        width: 800,
        height: 1200,
        alt: "Официальная фотография вечерней программы «Санрайза»",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Музыкальные вечера и шоу в «Санрайзе»",
    description: "Подберите даты проживания под программу и подготовьте один понятный запрос.",
    images: ["/assets/sunrise/hero/evening.jpg"],
  },
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
