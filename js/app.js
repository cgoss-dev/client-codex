const weekStartToggle = document.querySelector("#weekStartToggle");
const scheduleNavLink = document.querySelector("#scheduleNavLink");
const accountsNavLink = document.querySelector("#accountsNavLink");
const billingNavLink = document.querySelector("#billingNavLink");
const operationsNavLink = document.querySelector("#operationsNavLink");
const preferencesNavLink = document.querySelector("#preferencesNavLink");
const primaryNavigation = document.querySelector("#primaryNavigation");
const primaryNavigationBackdrop = document.querySelector("#primaryNavigationBackdrop");
const appViewElements = document.querySelectorAll("[data-app-view]");
const calendarDates = document.querySelector(".calendar-dates");
const calendarMonth = document.querySelector("#calendarMonth");
const previousMonthButton = document.querySelector("#previousMonthButton");
const nextMonthButton = document.querySelector("#nextMonthButton");
const scheduleCaption = document.querySelector("#scheduleCaption");
const scheduleWeekdays = document.querySelector("#scheduleWeekdays");
const scheduleBody = document.querySelector("#scheduleBody");
const scheduleTable = document.querySelector(".app-schedule-table");
const mainPanels = document.querySelector("#mainPanels");
const routePanel = document.querySelector("#routePanel");
const scheduleHeadingControls = document.querySelector("#scheduleHeadingControls");
const routeHeadingRow = document.querySelector("#routeHeadingRow");
const viewRouteButton = document.querySelector("#viewRouteButton");
const previousScheduleDatesButton = document.querySelector("#previousScheduleDatesButton");
const nextScheduleDatesButton = document.querySelector("#nextScheduleDatesButton");
const scheduleFormatPopup = document.querySelector("#scheduleFormatPopup");
const timeFormat12Button = document.querySelector("#timeFormat12Button");
const timeFormat24Button = document.querySelector("#timeFormat24Button");
const scheduleStartHourSelect = document.querySelector("#scheduleStartHour");
const scheduleEndHourSelect = document.querySelector("#scheduleEndHour");
const dateRange3Button = document.querySelector("#dateRange3Button");
const dateRange5Button = document.querySelector("#dateRange5Button");
const dateRange7Button = document.querySelector("#dateRange7Button");
const appointmentInfo1Button = document.querySelector("#appointmentInfo1Button");
const appointmentInfo3Button = document.querySelector("#appointmentInfo3Button");
const appointmentInfo5Button = document.querySelector("#appointmentInfo5Button");
const weekendsOffButton = document.querySelector("#weekendsOffButton");
const weekendsOnButton = document.querySelector("#weekendsOnButton");

const showAppView = (viewName) => {
  appViewElements.forEach((element) => {
    element.classList.toggle("d-none", element.dataset.appView !== viewName);
  });

  [scheduleNavLink, accountsNavLink, billingNavLink, operationsNavLink, preferencesNavLink].forEach((link) => {
    const isActive = link?.getAttribute("href") === `#${viewName}`;
    link?.classList.toggle("active", isActive);

    if (isActive) {
      link?.setAttribute("aria-current", "page");
    } else {
      link?.removeAttribute("aria-current");
    }
  });
};

const showViewFromHash = () => {
  const requestedView = window.location.hash.slice(1);
  const availableViews = ["schedule", "accounts", "billing", "operations", "preferences"];
  showAppView(availableViews.includes(requestedView) ? requestedView : "schedule");
};

window.addEventListener("hashchange", showViewFromHash);
showViewFromHash();

primaryNavigation?.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-link") || window.matchMedia("(min-width: 992px)").matches) {
    return;
  }

  window.bootstrap?.Collapse.getOrCreateInstance(primaryNavigation, { toggle: false }).hide();
});

primaryNavigation?.addEventListener("show.bs.collapse", () => {
  document.querySelectorAll(".app-sidebar.show, .app-sidebar.showing").forEach((sidebar) => {
    window.bootstrap?.Offcanvas.getOrCreateInstance(sidebar).hide();
  });

  primaryNavigationBackdrop?.removeAttribute("hidden");
});

primaryNavigation?.addEventListener("hidden.bs.collapse", () => {
  primaryNavigationBackdrop?.setAttribute("hidden", "");
});

