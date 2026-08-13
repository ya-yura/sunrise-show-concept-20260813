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
  if (!value) return "Выберите дату";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
}

function formatDateRange(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return "Выберите даты проживания";
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
  const dateError = booking.checkIn && booking.checkOut && booking.checkOut <= booking.checkIn ? "Укажите выезд позже даты заезда." : "";
  const hasDates = Boolean(booking.checkIn && booking.checkOut && !dateError);
  const progressStep = !hasDates ? 2 : booking.adults < 1 ? 3 : !selectedRoom ? 4 : 5;
  const selectedProgram = selectedShow?.title ?? "Музыкальные вечера";
  const selectedType = selectedShow?.type ?? "Музыкальные вечера";
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
      "Здравствуйте! Планируем отдых в «Санрайзе» и хотим подобрать номер.",
      "",
      `Программа: ${selectedProgram}`,
      `Ритм вечера: ${selectedShow?.date ? formatDate(selectedShow.date) : "вторник, суббота или воскресенье"}`,
      `Заезд: ${booking.checkIn ? formatDate(booking.checkIn) : "не указан"}`,
      `Выезд: ${booking.checkOut ? formatDate(booking.checkOut) : "не указан"}`,
      `Гости: ${guests}`,
      `Номер: ${selectedRoom?.name ?? "номер не выбран"}`,
      `Пожелания к отдыху: ${booking.comment.trim() || "нет"}`,
    ].join("\n");
  }

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(buildRequestMessage());
      setCopied(true);
    } catch {
      setCopied(false);
      setFormError("Не удалось скопировать автоматически. Выделите текст и скопируйте его вручную.");
    }
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking.checkIn || !booking.checkOut || dateError) {
      setFormError("Укажите даты проживания: выезд должен быть позже заезда.");
      scrollToId("request");
      return;
    }
    if (!selectedRoom) {
      setFormError("Выберите номер — он попадёт в готовую заявку.");
      scrollToId("stay");
      return;
    }
    if (!booking.name.trim() || !booking.contact.trim()) {
      setFormError("Оставьте имя и телефон или мессенджер.");
      return;
    }
    track("request_submitted", { selected_program: selectedProgram, room_id: selectedRoom.id });
    setSubmitted(true);
    setCopied(false);
    setFormError("");
  }

  const faq = [
    { question: "Когда проходят музыкальные вечера?", answer: "По вторникам, субботам и воскресеньям. В программе — живая музыка, игры, конкурсы, бармен-шоу, файер-шоу и восточные танцы.", source: sunriseConfig.officialLinks.shows, status: "Официальная программа отеля" },
    { question: "Что будет вечером?", answer: "Живая музыка, игры, конкурсы, бармен-шоу, файер-шоу, восточные танцы и анимационные представления для взрослых.", source: sunriseConfig.officialLinks.shows, status: "Официальные материалы отеля" },
    { question: "Какие номера есть в отеле?", answer: "Пять семейных категорий: 2-, 3- и 4-местные номера с балконом, 2-комнатный номер с балконом и 3-местный номер без балкона.", source: sunriseConfig.officialLinks.allRooms, status: "Официальный номерной фонд" },
    { question: "Как устроено питание?", answer: "Шведский стол и «всё включено»: завтрак, обед и ужин в двух открытых зонах питания.", source: sunriseConfig.officialLinks.food, status: "Официальная информация о питании" },
    { question: "Что есть на территории?", answer: "Тёплый бассейн с детским отделением, гидромассажем, гейзером и водопадом, а также собственный пляж отеля.", source: "https://sunrise-hotel.ru/pool/", status: "Официальная информация о территории" },
    { question: "Сколько стоит номер?", answer: "Тарифы на период с 1 июля по 25 августа 2026 года:", source: sunriseConfig.officialLinks.prices, status: "Стоимость проживания · 2026" },
    { question: "Как оформить отдых?", answer: "Выберите даты и номер, оставьте контакт — страница соберёт готовый текст заявки. Его можно скопировать или открыть официальный канал отеля.", source: sunriseConfig.officialLinks.book, status: "Официальные каналы отеля" },
  ];

  return (
    <main className="sunrise-page">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Санрайз — начало страницы"><Brand /></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen((open) => !open)}><span>{menuOpen ? "Закрыть" : "Меню"}</span><i aria-hidden="true" /></button>
        <nav id="main-nav" className={`main-nav${menuOpen ? " main-nav-open" : ""}`} aria-label="Основная навигация">
          <a href="#calendar" onClick={() => setMenuOpen(false)}>Программа</a>
          <a href="#stay" onClick={() => setMenuOpen(false)}>Номера</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>Вопросы</a>
          <button type="button" className="nav-cta" onClick={beginRequest}>Выбрать даты <span aria-hidden="true">↗</span></button>
        </nav>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-image-wrap" aria-hidden="true"><LocalImage src={sunriseConfig.gallery[0].src} alt="" className="hero-image" /></div>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content page-width">
          <div className="hero-copy">
            <p className="hero-kicker"><span /> Витязево · семейный отдых</p>
            <h1>Музыкальные вечера<br />в <em>«Санрайзе»</em></h1>
            <p className="hero-lede">Море, семейный отдых и музыка в Витязево. Начните с дат — остальное соберём в одном запросе.</p>
            <div className="hero-actions"><button type="button" className="button button-primary" onClick={beginRequest}>Выбрать даты <span aria-hidden="true">↗</span></button><button type="button" className="button button-ghost" onClick={() => scrollToId("calendar")}>Узнать о программе <span aria-hidden="true">↓</span></button></div>
          </div>
          <aside className="hero-program-card" aria-label="Программа вечера">
            <div className="card-topline"><span className="live-dot" /> Каждую неделю</div>
            <p className="card-eyebrow">Ритм вечера</p>
            <h2>{sunriseConfig.showSchedule.summary}</h2>
            <p>По вторникам, субботам и воскресеньям — живая музыка, игры, конкурсы и анимация.</p>
            <button type="button" className="card-link" onClick={beginRequest}>Собрать отдых под свои даты <span aria-hidden="true">↗</span></button>
            <small className="checked-note">Музыкальные вечера по программе отеля</small>
          </aside>
        </div>
        <div className="hero-bottom page-width"><div className="scroll-note"><span className="scroll-line" /> Листайте к программе</div><div className="hero-fact"><span className="fact-number">01</span><span>Музыка<br />и вечера</span></div><div className="hero-fact"><span className="fact-number">02</span><span>Номера<br />для семьи</span></div><div className="hero-fact"><span className="fact-number">03</span><span>Пляж<br />и бассейн</span></div></div>
      </section>

      <section className="intro-band"><div className="page-width intro-grid"><p className="eyebrow">Ваш сценарий отдыха</p><div><h2>Приезжайте за морем.<br /><em>Оставайтесь ради вечера.</em></h2><p className="section-copy">Выберите даты, состав гостей и номер — и соберите поездку в один ясный маршрут.</p></div><div className="intro-note"><span>↘</span><p>От выбора<br />до готовой заявки</p></div></div></section>

      <section id="calendar" className="calendar-section section-dark page-width-section"><div className="page-width"><SectionIntro eyebrow="01 / Программа" title="Вечер начинается здесь" copy="Музыкальные вечера проходят 2–3 раза в неделю — по вторникам, субботам и воскресеньям. Выберите даты проживания и соберите свой план отдыха." light /><div className="calendar-toolbar"><div className="month-switcher" role="tablist" aria-label="Выбор месяца">{calendarMonths.map((month) => <button key={month.key} type="button" role="tab" aria-selected={calendarMonth === month.key} className={calendarMonth === month.key ? "active" : ""} onClick={() => setCalendarMonth(month.key)}>{month.shortLabel}</button>)}</div><p className="calendar-status"><span className="status-ring" /> Программа отеля</p></div>{confirmedShows.length > 0 ? <div className="show-grid">{confirmedShows.map((show) => <article className="show-card" key={show.id}><div className="show-card-image"><LocalImage src={show.image ?? sunriseConfig.gallery[1].src} alt={show.title} /></div><div className="show-card-body"><p className="eyebrow">{show.type}</p><h3>{show.title}</h3><p>{show.description}</p><div className="show-meta">{show.date ? formatDate(show.date) : "Вт · Сб · Вс"}{show.time ? ` · ${show.time}` : ""}</div><button type="button" className="text-button" onClick={() => chooseShow(show)}>Выбрать эту программу <span aria-hidden="true">↗</span></button></div></article>)}</div> : <div className="calendar-empty"><div className="calendar-orbit" aria-hidden="true"><span>♪</span><span>✦</span><span>◌</span></div><div className="empty-copy"><p className="eyebrow">Ритм недели · {selectedMonth?.label ?? "ближайший месяц"}</p><h3>Вечер, ради которого<br /><em>хочется остаться.</em></h3><p>По вторникам, субботам и воскресеньям — живая музыка, игры, конкурсы и анимация. Выберите даты проживания, чтобы собрать отдых под свою компанию.</p><div className="program-days" aria-label="Дни программы"><span>Вт</span><span>Сб</span><span>Вс</span></div><div className="empty-actions"><button type="button" className="button button-primary" onClick={beginRequest}>Собрать отдых под свои даты <span aria-hidden="true">↗</span></button><a className="source-link source-link-light" href={sunriseConfig.officialLinks.shows} target="_blank" rel="noreferrer">Посмотреть программу на сайте отеля ↗</a></div></div><div className="empty-side-note"><span className="quote-mark">«</span><p>Номер — это база.<br />Вечер — <em>то, что запомнится.</em></p></div></div>}<div className="calendar-facts"><span>Живая музыка</span><span>Игры и конкурсы</span><span>Анимационные шоу</span><span>Собственный пляж</span></div></div></section>

      <section id="program-detail" className="detail-section page-width-section"><div className="page-width detail-grid"><div className="detail-copy"><p className="eyebrow">02 / Настроение</p><h2>{selectedShow ? selectedShow.title : "От музыки до бассейна"}</h2><p className="section-copy">{selectedShow ? selectedShow.description : "Днём — море, бассейн и отдых. Вечером — живая музыка, игры и конкурсы по вторникам, субботам и воскресеньям."}</p><div className="detail-tags"><span>{selectedType}</span><span>{selectedShow?.date ? formatDate(selectedShow.date) : "Вт · Сб · Вс"}</span></div><div className="detail-list"><div><span>Вечером</span><p>{selectedShow?.known.join(" · ") ?? sunriseConfig.showFormat}</p></div><div><span>Днём</span><p>{selectedShow?.toClarify.join(" · ") ?? "Море, бассейн, собственный пляж, питание «всё включено» и номер для вашей компании."}</p></div></div><button type="button" className="button button-dark" onClick={beginRequest}>Выбрать даты и номер <span aria-hidden="true">↗</span></button></div><div className="detail-visual"><div className="detail-image"><LocalImage src={selectedShow?.image ?? sunriseConfig.gallery[1].src} alt={selectedShow?.title ?? "Официальная фотография шоу-программы «Санрайза»"} /><div className="detail-image-caption"><span>Санрайз</span><span>Витязево</span></div></div><div className="detail-stamp" aria-hidden="true">Здесь<br /><i>для</i><br />вашего<br /><strong>вечера</strong></div></div></div></section>

      <section id="request" className="request-section section-dark page-width-section"><div className="page-width"><SectionIntro eyebrow="03 / Ваши даты" title="Соберите отдых под себя" copy="Укажите заезд, гостей и пожелания. Следом выберите номер — и получите готовый текст заявки." light /><div className="request-layout"><div className="request-form-card"><div className="stepper" aria-label={`Шаг ${progressStep} из 5`}><div className={progressStep >= 1 ? "done" : ""}><span>01</span><small>Программа</small></div><i /><div className={progressStep >= 2 ? "done" : ""}><span>02</span><small>Даты проживания</small></div><i /><div className={progressStep >= 3 ? "done" : ""}><span>03</span><small>Гости</small></div><i /><div className={progressStep >= 4 ? "done" : ""}><span>04</span><small>Номер</small></div><i /><div className={progressStep >= 5 ? "done" : ""}><span>05</span><small>Заявка</small></div></div><div className="selected-context"><span className="context-icon">✦</span><div><span>Ваш вечер</span><strong>{selectedProgram}</strong><small>{selectedShow?.date ? formatDate(selectedShow.date) : "Вт · Сб · Вс"}</small></div><button type="button" onClick={() => scrollToId("calendar")}>Изменить</button></div><div className="fields-grid"><label><span>Заезд</span><input type="date" min={today} value={booking.checkIn} onChange={(event) => updateBooking("checkIn", event.target.value)} /></label><label><span>Выезд</span><input type="date" min={booking.checkIn || today} value={booking.checkOut} onChange={(event) => updateBooking("checkOut", event.target.value)} />{dateError ? <small className="field-error">{dateError}</small> : null}</label><label><span>Взрослые</span><select value={booking.adults} onChange={(event) => updateBooking("adults", Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} {guestLabel(value, "взрослый", "взрослых", "взрослых")}</option>)}</select></label><label><span>Дети</span><select value={booking.children} onChange={(event) => updateBooking("children", Number(event.target.value))}>{[0, 1, 2, 3, 4].map((value) => <option key={value} value={value}>{value} {guestLabel(value, "ребёнок", "ребёнка", "детей")}</option>)}</select></label></div><label className="full-field"><span>Пожелания к отдыху</span><textarea rows={3} placeholder="Например: хочется попасть на вечер с живой музыкой" value={booking.comment} onChange={(event) => updateBooking("comment", event.target.value)} /></label><button type="button" className="button button-primary button-wide" onClick={() => { track("dates_selected", { check_in: booking.checkIn, check_out: booking.checkOut }); continueRequest(); }}>{hasDates ? selectedRoom ? "Перейти к заявке" : "Выбрать номер" : "Продолжить"} <span aria-hidden="true">↓</span></button></div><aside className="request-summary" aria-live="polite"><p className="eyebrow">Ваш отдых</p><h3>Ваш<br /><em>отдых в «Санрайзе»</em></h3><div className="summary-line"><span>Программа</span><strong>{selectedProgram}</strong></div><div className="summary-line"><span>Даты</span><strong>{formatDateRange(booking.checkIn, booking.checkOut)}</strong></div><div className="summary-line"><span>Гости</span><strong>{booking.adults} {guestLabel(booking.adults, "взрослый", "взрослых", "взрослых")} · {booking.children} {guestLabel(booking.children, "ребёнок", "ребёнка", "детей")}</strong></div><div className="summary-line"><span>Номер</span><strong>{selectedRoom?.name ?? "Выберите номер"}</strong></div><div className="summary-note"><span>i</span><p>Все выбранные детали попадут в готовый текст заявки.</p></div></aside></div></div></section>

      <section id="stay" className="stay-section page-width-section"><div className="page-width"><SectionIntro eyebrow="04 / Номер" title="Место для своей компании" copy="Пять семейных категорий — с параметрами и тарифами на период с 1 июля по 25 августа 2026 года." /><div className="rooms-grid">{sunriseConfig.rooms.filter((room) => room.confirmed).map((room) => <article className={`room-card${selectedRoomId === room.id ? " room-card-selected" : ""}`} key={room.id}><div className="room-image-wrap"><LocalImage src={room.photo} alt={room.photoAlt} className="room-image" /><span className="room-availability">{selectedRoomId === room.id ? "Выбрано" : "Выбрать"}</span></div><div className="room-card-body"><div className="room-card-top"><span className="room-icon">{room.name.charAt(0)}</span><span className="room-area">{room.area}</span></div><h3>{room.name}</h3><p>{room.details}</p><div className="room-specs"><span>{room.capacity}</span><span>{room.balcony} · {room.floors}</span><span>{room.food}</span></div><div className="room-divider" /><span className="room-price">{room.priceLabel}</span><small>{room.conditions}</small><a className="source-link" href={room.officialUrl} target="_blank" rel="noreferrer">Параметры номера ↗</a><a className="source-link" href={room.priceSource} target="_blank" rel="noreferrer">Официальные тарифы ↗</a><button type="button" className={`text-button${selectedRoomId === room.id ? " text-button-selected" : ""}`} onClick={() => chooseRoom(room.id)}>{selectedRoomId === room.id ? "Выбрано — изменить" : "Выбрать этот номер"} <span aria-hidden="true">↗</span></button></div></article>)}</div></div></section>

      <section className="included-section section-soft page-width-section"><div className="page-width"><SectionIntro eyebrow="05 / На территории" title="Всё, что нужно для хорошего дня" copy="Шведский стол, семейные номера, бассейн, собственный пляж и вечерняя программа — собрали главное в одном месте." /><div className="included-grid">{sunriseConfig.includedItems.filter((item) => item.confirmed).map((item) => <article className="included-card" key={item.title}><span className="included-number">{item.icon}</span><p className="eyebrow">{item.eyebrow}</p><h3>{item.title}</h3><p>{item.description}</p><a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">Подробнее ↗</a></article>)}</div></div></section>

      <section className="atmosphere-section page-width-section"><div className="atmosphere-grid page-width"><div className="atmosphere-main"><LocalImage src={sunriseConfig.gallery[2].src} alt={sunriseConfig.gallery[2].alt} /><div className="atmosphere-overlay"><p className="eyebrow">После моря — к бассейну</p><h2>Днём — море.<br /><em>Вечером — «Санрайз».</em></h2></div></div><div className="atmosphere-side"><LocalImage src={sunriseConfig.gallery[5].src} alt={sunriseConfig.gallery[5].alt} /><div className="side-copy"><span className="quote-mark">«</span><p>Свет, музыка,<br />море рядом.<br /><em>Так выглядит отдых.</em></p></div></div></div></section>

      <section id="faq" className="faq-section page-width-section"><div className="page-width faq-layout"><SectionIntro eyebrow="06 / Если коротко" title="Всё важное — до поездки" copy="Программа, питание, номера, территория и тарифы — в одном месте." /><div className="faq-list">{faq.map((item, index) => <div className={`faq-item${activeFaq === index ? " faq-open" : ""}`} key={item.question}><button type="button" aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i aria-hidden="true">{activeFaq === index ? "−" : "+"}</i></button>{activeFaq === index ? <div className="faq-answer"><p className="faq-answer-intro">{item.answer}</p>{item.question === "Сколько стоит номер?" ? <div className="faq-price-table" aria-label="Тарифы на период с 1 июля по 25 августа 2026 года">{sunriseConfig.rooms.map((room) => <div className="faq-price-row" key={room.id}><span>{room.name}</span><strong>{room.priceLabel}</strong></div>)}</div> : null}<small>{item.status}</small><a href={item.source} target="_blank" rel="noreferrer">Официальная страница ↗</a></div> : null}</div>)}</div></div></section>

      <section id="final-request" className="final-request-section section-dark page-width-section"><div className="page-width final-request-grid"><div className="final-request-copy"><p className="eyebrow">07 / Ваша заявка</p><h2>Выберите даты.<br /><em>Остальное соберём.</em></h2><p>Укажите контакты — и получите готовый текст для официального канала отеля.</p><div className="contact-block">{sunriseConfig.contacts.filter((contact) => contact.confirmed).map((contact) => <a key={contact.label} href={contact.href} target={contact.channel === "phone" ? undefined : "_blank"} rel={contact.channel === "phone" ? undefined : "noreferrer"}><span>{contact.label}</span><strong>{contact.value}</strong></a>)}</div></div><form className="final-form" onSubmit={submitRequest} noValidate><div className="form-context-row"><span>Программа</span><strong>{selectedProgram}</strong></div><div className="form-context-row"><span>Ритм вечера</span><strong>{selectedShow?.date ? formatDate(selectedShow.date) : "Вт · Сб · Вс"}</strong></div><div className="form-context-row"><span>Заезд — выезд</span><strong>{formatDateRange(booking.checkIn, booking.checkOut)}</strong></div><div className="form-context-row"><span>Гости</span><strong>{booking.adults} {guestLabel(booking.adults, "взрослый", "взрослых", "взрослых")} · {booking.children} {guestLabel(booking.children, "ребёнок", "ребёнка", "детей")}</strong></div><div className="form-context-row"><span>Номер</span><strong>{selectedRoom?.name ?? "Выберите номер"}</strong></div><div className="form-fields"><label><span>Имя</span><input required value={booking.name} onChange={(event) => updateBooking("name", event.target.value)} placeholder="Ваше имя" /></label><label><span>Телефон или мессенджер</span><input required value={booking.contact} onChange={(event) => updateBooking("contact", event.target.value)} placeholder="+7 900 000-00-00" /></label><label className="full-field"><span>Пожелания к отдыху</span><textarea rows={3} value={booking.comment} onChange={(event) => updateBooking("comment", event.target.value)} placeholder="Что важно учесть в поездке" /></label></div>{formError ? <p className="form-error" role="alert">{formError}</p> : null}{submitted ? <div className="success-state" role="status"><span>✓</span><div><strong>Заявка готова</strong><p>Скопируйте текст или откройте официальный канал отеля.</p><textarea className="request-message" readOnly value={buildRequestMessage()} aria-label="Текст подготовленной заявки" /><div className="success-actions"><button type="button" className="button button-primary" onClick={copyRequest}>{copied ? "Скопировано" : "Скопировать текст"} <span aria-hidden="true">↗</span></button><a className="button button-outline-light" href={sunriseConfig.bookingUrl} target="_blank" rel="noreferrer">Открыть официальный сайт ↗</a></div></div></div> : <button type="submit" className="button button-primary button-wide">Собрать заявку <span aria-hidden="true">↗</span></button>}<small className="form-disclaimer">Сообщение не отправляется автоматически — вы сами выбираете удобный официальный канал.</small></form></div></section>

      <footer className="site-footer"><div className="page-width footer-grid"><div><a className="brand brand-footer" href="#top" aria-label="Санрайз — начало страницы"><Brand footer /></a><p>Море, семейный отдых и музыкальные вечера в Витязево.</p></div><div className="footer-address"><span>Адрес отеля</span><p>{sunriseConfig.address.value}</p><a href={sunriseConfig.officialLinks.home} target="_blank" rel="noreferrer">Официальный сайт ↗</a></div><div className="footer-links"><span>Связаться</span>{sunriseConfig.contacts.filter((contact) => contact.confirmed).map((contact) => <a key={contact.label} href={contact.href} target={contact.channel === "phone" ? undefined : "_blank"} rel={contact.channel === "phone" ? undefined : "noreferrer"}>{contact.label} · {contact.value} ↗</a>)}</div><div className="footer-links"><span>Об отеле</span><a href={sunriseConfig.officialLinks.shows} target="_blank" rel="noreferrer">Программа вечеров ↗</a><a href={sunriseConfig.officialLinks.allRooms} target="_blank" rel="noreferrer">Номера и условия ↗</a><a href={sunriseConfig.officialLinks.book} target="_blank" rel="noreferrer">Забронировать на сайте ↗</a></div></div><div className="page-width footer-bottom"><span>© «Санрайз», Витязево</span><span>Программа, тарифы и условия — по официальным материалам отеля.</span></div></footer>
      <button type="button" className="mobile-sticky-cta" onClick={continueRequest}>{selectedRoom ? "Перейти к заявке" : "Выбрать даты"} <span aria-hidden="true">↗</span></button>
    </main>
  );
}
