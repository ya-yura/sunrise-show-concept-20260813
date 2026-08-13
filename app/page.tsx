"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { sunriseConfig, type Show } from "../src/data/sunrise";

const months = ["Июнь", "Июль", "Август", "Сентябрь"];

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
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T12:00:00`));
}

function formatDateRange(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return "Период проживания не выбран";
  return `${formatDate(checkIn)} — ${formatDate(checkOut)}`;
}

function confirmedShowsForMonth(shows: Show[], month: string) {
  return shows.filter((show) => show.confirmed && (!show.date || show.date.includes(month)));
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

function OfficialImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(2);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [activeFaq, setActiveFaq] = useState(0);
  const [booking, setBooking] = useState(initialBooking);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const confirmedShows = useMemo(
    () => confirmedShowsForMonth(sunriseConfig.shows, months[calendarMonth]),
    [calendarMonth],
  );
  const dateError =
    booking.checkIn && booking.checkOut && booking.checkOut <= booking.checkIn
      ? "Дата выезда должна быть позже даты заезда."
      : "";
  const hasDates = Boolean(booking.checkIn && booking.checkOut && !dateError);
  const progressStep = !booking.checkIn ? 2 : !booking.checkOut ? 3 : hasDates ? 6 : 3;
  const today = new Date().toISOString().slice(0, 10);
  const selectedProgram = selectedShow?.title ?? "Программа на даты проживания";
  const selectedType = selectedShow?.type ?? "Музыкальные вечера и шоу";

  useEffect(() => {
    track("calendar_view", { month: months[calendarMonth] });
  }, [calendarMonth]);

  function updateBooking<K extends keyof BookingState>(field: K, value: BookingState[K]) {
    setBooking((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
    setFormError("");
  }

  function chooseShow(show: Show) {
    setSelectedShow(show);
    track("show_selected", { show_id: show.id, title: show.title });
    scrollToId("program-detail");
  }

  function beginRequest() {
    track("request_started", { selected_program: selectedProgram });
    scrollToId("request");
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking.checkIn || !booking.checkOut || dateError) {
      setFormError("Укажите корректные даты проживания, чтобы проверить программу.");
      scrollToId("request");
      return;
    }
    if (!booking.name.trim() || !booking.contact.trim()) {
      setFormError("Добавьте имя и телефон или WhatsApp — так сотрудник сможет связаться с вами.");
      return;
    }
    track("dates_selected", {
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      adults: booking.adults,
      children: booking.children,
    });
    track("request_submitted", { selected_program: selectedProgram });
    setSubmitted(true);
    setFormError("");
  }

  const faq = [
    {
      question: "Как узнать программу на мои даты?",
      answer:
        "Оставьте период проживания в форме. Сотрудник «Санрайза» проверит, какая программа заявлена на эти даты, и уточнит детали.",
    },
    {
      question: "Можно ли выбрать заезд под конкретное шоу?",
      answer:
        "Да, если дата программы уже опубликована. Сейчас ближайшие даты на официальной странице не указаны, поэтому запрос поможет проверить подходящий период.",
    },
    {
      question: "Что входит в предложение?",
      answer:
        "Состав зависит от выбранных дат. На официальном сайте подтверждены музыкальные и анимационные программы, а также варианты проживания с питанием; актуальные условия уточняются при заявке.",
    },
    {
      question: "Как проверяется доступность проживания?",
      answer:
        "Заявка не заменяет подтверждённое бронирование. Сотрудник уточняет наличие и подходящий вариант размещения для указанного периода.",
    },
    {
      question: "Можно ли оставить заявку, если даты программы ещё не опубликованы?",
      answer:
        "Да. Укажите даты проживания и пожелания — сотрудник проверит программу специально под ваш заезд.",
    },
  ];

  return (
    <main className="sunrise-page">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Санрайз — начало страницы">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>
            <strong>Санрайз</strong>
            <small>Отель · Витязево</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Закрыть" : "Меню"}</span>
          <i aria-hidden="true" />
        </button>
        <nav id="main-nav" className={`main-nav${menuOpen ? " main-nav-open" : ""}`} aria-label="Основная навигация">
          <a href="#calendar" onClick={() => setMenuOpen(false)}>Календарь шоу</a>
          <a href="#stay" onClick={() => setMenuOpen(false)}>Проживание</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>Вопросы</a>
          <button type="button" className="nav-cta" onClick={beginRequest}>Проверить даты <span aria-hidden="true">↗</span></button>
        </nav>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-image-wrap" aria-hidden="true">
          <OfficialImage src={sunriseConfig.gallery[0].src} alt="" className="hero-image" />
        </div>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content page-width">
          <div className="hero-copy">
            <p className="hero-kicker"><span /> Витязево · вечерняя программа</p>
            <h1>Музыкальные вечера и шоу в <em>«Санрайзе»</em></h1>
            <p className="hero-lede">Выберите программу и даты проживания — одним понятным запросом.</p>
            <div className="hero-actions">
              <button type="button" className="button button-primary" onClick={beginRequest}>Проверить программу на мои даты <span aria-hidden="true">↗</span></button>
              <button type="button" className="button button-ghost" onClick={() => scrollToId("calendar")}>Посмотреть календарь шоу <span aria-hidden="true">↓</span></button>
            </div>
          </div>
          <aside className="hero-program-card" aria-label="Ближайшая программа">
            <div className="card-topline"><span className="live-dot" /> На ближайшие даты</div>
            <p className="card-eyebrow">Ближайшая программа</p>
            <h2>Даты уточняются</h2>
            <p>Оставьте период проживания — мы проверим, какой вечер будет в ваши даты.</p>
            <button type="button" className="card-link" onClick={beginRequest}>Выбрать даты <span aria-hidden="true">↗</span></button>
          </aside>
        </div>
        <div className="hero-bottom page-width">
          <div className="scroll-note"><span className="scroll-line" /> Листайте к программе</div>
          <div className="hero-fact"><span className="fact-number">01</span><span>Музыка<br />и шоу</span></div>
          <div className="hero-fact"><span className="fact-number">02</span><span>Даты<br />под заезд</span></div>
          <div className="hero-fact"><span className="fact-number">03</span><span>Заявка<br />без лишнего</span></div>
        </div>
      </section>

      <section className="intro-band">
        <div className="page-width intro-grid">
          <p className="eyebrow">Как это работает</p>
          <div>
            <h2>Сначала — настроение.<br /><em>Потом — даты.</em></h2>
            <p className="section-copy">Выберите желаемую программу или просто оставьте период проживания. Мы сохраним контекст и проверим условия именно для вашего заезда.</p>
          </div>
          <div className="intro-note"><span>↘</span><p>Никаких переходов<br />в общий каталог наугад</p></div>
        </div>
      </section>

      <section id="calendar" className="calendar-section section-dark page-width-section">
        <div className="page-width">
          <SectionIntro eyebrow="01 / Календарь" title="Ближайшие шоу" copy="Актуальные даты появятся здесь после публикации программы. Пока можно оставить даты проживания — сотрудник проверит вечер под ваш период." light />
          <div className="calendar-toolbar">
            <div className="month-switcher" role="tablist" aria-label="Выбор месяца">
              {months.map((month, index) => (
                <button key={month} type="button" role="tab" aria-selected={calendarMonth === index} className={calendarMonth === index ? "active" : ""} onClick={() => setCalendarMonth(index)}>{month}</button>
              ))}
            </div>
            <p className="calendar-status"><span className="status-ring" /> Даты обновляются сотрудником отеля</p>
          </div>
          {confirmedShows.length > 0 ? (
            <div className="show-grid">
              {confirmedShows.map((show) => (
                <article className="show-card" key={show.id}>
                  <div className="show-card-image"><OfficialImage src={show.image ?? sunriseConfig.gallery[0].src} alt={show.title} /></div>
                  <div className="show-card-body"><p className="eyebrow">{show.type}</p><h3>{show.title}</h3><p>{show.description}</p><div className="show-meta">{show.date ?? "Дата уточняется"}{show.time ? ` · ${show.time}` : ""}</div><button type="button" className="text-button" onClick={() => chooseShow(show)}>Выбрать эту программу <span aria-hidden="true">↗</span></button></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="calendar-empty">
              <div className="calendar-orbit" aria-hidden="true"><span>♪</span><span>✦</span><span>◌</span></div>
              <div className="empty-copy"><p className="eyebrow">{months[calendarMonth]} · программа</p><h3>Ближайшие даты шоу уточняются</h3><p>Оставьте даты проживания — мы проверим программу специально под ваш заезд.</p><button type="button" className="button button-primary" onClick={beginRequest}>Проверить программу на мои даты <span aria-hidden="true">↗</span></button></div>
              <div className="empty-side-note"><span className="quote-mark">“</span><p>Вы выбираете<br />не просто номер,<br /><em>а повод приехать.</em></p></div>
            </div>
          )}
          <div className="calendar-facts">
            <span>На территории отеля</span><span>Живая музыка</span><span>Игры и конкурсы</span><span>Анимационные шоу</span>
          </div>
        </div>
      </section>

      <section id="program-detail" className="detail-section page-width-section">
        <div className="page-width detail-grid">
          <div className="detail-copy">
            <p className="eyebrow">02 / Выбранная программа</p>
            <h2>{selectedShow ? selectedShow.title : "Программа появится здесь после выбора даты"}</h2>
            <p className="section-copy">{selectedShow ? selectedShow.description : "Пока даты не опубликованы. Оставьте желаемый период — этот блок сохранит выбранное событие и передаст его в заявку."}</p>
            <div className="detail-tags"><span>{selectedType}</span><span>{selectedShow?.date ?? "Дата уточняется"}</span></div>
            <div className="detail-list"><div><span>Что известно</span><p>{selectedShow?.known.join(" · ") ?? "Формат вечера, наличие и программа проверяются под даты проживания."}</p></div><div><span>Что уточним</span><p>{selectedShow?.toClarify.join(" · ") ?? "Дата, время, состав программы и доступность размещения."}</p></div></div>
            <button type="button" className="button button-dark" onClick={beginRequest}>Подобрать проживание под эту программу <span aria-hidden="true">↗</span></button>
          </div>
          <div className="detail-visual"><div className="detail-image"><OfficialImage src={selectedShow?.image ?? sunriseConfig.gallery[1].src} alt={selectedShow?.title ?? "Вечерняя программа «Санрайза»"} /><div className="detail-image-caption"><span>Санрайз</span><span>Витязево</span></div></div><div className="detail-stamp" aria-hidden="true">stay<br /><i>for</i><br />the<br /><strong>evening</strong></div></div>
        </div>
      </section>

      <section id="request" className="request-section section-dark page-width-section">
        <div className="page-width">
          <SectionIntro eyebrow="03 / Даты проживания" title="Подберите заезд под программу" copy="Соберём короткий запрос: кто едет, на какие даты и какую атмосферу хочется поймать." light />
          <div className="request-layout">
            <div className="request-form-card">
              <div className="stepper" aria-label={`Шаг ${progressStep} из 6`}><div className={progressStep >= 1 ? "done" : ""}><span>01</span><small>Программа</small></div><i /><div className={progressStep >= 2 ? "done" : ""}><span>02</span><small>Заезд</small></div><i /><div className={progressStep >= 3 ? "done" : ""}><span>03</span><small>Выезд</small></div><i /><div className={progressStep >= 6 ? "done" : ""}><span>04</span><small>Заявка</small></div></div>
              <div className="selected-context"><span className="context-icon">✦</span><div><span>Выбранная программа</span><strong>{selectedProgram}</strong><small>{selectedShow?.date ?? "Дата и формат уточняются сотрудником"}</small></div><button type="button" onClick={() => scrollToId("calendar")}>Изменить</button></div>
              <div className="fields-grid">
                <label><span>Дата заезда</span><input type="date" min={today} value={booking.checkIn} onChange={(event) => updateBooking("checkIn", event.target.value)} /></label>
                <label><span>Дата выезда</span><input type="date" min={booking.checkIn || today} value={booking.checkOut} onChange={(event) => updateBooking("checkOut", event.target.value)} />{dateError ? <small className="field-error">{dateError}</small> : null}</label>
                <label><span>Взрослые</span><select value={booking.adults} onChange={(event) => updateBooking("adults", Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} {value === 1 ? "взрослый" : "взрослых"}</option>)}</select></label>
                <label><span>Дети</span><select value={booking.children} onChange={(event) => updateBooking("children", Number(event.target.value))}>{[0, 1, 2, 3, 4].map((value) => <option key={value} value={value}>{value} {value === 1 ? "ребёнок" : "детей"}</option>)}</select></label>
              </div>
              <label className="full-field"><span>Пожелания к заезду</span><textarea rows={3} placeholder="Например, хочется попасть на вечер с живой музыкой" value={booking.comment} onChange={(event) => updateBooking("comment", event.target.value)} /></label>
              <button type="button" className="button button-primary button-wide" onClick={() => { track("dates_selected", { check_in: booking.checkIn, check_out: booking.checkOut }); beginRequest(); }}>Сохранить даты и перейти к заявке <span aria-hidden="true">↓</span></button>
            </div>
            <aside className="request-summary" aria-live="polite"><p className="eyebrow">Ваш запрос</p><h3>Проверим<br /><em>вечер под заезд</em></h3><div className="summary-line"><span>Программа</span><strong>{selectedProgram}</strong></div><div className="summary-line"><span>Период проживания</span><strong>{formatDateRange(booking.checkIn, booking.checkOut)}</strong></div><div className="summary-line"><span>Гости</span><strong>{booking.adults} взрослых · {booking.children} детей</strong></div><div className="summary-note"><span>i</span><p>Это заявка на проверку доступности, а не подтверждённое бронирование.</p></div></aside>
          </div>
        </div>
      </section>

      <section id="stay" className="stay-section page-width-section">
        <div className="page-width"><SectionIntro eyebrow="04 / Проживание" title="Условия проживания" copy="Подберём вариант под выбранные даты. Стоимость и наличие уточняются сотрудником — без устаревших цен и обещаний до проверки." /><div className="rooms-grid">{sunriseConfig.rooms.filter((room) => room.confirmed).map((room) => <article className="room-card" key={room.id}><div className="room-card-top"><span className="room-icon">{room.name.charAt(0)}</span><span className="room-availability">Под даты</span></div><h3>{room.name}</h3><p>{room.details}</p><div className="room-divider" /><span className="room-price">{room.priceLabel}</span><small>{room.conditions}</small><button type="button" className="text-button" onClick={beginRequest}>Узнать доступность <span aria-hidden="true">↗</span></button></article>)}</div></div>
      </section>

      <section className="included-section section-soft page-width-section"><div className="page-width"><SectionIntro eyebrow="05 / Внутри опыта" title="Что входит в настроение вечера" copy="Только то, что подтверждено открытыми материалами «Санрайза». Детали конкретного предложения зависят от дат." /><div className="included-grid">{sunriseConfig.includedItems.filter((item) => item.confirmed).map((item) => <article className="included-card" key={item.title}><span className="included-number">{item.icon}</span><p className="eyebrow">{item.eyebrow}</p><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section>

      <section className="atmosphere-section page-width-section"><div className="atmosphere-grid page-width"><div className="atmosphere-main"><OfficialImage src={sunriseConfig.gallery[2].src} alt={sunriseConfig.gallery[2].alt} /><div className="atmosphere-overlay"><p className="eyebrow">Вечер в Витязево</p><h2>Когда отпуск<br /><em>звучит иначе.</em></h2></div></div><div className="atmosphere-side"><OfficialImage src={sunriseConfig.gallery[3].src} alt={sunriseConfig.gallery[3].alt} /><div className="side-copy"><span className="quote-mark">“</span><p>Мягкий свет.<br />Живая музыка.<br /><em>Ваши даты.</em></p></div></div></div></section>

      <section id="faq" className="faq-section page-width-section"><div className="page-width faq-layout"><SectionIntro eyebrow="06 / FAQ" title="Понятно до заезда" copy="Если точного ответа ещё нет, мы не будем угадывать — уточним его в заявке." /><div className="faq-list">{faq.map((item, index) => <div className={`faq-item${activeFaq === index ? " faq-open" : ""}`} key={item.question}><button type="button" aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i aria-hidden="true">{activeFaq === index ? "−" : "+"}</i></button>{activeFaq === index ? <div className="faq-answer"><p>{item.answer}</p></div> : null}</div>)}</div></div></section>

      <section id="final-request" className="final-request-section section-dark page-width-section"><div className="page-width final-request-grid"><div className="final-request-copy"><p className="eyebrow">07 / Финальная заявка</p><h2>Проверим, какая программа будет <em>в ваши даты</em></h2><p>Оставьте контакт — сотрудник «Санрайза» увидит выбранную программу, период проживания и состав гостей в одном запросе.</p><div className="contact-block">{sunriseConfig.contacts.filter((contact) => contact.confirmed).map((contact) => <a key={contact.label} href={contact.href}><span>{contact.label}</span><strong>{contact.value}</strong></a>)}</div></div><form className="final-form" onSubmit={submitRequest} noValidate><div className="form-context-row"><span>Программа</span><strong>{selectedProgram}</strong></div><div className="form-context-row"><span>Даты</span><strong>{formatDateRange(booking.checkIn, booking.checkOut)}</strong></div><div className="form-context-row"><span>Гости</span><strong>{booking.adults} взрослых · {booking.children} детей</strong></div><div className="form-fields"><label><span>Ваше имя</span><input required value={booking.name} onChange={(event) => updateBooking("name", event.target.value)} placeholder="Как к вам обращаться" /></label><label><span>Телефон или WhatsApp</span><input required value={booking.contact} onChange={(event) => updateBooking("contact", event.target.value)} placeholder="+7 900 000-00-00" /></label><label className="full-field"><span>Комментарий</span><textarea rows={3} value={booking.comment} onChange={(event) => updateBooking("comment", event.target.value)} placeholder="Что важно учесть при проверке" /></label></div>{formError ? <p className="form-error" role="alert">{formError}</p> : null}{submitted ? <div className="success-state" role="status"><span>✓</span><div><strong>Запрос сохранён в демо-режиме</strong><p>Вы выбрали: {selectedProgram}. Даты: {formatDateRange(booking.checkIn, booking.checkOut)}. В реальном запуске эти данные будут переданы сотруднику «Санрайза».</p></div></div> : <button type="submit" className="button button-primary button-wide">Проверить дату и программу <span aria-hidden="true">↗</span></button>}<small className="form-disclaimer">Нажимая кнопку, вы отправляете заявку на проверку доступности. Подтверждение бронирования произойдёт только после ответа сотрудника.</small></form></div></section>

      <footer className="site-footer"><div className="page-width footer-grid"><div><a className="brand brand-footer" href="#top"><span className="brand-mark" aria-hidden="true">S</span><span><strong>Санрайз</strong><small>Отель · Витязево</small></span></a><p>Вечерняя программа, привязанная к вашим датам.</p></div><div className="footer-address"><span>Адрес</span><p>{sunriseConfig.address.value}</p></div><div className="footer-links"><span>Официальные материалы</span><a href={sunriseConfig.officialLinks.home}>Сайт отеля ↗</a><a href={sunriseConfig.officialLinks.shows}>Шоу-программы ↗</a></div></div><div className="page-width footer-bottom"><span>© «Санрайз», Витязево</span><span>Демонстрационная концепция на основе открытых материалов. Перед публикацией расписание, цены и условия обновляются сотрудником «Санрайза».</span></div></footer>
      <button type="button" className="mobile-sticky-cta" onClick={beginRequest}>Проверить дату <span aria-hidden="true">↗</span></button>
    </main>
  );
}