primaryNavigationBackdrop?.addEventListener("click", () => {
  window.bootstrap?.Collapse.getOrCreateInstance(primaryNavigation, { toggle: false }).hide();
});

document.addEventListener("show.bs.offcanvas", (event) => {
  if (!event.target.matches(".app-sidebar")) {
    return;
  }

  window.bootstrap?.Collapse.getOrCreateInstance(primaryNavigation, { toggle: false }).hide();

  const sidebarToggle = document.querySelector(`.app-sidebar-toggle[data-bs-target="#${event.target.id}"]`);
  sidebarToggle?.classList.add("is-open");
  sidebarToggle?.setAttribute("aria-expanded", "true");
  sidebarToggle?.setAttribute("aria-label", "Close sidebar");

  const chevron = sidebarToggle?.querySelector("[aria-hidden='true']");
  if (chevron) {
    chevron.textContent = "‹";
  }
});

document.addEventListener("hide.bs.offcanvas", (event) => {
  if (!event.target.matches(".app-sidebar")) {
    return;
  }

  const sidebarToggle = document.querySelector(`.app-sidebar-toggle[data-bs-target="#${event.target.id}"]`);
  sidebarToggle?.classList.remove("is-open");
  sidebarToggle?.setAttribute("aria-expanded", "false");
  sidebarToggle?.setAttribute("aria-label", "Open sidebar");

  const chevron = sidebarToggle?.querySelector("[aria-hidden='true']");
  if (chevron) {
    chevron.textContent = "›";
  }
});

