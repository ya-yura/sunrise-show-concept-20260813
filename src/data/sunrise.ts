export type FactStatus = "confirmed" | "conflict";

export type FactRecord = {
  key: string;
  value: string;
  sourceUrl: string;
  checkedAt: string;
  status: FactStatus;
  note?: string;
};

export type Show = {
  id: string;
  title: string;
  type: string;
  date?: string;
  time?: string;
  description: string;
  image?: string;
  known: string[];
  toClarify: string[];
  confirmed: boolean;
};

export type Room = {
  id: string;
  name: string;
  area: string;
  capacity: string;
  floors: string;
  balcony: string;
  details: string;
  food: string;
  conditions: string;
  priceLabel: string;
  pricePeriod: string;
  priceStatus: FactStatus;
  priceSource: string;
  priceCheckedAt: string;
  photo: string;
  photoAlt: string;
  officialUrl: string;
  confirmed: boolean;
};

export type IncludedItem = {
  title: string;
  description: string;
  eyebrow: string;
  icon: string;
  sourceUrl: string;
  status: FactStatus;
  confirmed: boolean;
};

export type Contact = {
  label: string;
  value: string;
  href: string;
  channel: "phone" | "whatsapp" | "max";
  confirmed: boolean;
};

export const checkedAt = "2026-08-13";

const official = {
  home: "https://sunrise-hotel.ru/",
  shows: "https://sunrise-hotel.ru/show/",
  allRooms: "https://sunrise-hotel.ru/allrooms/",
  prices: "https://sunrise-hotel.ru/rooms-price/",
  food: "https://sunrise-hotel.ru/food/",
  animation: "https://sunrise-hotel.ru/animation/",
  photos: "https://sunrise-hotel.ru/photos/",
  book: "https://sunrise-hotel.ru/book/",
};

export const sunriseFacts: FactRecord[] = [
  { key: "brand", value: "Отель «Санрайз»", sourceUrl: official.home, checkedAt, status: "confirmed" },
  { key: "location", value: "г. Анапа, п. Витязево", sourceUrl: official.home, checkedAt, status: "confirmed" },
  { key: "address", value: "пр-д Александрийский, 15 «А»", sourceUrl: official.home, checkedAt, status: "confirmed" },
  { key: "free_phone", value: "8 800 777-28-07", sourceUrl: official.home, checkedAt, status: "confirmed" },
  { key: "mobile_phone", value: "+7 963 000-03-09", sourceUrl: official.book, checkedAt, status: "confirmed" },
  { key: "whatsapp", value: "+7 963 000-03-09", sourceUrl: official.home, checkedAt, status: "confirmed" },
  { key: "max", value: "Официальный канал MAX отеля", sourceUrl: "https://max.ru/u/f9LHodD0cOKCasyJ7P5ON7QY3I5JMnbvTzBJWbz25K1VjvHO1rCpTL_rfTc", checkedAt, status: "confirmed" },
  { key: "room_categories", value: "Пять категорий семейных номеров", sourceUrl: official.allRooms, checkedAt, status: "confirmed" },
  { key: "food", value: "Шведский стол, всё включено; завтрак, обед, ужин; две открытые зоны питания", sourceUrl: official.food, checkedAt, status: "confirmed" },
  { key: "pool", value: "Тёплый бассейн с детским отделением, гидромассажем, гейзером и водопадом", sourceUrl: "https://sunrise-hotel.ru/pool/", checkedAt, status: "confirmed" },
  { key: "pool_child_depth", value: "Глубина детского отделения указана по-разному", sourceUrl: official.animation, checkedAt, status: "conflict", note: "На страницах анимации и бассейна встречаются разные значения; в интерфейсе не показывается." },
  { key: "beach", value: "Собственный пляж отеля", sourceUrl: official.photos, checkedAt, status: "confirmed" },
  { key: "animation", value: "Детская анимация, игры и конкурсы; детское кино указано ежедневно вечером", sourceUrl: official.animation, checkedAt, status: "confirmed" },
  { key: "music_program", value: "Живая музыка, игры, конкурсы, бармен-шоу, файер-шоу и восточные танцы", sourceUrl: official.shows, checkedAt, status: "confirmed" },
  { key: "show_schedule", value: "Музыкальные вечера проходят 2–3 раза в неделю: вторник, суббота и воскресенье", sourceUrl: official.shows, checkedAt, status: "confirmed", note: "На сайте используется недельный формат программы." },
  { key: "prices", value: "На официальной странице опубликована таблица стоимости 2026; для периода 01.07–25.08 указаны значения по всем пяти категориям", sourceUrl: official.prices, checkedAt, status: "confirmed", note: "Цены отображаются как опубликованные значения таблицы." },
  { key: "booking", value: "Официальная форма заявки отеля", sourceUrl: official.book, checkedAt, status: "confirmed" },
];

