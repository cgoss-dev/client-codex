const weekStartToggle = document.querySelector("#weekStartToggle");
const calendarDates = document.querySelector(".calendar-dates");
const calendarMonth = document.querySelector("#calendarMonth");
const previousMonthButton = document.querySelector("#previousMonthButton");
const nextMonthButton = document.querySelector("#nextMonthButton");
const currentMonthButton = document.querySelector("#currentMonthButton");

if (
  weekStartToggle &&
  calendarDates &&
  calendarMonth &&
  previousMonthButton &&
  nextMonthButton &&
  currentMonthButton
) {
  const weekStartStorageKey = "clientCodex.weekStartsOnMonday";
  const sundayFirst = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const firstAllowedMonth = new Date(today.getFullYear(), today.getMonth() - 12, 1);
  const lastAllowedMonth = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let startsOnMonday = false;

  try {
    startsOnMonday = localStorage.getItem(weekStartStorageKey) === "true";
  } catch {
    // The calendar still works if browser storage is unavailable.
  }

  const monthKey = (date) => date.getFullYear() * 12 + date.getMonth();

  const formatMonth = (date) =>
    new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(date);

  const formatMonthName = (date) =>
    new Intl.DateTimeFormat(undefined, {
      month: "long",
    }).format(date);

  const formatDate = (date) =>
    new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

  const createBlankDate = () => {
    const blankDate = document.createElement("span");
    blankDate.setAttribute("aria-hidden", "true");
    return blankDate;
  };

  const createDateButton = (day) => {
    const date = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), day);
    const dateButton = document.createElement("button");
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    dateButton.className = "btn calendar-day p-0";
    dateButton.type = "button";
    dateButton.textContent = String(day);
    dateButton.setAttribute("aria-label", `${formatDate(date)}${isToday ? ", today" : ""}`);

    if (isToday) {
      dateButton.classList.add("calendar-day-current");
      dateButton.setAttribute("aria-current", "date");
    }

    return dateButton;
  };

  const updateWeekdays = (weekdays) => {
    weekStartToggle.replaceChildren(
      ...weekdays.map((weekday) => {
        const label = document.createElement("span");
        label.textContent = weekday;
        label.setAttribute("aria-hidden", "true");
        label.classList.toggle("calendar-weekend", weekday === "Sun" || weekday === "Sat");
        return label;
      }),
    );

    weekStartToggle.setAttribute("aria-pressed", String(startsOnMonday));
    weekStartToggle.setAttribute(
      "aria-label",
      startsOnMonday ? "Week starts on Monday. Change to Sunday." : "Week starts on Sunday. Change to Monday.",
    );
  };

  const updateNavigation = () => {
    const previousMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    const nextMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);

    previousMonthButton.disabled = monthKey(displayedMonth) === monthKey(firstAllowedMonth);
    nextMonthButton.disabled = monthKey(displayedMonth) === monthKey(lastAllowedMonth);
    previousMonthButton.setAttribute("aria-label", `Show ${formatMonth(previousMonth)}`);
    nextMonthButton.setAttribute("aria-label", `Show ${formatMonth(nextMonth)}`);
  };

  const updateCalendar = () => {
    const weekdays = startsOnMonday ? [...sundayFirst.slice(1), sundayFirst[0]] : sundayFirst;
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = displayedMonth.getDay();
    const leadingBlankCount = startsOnMonday ? (firstWeekday + 6) % 7 : firstWeekday;
    const trailingBlankCount = (7 - ((leadingBlankCount + daysInMonth) % 7)) % 7;
    const dateButtons = Array.from({ length: daysInMonth }, (_, index) => createDateButton(index + 1));
    const calendarCells = [
      ...Array.from({ length: leadingBlankCount }, createBlankDate),
      ...dateButtons,
      ...Array.from({ length: trailingBlankCount }, createBlankDate),
    ];

    updateWeekdays(weekdays);

    calendarCells.forEach((cell, index) => {
      const weekday = weekdays[index % weekdays.length];
      cell.classList.toggle("calendar-weekend", weekday === "Sun" || weekday === "Sat");
    });

    const monthLabel = formatMonth(displayedMonth);
    calendarMonth.textContent = formatMonthName(displayedMonth);
    calendarMonth.setAttribute("datetime", `${year}-${String(month + 1).padStart(2, "0")}`);
    currentMonthButton.setAttribute("aria-label", `Return to ${formatMonth(today)}`);
    calendarDates.setAttribute("aria-label", `${monthLabel} dates`);
    calendarDates.replaceChildren(...calendarCells);
    updateNavigation();
  };

  weekStartToggle.addEventListener("click", () => {
    startsOnMonday = !startsOnMonday;

    try {
      localStorage.setItem(weekStartStorageKey, String(startsOnMonday));
    } catch {
      // The preference lasts for this page view if browser storage is unavailable.
    }

    updateCalendar();
  });

  previousMonthButton.addEventListener("click", () => {
    if (!previousMonthButton.disabled) {
      displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
      updateCalendar();
    }
  });

  nextMonthButton.addEventListener("click", () => {
    if (!nextMonthButton.disabled) {
      displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
      updateCalendar();
    }
  });

  currentMonthButton.addEventListener("click", () => {
    displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    updateCalendar();
  });

  updateCalendar();
}
