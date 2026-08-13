"use client";
/* eslint-disable @next/next/no-img-element -- local official files need an explicit fallback handler. */

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { sunriseConfig, type Show } from "../src/data/sunrise";

type BookingState = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  name: string;
  contact: string;
  comment: string;
};

const initialBooking: BookingState = {
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
  name: "",
  contact: "",
  comment: "",
};

function track(event: string, payload: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("sunrise-analytics", {
      detail: { event, payload, timestamp: new Date().toISOString() },
    }),
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatDate(value: string) {
  if (!value) return "Дата не выбрана";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
}

function formatDateRange(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return "Период проживания не выбран";
  return `${formatDate(checkIn)} — ${formatDate(checkOut)}`;
}

function guestLabel(value: number, one: string, few: string, many: string) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  light = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-intro${light ? " section-intro-light" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p className="section-copy">{copy}</p> : null}
    </div>
  );
}

function LocalImage({
  src,
  alt,
  className = "",
  fallbackSrc = sunriseConfig.gallery[1].src,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const [failedFallbackSource, setFailedFallbackSource] = useState<string | null>(null);
  const currentSrc = failedSource === src ? (failedFallbackSource === src ? null : fallbackSrc) : src;

  if (!currentSrc) {
    return <div className={`local-image-fallback ${className}`} role="img" aria-label={alt}><span>{alt}</span></div>;
  }

  return (
    <img
      className={className}
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (currentSrc === src) {
          setFailedSource(src);
        } else {
          if (process.env.NODE_ENV === "development") console.warn(`Image failed: ${src}`);
          setFailedFallbackSource(src);
        }
      }}
    />
  );
}

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`brand-lockup${footer ? " brand-lockup-footer" : ""}`}>
      <span className="brand-wordmark">Санрайз</span>
      <span className="brand-descriptor">Отель · Витязево</span>
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);
  const [booking, setBooking] = useState(initialBooking);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const calendarMonths = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    return Array.from({ length: 5 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        label: new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date),
        shortLabel: new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date),
      };
    });
  }, []);

  const confirmedShows = useMemo(
    () => sunriseConfig.shows.filter((show) => show.confirmed && Boolean(show.date) && (show.date ?? "") >= today && (show.date ?? "").slice(0, 7) === calendarMonth),
    [calendarMonth, today],
  );
  const selectedRoom = sunriseConfig.rooms.find((room) => room.id === selectedRoomId);
  const dateError = booking.checkIn && booking.checkOut && booking.checkOut <= booking.checkIn ? "Дата выезда должна быть позже даты заезда." : "";
  const hasDates = Boolean(booking.checkIn && booking.checkOut && !dateError);
  const progressStep = !hasDates ? 2 : booking.adults < 1 ? 3 : !selectedRoom ? 4 : 5;
  const selectedProgram = selectedShow?.title ?? "Музыкальные вечера";
  const selectedType = selectedShow?.type ?? "Музыкальные вечера и шоу";
  const selectedMonth = calendarMonths.find((month) => month.key === calendarMonth);

  useEffect(() => {
    if (calendarMonth) track("calendar_view", { month: calendarMonth });
  }, [calendarMonth]);

  function updateBooking<K extends keyof BookingState>(field: K, value: BookingState[K]) {
    setBooking((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
    setCopied(false);
    setFormError("");
  }

  function chooseShow(show: Show) {
    setSelectedShow(show);
    setSubmitted(false);
    track("show_selected", { show_id: show.id, title: show.title });
    scrollToId("program-detail");
  }

  function chooseRoom(roomId: string) {
    setSelectedRoomId(roomId);
    setSubmitted(false);
    setFormError("");
    track("room_selected", { room_id: roomId });
    scrollToId("request");
  }

  function beginRequest() {
    track("request_started", { selected_program: selectedProgram });
    scrollToId("request");
  }

  function continueRequest() {
    if (!hasDates) {
      scrollToId("request");
      return;
    }
    if (!selectedRoom) {
      scrollToId("stay");
      return;
    }
    scrollToId("final-request");
  }

  function buildRequestMessage() {
    const guests = `${booking.adults} ${guestLabel(booking.adults, "взрослый", "взрослых", "взрослых")} · ${booking.children} ${guestLabel(booking.children, "ребёнок", "ребёнка", "детей")}`;
    return [
      "Здравствуйте! Хотим оформить отдых в «Санрайзе».",
      "",
      `Программа: ${selectedProgram}`,
      `Дата программы: ${selectedShow?.date ? formatDate(selectedShow.date) : "вторник, суббота или воскресенье"}`,
      `Заезд: ${booking.checkIn ? formatDate(booking.checkIn) : "не указан"}`,
      `Выезд: ${booking.checkOut ? formatDate(booking.checkOut) : "не указан"}`,
      `Гости: ${guests}`,
      `Номер: ${selectedRoom?.name ?? "категория не выбрана"}`,
      `Комментарий: ${booking.comment.trim() || "нет"}`,
    ].join("\n");
  }

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(buildRequestMessage());
      setCopied(true);
    } catch {
      setCopied(false);
      setFormError("Не удалось скопировать автоматически. Выделите текст заявки и скопируйте его вручную.");
    }
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking.checkIn || !booking.checkOut || dateError) {
      setFormError("Выберите корректные даты проживания, чтобы сформировать заявку.");
      scrollToId("request");
      return;
    }
    if (!selectedRoom) {
      setFormError("Выберите категорию номера — она попадёт в запрос сотруднику.");
      scrollToId("stay");
      return;
    }
    if (!booking.name.trim() || !booking.contact.trim()) {
      setFormError("Добавьте имя и телефон или мессенджер для связи.");
      return;
    }
    track("request_submitted", { selected_program: selectedProgram, room_id: selectedRoom.id });
    setSubmitted(true);
    setCopied(false);
    setFormError("");
  }

  const faq = [
    { question: "Какая программа в отеле?", answer: "Музыкальные вечера проходят 2–3 раза в неделю: по вторникам, субботам и воскресеньям. В программе — живая музыка, игры, конкурсы, бармен-шоу, файер-шоу и восточные танцы.", source: sunriseConfig.officialLinks.shows, status: "Опубликовано на сайте отеля · 13.08.2026" },
    { question: "Что входит в музыкальную программу?", answer: "Живая музыка, игры, конкурсы, бармен-шоу, файер-шоу, восточные танцы и анимационные представления для взрослых.", source: sunriseConfig.officialLinks.shows, status: "Опубликовано на сайте отеля · 13.08.2026" },
    { question: "Какие номера доступны в каталоге?", answer: "В номерном фонде опубликованы пять семейных категорий: 2местный, 3местный и 4местный с балконом, 2-комнатный семейный с балконом и 3местный семейный без балкона.", source: sunriseConfig.officialLinks.allRooms, status: "Категории опубликованы · 13.08.2026" },
    { question: "Что входит в питание?", answer: "Шведский стол, «всё включено», завтрак, обед и ужин, а также две открытые зоны питания.", source: sunriseConfig.officialLinks.food, status: "Опубликовано на сайте отеля · 13.08.2026" },
    { question: "Есть ли бассейн и пляж?", answer: "На территории есть тёплый бассейн с детским отделением, гидромассажем, гейзером и водопадом. У отеля есть собственный пляж.", source: "https://sunrise-hotel.ru/pool/", status: "Бассейн и пляж указаны на официальном сайте" },
    { question: "Показываются ли цены?", answer: "Да. В таблице 2026 для периода 01.07–25.08 указаны: 2местный — 12 800 ₽, 3местный — 15 200 ₽, 4местный — 19 200 ₽, 2-комнатный — 20 800 ₽, 3местный без балкона — 15 200 ₽.", source: sunriseConfig.officialLinks.prices, status: "Опубликовано на странице стоимости · 13.08.2026" },
    { question: "Как оформить заявку?", answer: "Выберите даты и категорию номера, укажите контакт и скопируйте готовый текст сообщения. Ниже доступны официальный сайт, телефон, WhatsApp и MAX отеля.", source: sunriseConfig.officialLinks.book, status: "Официальные каналы опубликованы · 13.08.2026" },
  ];

  return (
    <main className="sunrise-page">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Санрайз — начало страницы"><Brand /></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen((open) => !open)}><span>{menuOpen ? "Закрыть" : "Меню"}</span><i aria-hidden="true" /></button>
        <nav id="main-nav" className={`main-nav${menuOpen ? " main-nav-open" : ""}`} aria-label="Основная навигация">
          <a href="#calendar" onClick={() => setMenuOpen(false)}>Календарь шоу</a>
          <a href="#stay" onClick={() => setMenuOpen(false)}>Проживание</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>Вопросы</a>
          <button type="button" className="nav-cta" onClick={beginRequest}>Выбрать даты <span aria-hidden="true">↗</span></button>
        </nav>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-image-wrap" aria-hidden="true"><LocalImage src={sunriseConfig.gallery[0].src} alt="" className="hero-image" /></div>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content page-width">
          <div className="hero-copy">
            <p className="hero-kicker"><span /> Витязево · вечерняя программа</p>
            <h1>Музыкальные вечера и шоу в <em>«Санрайзе»</em></h1>
            <p className="hero-lede">Подберите даты проживания под программу и оставьте один понятный запрос.</p>
            <div className="hero-actions"><button type="button" className="button button-primary" onClick={beginRequest}>Выбрать даты проживания <span aria-hidden="true">↗</span></button><button type="button" className="button button-ghost" onClick={() => scrollToId("calendar")}>Посмотреть календарь шоу <span aria-hidden="true">↓</span></button></div>
          </div>
          <aside className="hero-program-card" aria-label="Расписание шоу">
            <div className="card-topline"><span className="live-dot" /> Статус расписания</div>
            <p className="card-eyebrow">Ритм программы</p>
            <h2>{sunriseConfig.showSchedule.summary}</h2>
            <p>{sunriseConfig.showSchedule.days}. Музыкальные вечера, игры, конкурсы и анимационные шоу.</p>
            <button type="button" className="card-link" onClick={beginRequest}>Указать даты проживания <span aria-hidden="true">↗</span></button>
            <small className="checked-note">Опубликовано на сайте отеля · 13 августа 2026</small>
          </aside>
        </div>
        <div className="hero-bottom page-width"><div className="scroll-note"><span className="scroll-line" /> Листайте к программе</div><div className="hero-fact"><span className="fact-number">01</span><span>Музыка<br />и шоу</span></div><div className="hero-fact"><span className="fact-number">02</span><span>Даты<br />под заезд</span></div><div className="hero-fact"><span className="fact-number">03</span><span>Заявка<br />без лишнего</span></div></div>
      </section>

      <section className="intro-band"><div className="page-width intro-grid"><p className="eyebrow">Как это работает</p><div><h2>Сначала — настроение.<br /><em>Потом — даты.</em></h2><p className="section-copy">Выберите даты проживания, гостей и номер — сайт соберёт готовую заявку с программой и тарифом.</p></div><div className="intro-note"><span>↘</span><p>Один запрос<br />с понятным контекстом</p></div></div></section>

      <section id="calendar" className="calendar-section section-dark page-width-section"><div className="page-width"><SectionIntro eyebrow="01 / Программа" title="Музыкальные вечера" copy="Формат программы опубликован на сайте отеля: музыкальные вечера проходят 2–3 раза в неделю — по вторникам, субботам и воскресеньям." light /><div className="calendar-toolbar"><div className="month-switcher" role="tablist" aria-label="Выбор месяца">{calendarMonths.map((month) => <button key={month.key} type="button" role="tab" aria-selected={calendarMonth === month.key} className={calendarMonth === month.key ? "active" : ""} onClick={() => setCalendarMonth(month.key)}>{month.shortLabel}</button>)}</div><p className="calendar-status"><span className="status-ring" /> Опубликовано 13 августа 2026</p></div>{confirmedShows.length > 0 ? <div className="show-grid">{confirmedShows.map((show) => <article className="show-card" key={show.id}><div className="show-card-image"><LocalImage src={show.image ?? sunriseConfig.gallery[1].src} alt={show.title} /></div><div className="show-card-body"><p className="eyebrow">{show.type}</p><h3>{show.title}</h3><p>{show.description}</p><div className="show-meta">{show.date ? formatDate(show.date) : "Вт · Сб · Вс"}{show.time ? ` · ${show.time}` : ""}</div><button type="button" className="text-button" onClick={() => chooseShow(show)}>Выбрать эту программу <span aria-hidden="true">↗</span></button></div></article>)}</div> : <div className="calendar-empty"><div className="calendar-orbit" aria-hidden="true"><span>♪</span><span>✦</span><span>◌</span></div><div className="empty-copy"><p className="eyebrow">{selectedMonth?.label ?? "Ближайший месяц"} · формат программы</p><h3>Музыкальные вечера — 2–3 раза в неделю</h3><p>По опубликованному недельному формату программа проходит по вторникам, субботам и воскресеньям. В программе — живая музыка, игры, конкурсы и анимационные шоу.</p><div className="program-days" aria-label="Дни программы"><span>Вт</span><span>Сб</span><span>Вс</span></div><div className="empty-actions"><button type="button" className="button button-primary" onClick={beginRequest}>Собрать заявку на мои даты <span aria-hidden="true">↗</span></button><a className="source-link source-link-light" href={sunriseConfig.officialLinks.shows} target="_blank" rel="noreferrer">Открыть официальный раздел шоу ↗</a></div></div><div className="empty-side-note"><span className="quote-mark">“</span><p>Вы выбираете<br />не просто номер,<br /><em>а повод приехать.</em></p></div></div>}<div className="calendar-facts"><span>Живая музыка</span><span>Игры и конкурсы</span><span>Анимационные шоу</span><span>На территории отеля</span></div></div></section>

      <section id="program-detail" className="detail-section page-width-section"><div className="page-width detail-grid"><div className="detail-copy"><p className="eyebrow">02 / Выбранная программа</p><h2>{selectedShow ? selectedShow.title : "Программа под ваш заезд"}</h2><p className="section-copy">{selectedShow ? selectedShow.description : "Музыкальные вечера проходят по вторникам, субботам и воскресеньям. Выберите даты проживания, чтобы подготовить заявку на отдых."}</p><div className="detail-tags"><span>{selectedType}</span><span>{selectedShow?.date ? formatDate(selectedShow.date) : "Вт · Сб · Вс"}</span></div><div className="detail-list"><div><span>В программе</span><p>{selectedShow?.known.join(" · ") ?? sunriseConfig.showFormat}</p></div><div><span>Ваши условия</span><p>{selectedShow?.toClarify.join(" · ") ?? "Даты проживания, гости и выбранная категория номера."}</p></div></div><button type="button" className="button button-dark" onClick={beginRequest}>Перейти к выбору проживания <span aria-hidden="true">↗</span></button></div><div className="detail-visual"><div className="detail-image"><LocalImage src={selectedShow?.image ?? sunriseConfig.gallery[1].src} alt={selectedShow?.title ?? "Официальная фотография шоу-программы «Санрайза»"} /><div className="detail-image-caption"><span>Санрайз</span><span>Витязево</span></div></div><div className="detail-stamp" aria-hidden="true">stay<br /><i>for</i><br />the<br /><strong>evening</strong></div></div></div></section>

      <section id="request" className="request-section section-dark page-width-section"><div className="page-width"><SectionIntro eyebrow="03 / Даты и гости" title="Соберите заявку на отдых" copy="Выберите даты проживания и состав гостей, затем укажите номер — все данные попадут в готовый текст заявки." light /><div className="request-layout"><div className="request-form-card"><div className="stepper" aria-label={`Шаг ${progressStep} из 5`}><div className={progressStep >= 1 ? "done" : ""}><span>01</span><small>Программа</small></div><i /><div className={progressStep >= 2 ? "done" : ""}><span>02</span><small>Даты проживания</small></div><i /><div className={progressStep >= 3 ? "done" : ""}><span>03</span><small>Гости</small></div><i /><div className={progressStep >= 4 ? "done" : ""}><span>04</span><small>Номер</small></div><i /><div className={progressStep >= 5 ? "done" : ""}><span>05</span><small>Заявка</small></div></div><div className="selected-context"><span className="context-icon">✦</span><div><span>Выбранная программа</span><strong>{selectedProgram}</strong><small>{selectedShow?.date ? formatDate(selectedShow.date) : "Вт · Сб · Вс"}</small></div><button type="button" onClick={() => scrollToId("calendar")}>Изменить</button></div><div className="fields-grid"><label><span>Дата заезда</span><input type="date" min={today} value={booking.checkIn} onChange={(event) => updateBooking("checkIn", event.target.value)} /></label><label><span>Дата выезда</span><input type="date" min={booking.checkIn || today} value={booking.checkOut} onChange={(event) => updateBooking("checkOut", event.target.value)} />{dateError ? <small className="field-error">{dateError}</small> : null}</label><label><span>Взрослые</span><select value={booking.adults} onChange={(event) => updateBooking("adults", Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} {guestLabel(value, "взрослый", "взрослых", "взрослых")}</option>)}</select></label><label><span>Дети</span><select value={booking.children} onChange={(event) => updateBooking("children", Number(event.target.value))}>{[0, 1, 2, 3, 4].map((value) => <option key={value} value={value}>{value} {guestLabel(value, "ребёнок", "ребёнка", "детей")}</option>)}</select></label></div><label className="full-field"><span>Пожелания к заезду</span><textarea rows={3} placeholder="Например, хочется попасть на вечер с живой музыкой" value={booking.comment} onChange={(event) => updateBooking("comment", event.target.value)} /></label><button type="button" className="button button-primary button-wide" onClick={() => { track("dates_selected", { check_in: booking.checkIn, check_out: booking.checkOut }); continueRequest(); }}>{hasDates ? selectedRoom ? "Перейти к заявке" : "Выбрать номер" : "Сохранить даты"} <span aria-hidden="true">↓</span></button></div><aside className="request-summary" aria-live="polite"><p className="eyebrow">Ваш запрос</p><h3>Ваша<br /><em>заявка на отдых</em></h3><div className="summary-line"><span>Программа</span><strong>{selectedProgram}</strong></div><div className="summary-line"><span>Период проживания</span><strong>{formatDateRange(booking.checkIn, booking.checkOut)}</strong></div><div className="summary-line"><span>Гости</span><strong>{booking.adults} {guestLabel(booking.adults, "взрослый", "взрослых", "взрослых")} · {booking.children} {guestLabel(booking.children, "ребёнок", "ребёнка", "детей")}</strong></div><div className="summary-line"><span>Номер</span><strong>{selectedRoom?.name ?? "Категория не выбрана"}</strong></div><div className="summary-note"><span>i</span><p>Готовый текст заявки можно скопировать или передать в официальный канал отеля.</p></div></aside></div></div></section>

      <section id="stay" className="stay-section page-width-section"><div className="page-width"><SectionIntro eyebrow="04 / Номер" title="Выберите вариант проживания" copy="Карточки содержат опубликованные названия, параметры и стоимость на период 01.07–25.08.2026." /><div className="rooms-grid">{sunriseConfig.rooms.filter((room) => room.confirmed).map((room) => <article className={`room-card${selectedRoomId === room.id ? " room-card-selected" : ""}`} key={room.id}><div className="room-image-wrap"><LocalImage src={room.photo} alt={room.photoAlt} className="room-image" /><span className="room-availability">{selectedRoomId === room.id ? "Выбрано" : "Выбрать"}</span></div><div className="room-card-body"><div className="room-card-top"><span className="room-icon">{room.name.charAt(0)}</span><span className="room-area">{room.area}</span></div><h3>{room.name}</h3><p>{room.details}</p><div className="room-specs"><span>{room.capacity}</span><span>{room.balcony} · {room.floors}</span><span>{room.food}</span></div><div className="room-divider" /><span className="room-price">{room.priceLabel}</span><small>{room.conditions} · опубликовано {room.priceCheckedAt}</small><a className="source-link" href={room.officialUrl} target="_blank" rel="noreferrer">Описание на сайте отеля ↗</a><a className="source-link" href={room.priceSource} target="_blank" rel="noreferrer">Стоимость на сайте отеля ↗</a><button type="button" className={`text-button${selectedRoomId === room.id ? " text-button-selected" : ""}`} onClick={() => chooseRoom(room.id)}>{selectedRoomId === room.id ? "Выбрано · изменить" : "Выбрать номер"} <span aria-hidden="true">↗</span></button></div></article>)}</div></div></section>

      <section className="included-section section-soft page-width-section"><div className="page-width"><SectionIntro eyebrow="05 / Условия" title="Что входит в отдых" copy="Питание, номер, бассейн, пляж и вечерняя программа — по опубликованным материалам отеля." /><div className="included-grid">{sunriseConfig.includedItems.filter((item) => item.confirmed).map((item) => <article className="included-card" key={item.title}><span className="included-number">{item.icon}</span><p className="eyebrow">{item.eyebrow}</p><h3>{item.title}</h3><p>{item.description}</p><a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">Источник ↗</a></article>)}</div></div></section>

      <section className="atmosphere-section page-width-section"><div className="atmosphere-grid page-width"><div className="atmosphere-main"><LocalImage src={sunriseConfig.gallery[2].src} alt={sunriseConfig.gallery[2].alt} /><div className="atmosphere-overlay"><p className="eyebrow">Территория и бассейн</p><h2>Когда отпуск<br /><em>звучит иначе.</em></h2></div></div><div className="atmosphere-side"><LocalImage src={sunriseConfig.gallery[5].src} alt={sunriseConfig.gallery[5].alt} /><div className="side-copy"><span className="quote-mark">“</span><p>Мягкий свет.<br />Живая музыка.<br /><em>Ваши даты.</em></p></div></div></div></section>

      <section id="faq" className="faq-section page-width-section"><div className="page-width faq-layout"><SectionIntro eyebrow="06 / Вопросы" title="Понятно до заезда" copy="Собрали в одном месте программу, питание, номерной фонд, бассейн, пляж и опубликованные тарифы." /><div className="faq-list">{faq.map((item, index) => <div className={`faq-item${activeFaq === index ? " faq-open" : ""}`} key={item.question}><button type="button" aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i aria-hidden="true">{activeFaq === index ? "−" : "+"}</i></button>{activeFaq === index ? <div className="faq-answer"><p>{item.answer}</p><small>{item.status}</small><a href={item.source} target="_blank" rel="noreferrer">Открыть источник ↗</a></div> : null}</div>)}</div></div></section>

      <section id="final-request" className="final-request-section section-dark page-width-section"><div className="page-width final-request-grid"><div className="final-request-copy"><p className="eyebrow">07 / Заявка</p><h2>Готовая заявка на отдых <em>в «Санрайзе»</em></h2><p>Выберите даты, гостей и номер. Сайт соберёт готовое сообщение для официального канала отеля.</p><div className="contact-block">{sunriseConfig.contacts.filter((contact) => contact.confirmed).map((contact) => <a key={contact.label} href={contact.href} target={contact.channel === "phone" ? undefined : "_blank"} rel={contact.channel === "phone" ? undefined : "noreferrer"}><span>{contact.label}</span><strong>{contact.value}</strong></a>)}</div></div><form className="final-form" onSubmit={submitRequest} noValidate><div className="form-context-row"><span>Программа</span><strong>{selectedProgram}</strong></div><div className="form-context-row"><span>Дата программы</span><strong>{selectedShow?.date ? formatDate(selectedShow.date) : "Вт · Сб · Вс"}</strong></div><div className="form-context-row"><span>Заезд / выезд</span><strong>{formatDateRange(booking.checkIn, booking.checkOut)}</strong></div><div className="form-context-row"><span>Гости</span><strong>{booking.adults} {guestLabel(booking.adults, "взрослый", "взрослых", "взрослых")} · {booking.children} {guestLabel(booking.children, "ребёнок", "ребёнка", "детей")}</strong></div><div className="form-context-row"><span>Номер</span><strong>{selectedRoom?.name ?? "Категория не выбрана"}</strong></div><div className="form-fields"><label><span>Ваше имя</span><input required value={booking.name} onChange={(event) => updateBooking("name", event.target.value)} placeholder="Как к вам обращаться" /></label><label><span>Телефон или мессенджер</span><input required value={booking.contact} onChange={(event) => updateBooking("contact", event.target.value)} placeholder="+7 900 000-00-00" /></label><label className="full-field"><span>Комментарий</span><textarea rows={3} value={booking.comment} onChange={(event) => updateBooking("comment", event.target.value)} placeholder="Что важно учесть в поездке" /></label></div>{formError ? <p className="form-error" role="alert">{formError}</p> : null}{submitted ? <div className="success-state" role="status"><span>✓</span><div><strong>Запрос подготовлен</strong><p>Скопируйте готовое сообщение или откройте официальный канал отеля.</p><textarea className="request-message" readOnly value={buildRequestMessage()} aria-label="Текст подготовленной заявки" /><div className="success-actions"><button type="button" className="button button-primary" onClick={copyRequest}>{copied ? "Скопировано" : "Скопировать текст"} <span aria-hidden="true">↗</span></button><a className="button button-outline-light" href={sunriseConfig.bookingUrl} target="_blank" rel="noreferrer">Открыть официальный сайт ↗</a></div></div></div> : <button type="submit" className="button button-primary button-wide">Подготовить запрос <span aria-hidden="true">↗</span></button>}<small className="form-disclaimer">Сайт не отправляет сообщение автоматически: скопируйте готовый текст или откройте официальный канал отеля.</small></form></div></section>

      <footer className="site-footer"><div className="page-width footer-grid"><div><a className="brand brand-footer" href="#top" aria-label="Санрайз — начало страницы"><Brand footer /></a><p>Музыкальные вечера, проживание и один понятный запрос под ваши даты.</p></div><div className="footer-address"><span>Адрес</span><p>{sunriseConfig.address.value}</p><a href={sunriseConfig.officialLinks.home} target="_blank" rel="noreferrer">Официальный сайт ↗</a></div><div className="footer-links"><span>Связь</span>{sunriseConfig.contacts.filter((contact) => contact.confirmed).map((contact) => <a key={contact.label} href={contact.href} target={contact.channel === "phone" ? undefined : "_blank"} rel={contact.channel === "phone" ? undefined : "noreferrer"}>{contact.label} · {contact.value} ↗</a>)}</div><div className="footer-links"><span>Разделы отеля</span><a href={sunriseConfig.officialLinks.shows} target="_blank" rel="noreferrer">Шоу-программы ↗</a><a href={sunriseConfig.officialLinks.allRooms} target="_blank" rel="noreferrer">Номерной фонд ↗</a><a href={sunriseConfig.officialLinks.book} target="_blank" rel="noreferrer">Официальная заявка ↗</a></div></div><div className="page-width footer-bottom"><span>© «Санрайз», Витязево</span><span>Расписание, стоимость и условия указаны по официальным материалам отеля.</span></div></footer>
      <button type="button" className="mobile-sticky-cta" onClick={continueRequest}>{selectedRoom ? "Перейти к заявке" : "Выбрать даты"} <span aria-hidden="true">↗</span></button>
    </main>
  );
}