if (weekStartToggle && calendarDates && calendarMonth) {
  const weekStartStorageKey = "clientCodex.weekStartsOnMonday";
  const weekendsStorageKey = "clientCodex.showsWeekends";
  const timeFormatStorageKey = "clientCodex.uses24HourTime";
  const scheduleStartHourStorageKey = "clientCodex.scheduleStartHour";
  const scheduleEndHourStorageKey = "clientCodex.scheduleEndHour";
  const dateRangeStorageKey = "clientCodex.dateRangeDays";
  const appointmentInfoStorageKey = "clientCodex.appointmentInfoLines";
  const routeVisibilityStorageKey = "clientCodex.showsRoute";
  const sundayFirst = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const earliestMonth = new Date(today.getFullYear(), today.getMonth() - 12, 1);
  const latestMonth = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = new Date(today);
  let showsWeekends = true;
  let startsOnMonday = false;
  let uses24HourTime = false;
  let scheduleStartHour = 6;
  let scheduleEndHour = 18;
  let dateRangeDays = 7;
  let appointmentInfoLines = 1;
  let showsRoute = false;

  try {
    startsOnMonday = localStorage.getItem(weekStartStorageKey) === "true";
    showsWeekends = localStorage.getItem(weekendsStorageKey) !== "false";
    uses24HourTime = localStorage.getItem(timeFormatStorageKey) === "true";
    const storedStartHour = Number(localStorage.getItem(scheduleStartHourStorageKey));
    const storedEndHour = Number(localStorage.getItem(scheduleEndHourStorageKey));

    if (
      Number.isInteger(storedStartHour) &&
      Number.isInteger(storedEndHour) &&
      storedStartHour >= 0 &&
      storedStartHour <= 23 &&
      storedEndHour >= 1 &&
      storedEndHour <= 24 &&
      storedStartHour < storedEndHour
    ) {
      scheduleStartHour = storedStartHour;
      scheduleEndHour = storedEndHour;
    }

    const storedDateRange = Number(localStorage.getItem(dateRangeStorageKey));

    if ([3, 5, 7].includes(storedDateRange)) {
      dateRangeDays = storedDateRange;
    }

    const storedAppointmentInfoLines = Number(localStorage.getItem(appointmentInfoStorageKey));

    if ([1, 3, 5].includes(storedAppointmentInfoLines)) {
      appointmentInfoLines = storedAppointmentInfoLines;
    }

    showsRoute = localStorage.getItem(routeVisibilityStorageKey) === "true";
  } catch {
    // The calendar still works if browser storage is unavailable.
  }

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

  const isSameDate = (firstDate, secondDate) =>
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate();

  const getScheduleDates = () => {
    const dates = [];
    let dayOffset = 0;

    while (dates.length < dateRangeDays) {
      const date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() + dayOffset,
      );
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      if (showsWeekends || !isWeekend) {
        dates.push(date);
      }

      dayOffset += 1;
    }

    return dates;
  };

  const formatScheduleTime = (hour, minute) => {
    if (uses24HourTime) {
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }

    const twelveHour = hour % 12 || 12;
    const period = hour < 12 ? "AM" : "PM";
    return `${twelveHour}:${String(minute).padStart(2, "0")} ${period}`;
  };

  const formatScheduleHour = (hour) => {
    if (uses24HourTime) {
      return String(hour).padStart(2, "0");
    }

    return `${hour % 12 || 12}${hour < 12 ? "a" : "p"}`;
  };

  const formatRangeHour = (hour) => {
    if (uses24HourTime) {
      return String(hour).padStart(2, "0");
    }

    const normalizedHour = hour % 24;
    return `${normalizedHour % 12 || 12}${normalizedHour < 12 ? "a" : "p"}`;
  };

  const createCalendarDate = (date, scheduleDates) => {
    const dateCell = document.createElement("button");
    const dateValue = document.createElement("time");
    const isToday = isSameDate(date, today);
    const isSelected = isSameDate(date, selectedDate);
    const isOutsideMonth = date.getMonth() !== displayedMonth.getMonth();
    const isInScheduleRange = scheduleDates.some((scheduleDate) => isSameDate(date, scheduleDate));

    dateCell.className = "calendar-day";
    dateCell.type = "button";
    dateCell.setAttribute(
      "aria-label",
      `Show week containing ${formatDate(date)}${isToday ? ", today" : ""}`,
    );
    dateCell.setAttribute("aria-pressed", String(isSelected));
    dateCell.classList.toggle("calendar-day-outside", isOutsideMonth);
    dateCell.classList.toggle("calendar-day-schedule-range", isInScheduleRange);
    dateCell.classList.toggle("calendar-day-selected", isSelected);

    dateValue.dateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    dateValue.textContent = String(date.getDate());
    dateCell.append(dateValue);

    if (isToday) {
      dateCell.classList.add("calendar-day-current");
      dateCell.setAttribute("aria-current", "date");
    }

    dateCell.addEventListener("click", () => {
      selectedDate = new Date(date);
      displayedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      updateCalendar();
    });

    return dateCell;
  };

  const updateSchedule = () => {
    if (!scheduleCaption || !scheduleWeekdays || !scheduleBody) {
      return;
    }

    const scheduleDates = getScheduleDates();
    const rangeEnd = scheduleDates[scheduleDates.length - 1];
    const timeHeading = document.createElement("th");
    const timeToggle = document.createElement("button");
    const timeToggleIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const gearCenterPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const gearOuterPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

    timeHeading.className = "schedule-time-heading p-0 text-center";
    timeHeading.scope = "col";
    timeToggle.className = "btn btn-light schedule-time-toggle";
    timeToggle.type = "button";
    timeToggleIcon.setAttribute("class", "bi bi-gear schedule-time-toggle-icon");
    timeToggleIcon.setAttribute("aria-hidden", "true");
    timeToggleIcon.setAttribute("fill", "currentColor");
    timeToggleIcon.setAttribute("viewBox", "0 0 16 16");
    gearCenterPath.setAttribute("d", "M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0");
    gearOuterPath.setAttribute("d", "M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z");
    timeToggleIcon.append(gearCenterPath, gearOuterPath);
    timeToggle.setAttribute("aria-label", "Open schedule formatting");
    timeToggle.setAttribute("aria-controls", "scheduleFormatPopup");
    timeToggle.setAttribute("aria-expanded", String(scheduleFormatPopup?.matches(":popover-open") ?? false));
    timeToggle.setAttribute("popovertarget", "scheduleFormatPopup");
    timeToggle.append(timeToggleIcon);
    timeHeading.append(timeToggle);

    const dayHeadings = scheduleDates.map((date) => {
      const heading = document.createElement("th");
      const button = document.createElement("button");
      const weekday = document.createElement("span");
      const dayNumber = document.createElement("span");
      const isToday = isSameDate(date, today);
      const isSelected = isSameDate(date, selectedDate);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      heading.className = "p-0";
      heading.classList.toggle("schedule-day-heading-weekend", isWeekend);
      heading.scope = "col";
      button.className = `btn btn-light schedule-day-button${isSelected ? " active" : ""}`;
      button.classList.toggle("schedule-day-weekend", isWeekend);
      button.type = "button";
      button.setAttribute("aria-label", `Show ${formatDate(date)}${isToday ? ", today" : ""}`);
      button.setAttribute("aria-pressed", String(isSelected));
      button.classList.toggle("schedule-day-current", isToday);

      if (isToday) {
        button.setAttribute("aria-current", "date");
      }

      weekday.textContent = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
      dayNumber.textContent = String(date.getDate());
      button.append(weekday, dayNumber);
      button.addEventListener("click", () => {
        selectedDate = new Date(date);
        displayedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        updateCalendar();
      });
      heading.append(button);
      return heading;
    });

    scheduleWeekdays.replaceChildren(timeHeading, ...dayHeadings);

    const scheduleRows = Array.from(
      { length: (scheduleEndHour - scheduleStartHour) * 4 },
      (_, index) => {
        const totalMinutes = scheduleStartHour * 60 + index * 15;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        const row = document.createElement("tr");
        const time = document.createElement("th");
        const timeLabel = formatScheduleTime(hour, minute);

        time.className = "schedule-time-cell text-center";
        time.scope = "row";
        time.textContent = minute === 0 ? formatScheduleHour(hour) : "";
        time.setAttribute("aria-label", timeLabel);
        row.append(time);

        scheduleDates.forEach((date) => {
          const slot = document.createElement("td");
          slot.className = "schedule-slot";
          slot.classList.toggle("schedule-slot-weekend", date.getDay() === 0 || date.getDay() === 6);
          slot.setAttribute("aria-label", `${formatDate(date)}, ${timeLabel}`);
          row.append(slot);
        });

        return row;
      },
    );

    scheduleBody.replaceChildren(...scheduleRows);
    if (scheduleTable) {
      const widthInRem = 2 + scheduleDates.length * 4;
      const gapInRem = (scheduleDates.length + 2) * 0.125;
      scheduleTable.style.minWidth = `calc(${widthInRem}rem + ${gapInRem}rem)`;
      scheduleTable.style.setProperty(
        "--app-schedule-row-height",
        `${appointmentInfoLines * 1.25}rem`,
      );
    }

    scheduleCaption.textContent = `Schedule for ${formatDate(scheduleDates[0])} through ${formatDate(rangeEnd)}, ${dateRangeDays} days${showsWeekends ? "" : ", weekends hidden"}`;

    if (scheduleFormatPopup?.matches(":popover-open")) {
      requestAnimationFrame(positionFormatPopup);
    }
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

    weekStartToggle.setAttribute(
      "aria-label",
      startsOnMonday ? "Week starts on Monday" : "Week starts on Sunday",
    );
  };

  const setFormatButtonState = (button, isActive) => {
    button?.classList.toggle("active", isActive);
    button?.setAttribute("aria-pressed", String(isActive));
  };

  const updateFormattingControls = () => {
    setFormatButtonState(timeFormat12Button, !uses24HourTime);
    setFormatButtonState(timeFormat24Button, uses24HourTime);
    setFormatButtonState(dateRange3Button, dateRangeDays === 3);
    setFormatButtonState(dateRange5Button, dateRangeDays === 5);
    setFormatButtonState(dateRange7Button, dateRangeDays === 7);
    setFormatButtonState(appointmentInfo1Button, appointmentInfoLines === 1);
    setFormatButtonState(appointmentInfo3Button, appointmentInfoLines === 3);
    setFormatButtonState(appointmentInfo5Button, appointmentInfoLines === 5);
    setFormatButtonState(weekendsOffButton, !showsWeekends);
    setFormatButtonState(weekendsOnButton, showsWeekends);

    if (scheduleStartHourSelect && scheduleEndHourSelect) {
      scheduleStartHourSelect.replaceChildren(
        ...Array.from({ length: 24 }, (_, hour) => {
          const option = document.createElement("option");
          option.value = String(hour);
          option.textContent = formatRangeHour(hour);
          option.disabled = hour >= scheduleEndHour;
          return option;
        }),
      );
      scheduleEndHourSelect.replaceChildren(
        ...Array.from({ length: 24 }, (_, index) => {
          const hour = index + 1;
          const option = document.createElement("option");
          option.value = String(hour);
          option.textContent = formatRangeHour(hour);
          option.disabled = hour <= scheduleStartHour;
          return option;
        }),
      );
      scheduleStartHourSelect.value = String(scheduleStartHour);
      scheduleEndHourSelect.value = String(scheduleEndHour);
    }
  };

  const updateRouteView = () => {
    mainPanels?.classList.toggle("app-route-visible", showsRoute);

    if (routePanel) {
      routePanel.hidden = !showsRoute;
    }

    if (viewRouteButton) {
      viewRouteButton.textContent = showsRoute ? "Route On" : "Route Off";
      viewRouteButton.classList.toggle("active", showsRoute);
      viewRouteButton.setAttribute("aria-pressed", String(showsRoute));
      (showsRoute ? routeHeadingRow : scheduleHeadingControls)?.append(viewRouteButton);
    }

  };

  function positionFormatPopup() {
    const trigger = document.querySelector(".schedule-time-toggle");

    if (!scheduleFormatPopup?.matches(":popover-open") || !trigger) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = scheduleFormatPopup.getBoundingClientRect();
    const edgeSpace = 8;
    const left = Math.min(
      Math.max(edgeSpace, triggerRect.left),
      window.innerWidth - popupRect.width - edgeSpace,
    );
    const below = triggerRect.bottom + edgeSpace;
    const top = below + popupRect.height <= window.innerHeight - edgeSpace
      ? below
      : Math.max(edgeSpace, triggerRect.top - popupRect.height - edgeSpace);

    scheduleFormatPopup.style.left = `${left}px`;
    scheduleFormatPopup.style.top = `${top}px`;
  }

  const updateCalendar = () => {
    const weekdays = startsOnMonday ? [...sundayFirst.slice(1), sundayFirst[0]] : sundayFirst;
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = displayedMonth.getDay();
    const leadingBlankCount = startsOnMonday ? (firstWeekday + 6) % 7 : firstWeekday;
    const calendarCellCount = Math.ceil((leadingBlankCount + daysInMonth) / 7) * 7;
    const calendarStart = new Date(year, month, 1 - leadingBlankCount);
    const scheduleDates = getScheduleDates();
    const calendarCells = Array.from({ length: calendarCellCount }, (_, index) => {
      const date = new Date(
        calendarStart.getFullYear(),
        calendarStart.getMonth(),
        calendarStart.getDate() + index,
      );
      return createCalendarDate(date, scheduleDates);
    });

    updateWeekdays(weekdays);
    updateFormattingControls();

    calendarCells.forEach((cell, index) => {
      const weekday = weekdays[index % weekdays.length];
      cell.classList.toggle("calendar-weekend", weekday === "Sun" || weekday === "Sat");
    });

    const monthLabel = formatMonth(displayedMonth);
    calendarMonth.textContent = formatMonthName(displayedMonth);
    calendarMonth.setAttribute("datetime", `${year}-${String(month + 1).padStart(2, "0")}`);
    previousMonthButton?.toggleAttribute(
      "disabled",
      displayedMonth.getTime() <= earliestMonth.getTime(),
    );
    nextMonthButton?.toggleAttribute(
      "disabled",
      displayedMonth.getTime() >= latestMonth.getTime(),
    );
    calendarDates.setAttribute("aria-label", `${monthLabel} dates`);
    calendarDates.replaceChildren(...calendarCells);
    updateRouteView();
    updateSchedule();
  };

  const setTimeFormat = (use24HourTime) => {
    uses24HourTime = use24HourTime;

    try {
      localStorage.setItem(timeFormatStorageKey, String(uses24HourTime));
    } catch {
      // The preference lasts for this page view if browser storage is unavailable.
    }

    updateFormattingControls();
    updateSchedule();
  };

  const setTimeRange = (startHour, endHour) => {
    if (startHour >= endHour) {
      return;
    }

    scheduleStartHour = startHour;
    scheduleEndHour = endHour;

    try {
      localStorage.setItem(scheduleStartHourStorageKey, String(scheduleStartHour));
      localStorage.setItem(scheduleEndHourStorageKey, String(scheduleEndHour));
    } catch {
      // The preference lasts for this page view if browser storage is unavailable.
    }

    updateFormattingControls();
    updateSchedule();
  };

  const setWeekendVisibility = (showWeekends) => {
    showsWeekends = showWeekends;

    try {
      localStorage.setItem(weekendsStorageKey, String(showsWeekends));
    } catch {
      // The preference lasts for this page view if browser storage is unavailable.
    }

    updateCalendar();
  };

  const setDateRange = (days) => {
    dateRangeDays = days;

    try {
      localStorage.setItem(dateRangeStorageKey, String(dateRangeDays));
    } catch {
      // The preference lasts for this page view if browser storage is unavailable.
    }

    updateCalendar();
  };

  const setAppointmentInfoLines = (lines) => {
    appointmentInfoLines = lines;

    try {
      localStorage.setItem(appointmentInfoStorageKey, String(appointmentInfoLines));
    } catch {
      // The preference lasts for this page view if browser storage is unavailable.
    }

    updateFormattingControls();
    updateSchedule();
  };

  const setRouteVisibility = (showRoute) => {
    showsRoute = showRoute;

    try {
      localStorage.setItem(routeVisibilityStorageKey, String(showsRoute));
    } catch {
      // The preference lasts for this page view if browser storage is unavailable.
    }

    updateRouteView();
  };

  const moveScheduleDateRange = (direction) => {
    if (direction > 0) {
      const currentScheduleDates = getScheduleDates();
      const lastDisplayedDate = currentScheduleDates[currentScheduleDates.length - 1];
      let nextDate = new Date(
        lastDisplayedDate.getFullYear(),
        lastDisplayedDate.getMonth(),
        lastDisplayedDate.getDate() + 1,
      );

      while (!showsWeekends && (nextDate.getDay() === 0 || nextDate.getDay() === 6)) {
        nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate() + 1);
      }

      selectedDate = nextDate;
    } else {
      let previousDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() - 1,
      );
      let displayedDayCount = 0;

      while (displayedDayCount < dateRangeDays) {
        const isWeekend = previousDate.getDay() === 0 || previousDate.getDay() === 6;

        if (showsWeekends || !isWeekend) {
          displayedDayCount += 1;
        }

        if (displayedDayCount < dateRangeDays) {
          previousDate = new Date(
            previousDate.getFullYear(),
            previousDate.getMonth(),
            previousDate.getDate() - 1,
          );
        }
      }

      selectedDate = previousDate;
    }

    displayedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    updateCalendar();
  };

  const showRelativeMonth = (monthOffset) => {
    displayedMonth = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() + monthOffset,
      1,
    );
    updateCalendar();
  };

  previousMonthButton?.addEventListener("click", () => showRelativeMonth(-1));
  nextMonthButton?.addEventListener("click", () => showRelativeMonth(1));
  timeFormat12Button?.addEventListener("click", () => setTimeFormat(false));
  timeFormat24Button?.addEventListener("click", () => setTimeFormat(true));
  scheduleStartHourSelect?.addEventListener("change", () => {
    setTimeRange(Number(scheduleStartHourSelect.value), scheduleEndHour);
  });
  scheduleEndHourSelect?.addEventListener("change", () => {
    setTimeRange(scheduleStartHour, Number(scheduleEndHourSelect.value));
  });
  dateRange3Button?.addEventListener("click", () => setDateRange(3));
  dateRange5Button?.addEventListener("click", () => setDateRange(5));
  dateRange7Button?.addEventListener("click", () => setDateRange(7));
  appointmentInfo1Button?.addEventListener("click", () => setAppointmentInfoLines(1));
  appointmentInfo3Button?.addEventListener("click", () => setAppointmentInfoLines(3));
  appointmentInfo5Button?.addEventListener("click", () => setAppointmentInfoLines(5));
  viewRouteButton?.addEventListener("click", () => setRouteVisibility(!showsRoute));
  previousScheduleDatesButton?.addEventListener("click", () => moveScheduleDateRange(-1));
  nextScheduleDatesButton?.addEventListener("click", () => moveScheduleDateRange(1));
  weekendsOffButton?.addEventListener("click", () => setWeekendVisibility(false));
  weekendsOnButton?.addEventListener("click", () => setWeekendVisibility(true));

  scheduleFormatPopup?.addEventListener("toggle", (event) => {
    document.querySelector(".schedule-time-toggle")?.setAttribute(
      "aria-expanded",
      String(event.newState === "open"),
    );

    if (event.newState === "open") {
      requestAnimationFrame(positionFormatPopup);
    }
  });

  window.addEventListener("resize", positionFormatPopup);

  updateCalendar();
}
