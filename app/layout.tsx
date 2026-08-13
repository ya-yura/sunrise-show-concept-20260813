import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ya-yura.github.io/sunrise-show-concept-20260813/"),
  title: "Музыкальные вечера и семейный отдых в «Санрайзе»",
  description: "Музыкальные вечера, бассейн, собственный пляж и семейные номера в отеле «Санрайз» в Витязево. Выберите даты и номер для отдыха.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Музыкальные вечера и семейный отдых в «Санрайзе»",
    description: "Музыкальные вечера, бассейн, собственный пляж и семейные номера в «Санрайзе». Выберите даты для отдыха.",
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
    title: "Музыкальные вечера и семейный отдых в «Санрайзе»",
    description: "Музыкальные вечера, бассейн, собственный пляж и семейные номера в «Санрайзе». Выберите даты для отдыха.",
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
