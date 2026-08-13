export type ConfirmedField = {
  confirmed: boolean;
};

export type Show = ConfirmedField & {
  id: string;
  title: string;
  type: string;
  date?: string;
  time?: string;
  description: string;
  image?: string;
  known: string[];
  toClarify: string[];
};

export type Room = ConfirmedField & {
  id: string;
  name: string;
  details: string;
  conditions: string;
  priceLabel: string;
};

export type IncludedItem = ConfirmedField & {
  title: string;
  description: string;
  eyebrow: string;
  icon: string;
};

const officialShowImage =
  "https://sunrise-hotel.ru/wa-data/public/photos/93/05/593/593.96.jpg";

export const sunriseConfig = {
  brand: {
    name: "Санрайз",
    descriptor: "Отель · Витязево",
    logo: "https://sunrise-hotel.ru/wa-data/public/site/themes/sunrise2018/images/title.png",
  },
  contacts: [
    {
      label: "Бесплатная линия",
      value: "8-800-777-28-07",
      href: "tel:+78007772807",
      confirmed: true,
    },
    {
      label: "Телефон / WhatsApp",
      value: "+7 963 000-03-09",
      href: "https://wa.me/79630000309",
      confirmed: true,
    },
  ],
  address: {
    value: "г. Анапа, п. Витязево, пр-д Александрийский, 15 «А»",
    confirmed: true,
  },
  bookingUrl: {
    value: "",
    confirmed: false,
  },
  officialLinks: {
    home: "https://sunrise-hotel.ru/",
    shows: "https://sunrise-hotel.ru/show/",
  },
  shows: [] as Show[],
  offers: [],
  rooms: [
    {
      id: "double-balcony",
      name: "2-местный с балконом",
      details: "Шведский стол / всё включено",
      conditions: "Подбор зависит от выбранных дат",
      priceLabel: "Условия уточняются",
      confirmed: true,
    },
    {
      id: "triple-balcony",
      name: "3-местный с балконом",
      details: "Шведский стол / всё включено",
      conditions: "Подбор зависит от выбранных дат",
      priceLabel: "Условия уточняются",
      confirmed: true,
    },
    {
      id: "four-bed-balcony",
      name: "4-местный с балконом",
      details: "Шведский стол / всё включено",
      conditions: "Подбор зависит от выбранных дат",
      priceLabel: "Условия уточняются",
      confirmed: true,
    },
    {
      id: "family",
      name: "2-комнатный «Семейный»",
      details: "Шведский стол / всё включено",
      conditions: "Подбор зависит от выбранных дат",
      priceLabel: "Условия уточняются",
      confirmed: true,
    },
  ] as Room[],
  includedItems: [
    {
      eyebrow: "Вечер",
      title: "Музыкальная программа",
      description:
        "Музыкальные вечера и анимационные представления для взрослых проходят на территории отеля.",
      icon: "01",
      confirmed: true,
    },
    {
      eyebrow: "Формат",
      title: "Живая музыка и шоу",
      description:
        "На официальной странице указаны живая музыка, игры, конкурсы, бармен-шоу, файер-шоу и восточные танцы.",
      icon: "02",
      confirmed: true,
    },
    {
      eyebrow: "Отель",
      title: "Отдых на территории",
      description:
        "Среди заявленных возможностей отеля — тёплый бассейн, собственный пляж и уютная территория.",
      icon: "03",
      confirmed: true,
    },
    {
      eyebrow: "Важно",
      title: "Состав уточняется",
      description:
        "Состав предложения, наличие и актуальные условия зависят от выбранных дат и уточняются при заявке.",
      icon: "04",
      confirmed: true,
    },
  ] as IncludedItem[],
  gallery: [
    { src: officialShowImage, alt: "Фотография с официальной страницы шоу-программ «Санрайза»" },
    {
      src: "https://sunrise-hotel.ru/wa-data/public/photos/94/05/594/594.96.jpg",
      alt: "Фотография с официальной страницы отеля «Санрайз»",
    },
    {
      src: "https://sunrise-hotel.ru/wa-data/public/photos/95/05/595/595.96.jpg",
      alt: "Фотография с официальной страницы шоу-программ «Санрайза»",
    },
    {
      src: "https://sunrise-hotel.ru/wa-data/public/photos/96/05/596/596.96.jpg",
      alt: "Фотография с официальной страницы отеля «Санрайз»",
    },
    {
      src: "https://sunrise-hotel.ru/wa-data/public/photos/98/05/598/598.96.jpg",
      alt: "Фотография с официальной страницы шоу-программ «Санрайза»",
    },
  ],
} as const;