export const sunriseConfig = {
  checkedAt,
  brand: {
    name: "Санрайз",
    descriptor: "Отель · Витязево",
    logo: "/assets/sunrise/brand/logo.png",
    logoUsable: false,
    logoNote: "Официальный файл — декоративный знак без читаемого названия; используется текстовый wordmark.",
  },
  contacts: [
    { label: "Бесплатная линия", value: "8 800 777-28-07", href: "tel:+78007772807", channel: "phone", confirmed: true },
    { label: "Мобильный телефон", value: "+7 963 000-03-09", href: "tel:+79630000309", channel: "phone", confirmed: true },
    { label: "WhatsApp", value: "+7 963 000-03-09", href: "https://wa.me/79630000309", channel: "whatsapp", confirmed: true },
    { label: "MAX", value: "Написать в MAX", href: "https://max.ru/u/f9LHodD0cOKCasyJ7P5ON7QY3I5JMnbvTzBJWbz25K1VjvHO1rCpTL_rfTc", channel: "max", confirmed: true },
  ] as Contact[],
  address: {
    value: "г. Анапа, п. Витязево, пр-д Александрийский, 15 «А»",
    sourceUrl: official.home,
    confirmed: true,
  },
  bookingUrl: official.book,
  officialLinks: official,
  showSchedule: {
    checkedAt,
    sourceUrl: official.shows,
    summary: "2–3 вечера в неделю",
    days: "вторник, суббота и воскресенье",
    note: "Недельный формат программы указан на официальной странице.",
  },
  showFormat: "По вторникам, субботам и воскресеньям — живая музыка, игры, конкурсы и анимация.",
  shows: [] as Show[],
  rooms: [
    {
      id: "double-balcony",
      name: "2-местный семейный с балконом",
      area: "20 м²",
      capacity: "2 основных и 1 дополнительное место",
      floors: "1–4 этаж",
      balcony: "Балкон",
      details: "Уютный номер для двух основных гостей",
      food: "Шведский стол · «всё включено»",
      conditions: "Тариф на период с 1 июля по 25 августа 2026 года",
      priceLabel: "12 800 ₽",
      pricePeriod: "01.07–25.08.2026",
      priceStatus: "confirmed",
      priceSource: official.prices,
      priceCheckedAt: checkedAt,
      photo: "/assets/sunrise/rooms/room-double.jpg",
      photoAlt: "Официальная фотография 2-местного семейного номера с балконом в отеле «Санрайз»",
      officialUrl: `${official.allRooms}#2mestnyj-semejnyj-balkon`,
      confirmed: true,
    },
    {
      id: "triple-balcony",
      name: "3-местный семейный с балконом",
      area: "22 м²",
      capacity: "3 основных и 1 дополнительное место",
      floors: "1–4 этаж",
      balcony: "Балкон",
      details: "Семейный номер для трёх основных гостей",
      food: "Шведский стол · «всё включено»",
      conditions: "Тариф на период с 1 июля по 25 августа 2026 года",
      priceLabel: "15 200 ₽",
      pricePeriod: "01.07–25.08.2026",
      priceStatus: "confirmed",
      priceSource: official.prices,
      priceCheckedAt: checkedAt,
      photo: "/assets/sunrise/rooms/room-triple.jpg",
      photoAlt: "Официальная фотография 3-местного семейного номера с балконом в отеле «Санрайз»",
      officialUrl: `${official.allRooms}#3mestnyj-semejnyj-balkon`,
      confirmed: true,
    },
    {
      id: "four-bed-balcony",
      name: "4-местный семейный с балконом",
      area: "24 м²",
      capacity: "4 основных и 1 дополнительное место",
      floors: "1–4 этаж",
      balcony: "Балкон",
      details: "Семейный номер для четырёх основных гостей",
      food: "Шведский стол · «всё включено»",
      conditions: "Тариф на период с 1 июля по 25 августа 2026 года",
      priceLabel: "19 200 ₽",
      pricePeriod: "01.07–25.08.2026",
      priceStatus: "confirmed",
      priceSource: official.prices,
      priceCheckedAt: checkedAt,
      photo: "/assets/sunrise/rooms/room-four.jpg",
      photoAlt: "Официальная фотография 4-местного семейного номера с балконом в отеле «Санрайз»",
      officialUrl: `${official.allRooms}#4mestnyj-semejnyj-balkon`,
      confirmed: true,
    },
    {
      id: "family",
      name: "2-комнатный семейный с балконом",
      area: "32 м²",
      capacity: "4 основных и 2 дополнительных места",
      floors: "2–3 этаж",
      balcony: "Балкон",
      details: "Две комнаты для семейного размещения",
      food: "Шведский стол · «всё включено»",
      conditions: "Тариф на период с 1 июля по 25 августа 2026 года",
      priceLabel: "20 800 ₽",
      pricePeriod: "01.07–25.08.2026",
      priceStatus: "confirmed",
      priceSource: official.prices,
      priceCheckedAt: checkedAt,
      photo: "/assets/sunrise/rooms/room-family.jpg",
      photoAlt: "Официальная фотография 2-комнатного семейного номера с балконом в отеле «Санрайз»",
      officialUrl: `${official.allRooms}#2-komnatnyj-semejnyj-balkon`,
      confirmed: true,
    },
    {
      id: "triple-no-balcony",
      name: "3-местный семейный без балкона",
      area: "20 м²",
      capacity: "3 основных места",
      floors: "1 этаж",
      balcony: "Без балкона",
      details: "Семейный номер без балкона",
      food: "Шведский стол · «всё включено»",
      conditions: "Тариф на период с 1 июля по 25 августа 2026 года",
      priceLabel: "15 200 ₽",
      pricePeriod: "01.07–25.08.2026",
      priceStatus: "confirmed",
      priceSource: official.prices,
      priceCheckedAt: checkedAt,
      photo: "/assets/sunrise/rooms/room-no-balcony.jpg",
      photoAlt: "Официальная фотография 3-местного семейного номера без балкона в отеле «Санрайз»",
      officialUrl: `${official.allRooms}#3mestnyj-semejnyj-bez-balkona`,
      confirmed: true,
    },
  ] as Room[],
  includedItems: [
    { eyebrow: "Питание", title: "Шведский стол", description: "Шведский стол и формат «всё включено»: завтрак, обед и ужин в двух открытых зонах питания.", icon: "01", sourceUrl: official.food, status: "confirmed", confirmed: true },
    { eyebrow: "Номера", title: "Семейные номера", description: "Пять семейных категорий с разной площадью, вместимостью, этажом и наличием балкона.", icon: "02", sourceUrl: official.allRooms, status: "confirmed", confirmed: true },
    { eyebrow: "Территория", title: "Тёплый бассейн и отдых", description: "Тёплый бассейн с детским отделением, гидромассажем, гейзером и водопадом.", icon: "03", sourceUrl: "https://sunrise-hotel.ru/pool/", status: "confirmed", confirmed: true },
    { eyebrow: "Вечер", title: "Музыка и анимация", description: "Живая музыка, игры, конкурсы и анимация по вторникам, субботам и воскресеньям.", icon: "04", sourceUrl: official.shows, status: "confirmed", confirmed: true },
    { eyebrow: "Пляж", title: "Собственный пляж", description: "Собственный пляж отеля — ещё один повод выйти из номера.", icon: "05", sourceUrl: official.photos, status: "confirmed", confirmed: true },
  ] as IncludedItem[],
  gallery: [
    { src: "/assets/sunrise/hero/evening.jpg?v=20260813", alt: "Официальная фотография вечерней программы «Санрайза»" },
    { src: "/assets/sunrise/shows/show-02.jpg?v=20260813", alt: "Официальная фотография шоу-программы «Санрайза»" },
    { src: "/assets/sunrise/pool/pool.jpg", alt: "Официальная фотография бассейна на территории «Санрайза»" },
    { src: "/assets/sunrise/territory/territory.jpg", alt: "Официальная фотография территории отеля «Санрайз»" },
    { src: "/assets/sunrise/food/food.jpg", alt: "Официальная фотография зоны питания «Санрайза»" },
    { src: "/assets/sunrise/beach/beach.jpg", alt: "Официальная фотография собственного пляжа «Санрайза»" },
  ],
} as const;
