const weekStartToggle = document.querySelector("#weekStartToggle");
const scheduleNavLink = document.querySelector("#scheduleNavLink");
const accountsNavLink = document.querySelector("#accountsNavLink");
const billingNavLink = document.querySelector("#billingNavLink");
const operationsNavLink = document.querySelector("#operationsNavLink");
const preferencesNavLink = document.querySelector("#preferencesNavLink");
const newButtons = document.querySelectorAll("[data-new-button]");
const cancelNewButton = document.querySelector("#cancelNewButton");
const includeLocation = document.querySelector("#includeLocation");
const locationFields = document.querySelector("#locationFields");
const locationType = document.querySelector("#locationType");
const locationOccupancyField = document.querySelector("#locationOccupancyField");
const locationOccupancy = document.querySelector("#locationOccupancy");
const includeClient = document.querySelector("#includeClient");
const clientFields = document.querySelector("#clientFields");
const includeAppointment = document.querySelector("#includeAppointment");
const appointmentFields = document.querySelector("#appointmentFields");
const includeLinks = document.querySelector("#includeLinks");
const includeLinkOption = document.querySelector("#includeLinkOption");
const linkFields = document.querySelector("#linkFields");
const clientContacts = document.querySelector("#clientContacts");
const clientRoleCards = document.querySelectorAll("[data-client-role-card]");
const clientRoleOptions = document.querySelector("[data-client-role-options]");
const clientRoleToggles = document.querySelectorAll("[data-client-role-toggle]");
const clientPriorityToggles = document.querySelectorAll("[data-client-priority-toggle]");
const clientSourceToggles = document.querySelectorAll("[data-client-source-toggle]");
const newForm = document.querySelector("#newForm");
const newFormStatus = document.querySelector("#newFormStatus");
const newFormReviewButton = document.querySelector("#newFormReviewButton");
const newLocationReview = document.querySelector("#newLocationReview");
const newLocationReviewHeading = document.querySelector("#new-location-review-heading");
const newLocationReviewData = document.querySelector("#newLocationReviewData");
const confirmLocationSaveButton = document.querySelector("#confirmLocationSaveButton");
const addAnotherLocationButton = document.querySelector("#addAnotherLocationButton");
const locationApiStatus = document.querySelector("#locationApiStatus");
const accountLocationsStatus = document.querySelector("#accountLocationsStatus");
const accountLocationsList = document.querySelector("#accountLocationsList");
const accountLocationDetailStatus = document.querySelector("#accountLocationDetailStatus");
const accountLocationDetails = document.querySelector("#accountLocationDetails");
const accountLocationDetailId = document.querySelector("#accountLocationDetailId");
const accountLocationDetailStreet = document.querySelector("#accountLocationDetailStreet");
const accountLocationDetailUnit = document.querySelector("#accountLocationDetailUnit");
const accountLocationDetailType = document.querySelector("#accountLocationDetailType");
const accountLocationDetailOccupancy = document.querySelector("#accountLocationDetailOccupancy");
const accountLocationDetailCity = document.querySelector("#accountLocationDetailCity");
const accountLocationDetailState = document.querySelector("#accountLocationDetailState");
const accountLocationDetailPostalCode = document.querySelector("#accountLocationDetailPostalCode");
const newSidebar = document.querySelector("#newSidebar");
const primaryNavigation = document.querySelector("#primaryNavigation");
const menuButton = document.querySelector(".navbar-toggler");
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
let previousView = "schedule";
let selectedAccountLocationId;
let pendingAccountLocationId;

const getClientContactCards = () => Array.from(document.querySelectorAll("[data-client-contact]"));
const clientRoles = ["owner", "manager", "tenant"];
const emailAddressPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const setControlsDisabled = (container, disabled) => {
  container?.querySelectorAll("input, select, textarea, button").forEach((control) => {
    control.disabled = disabled;
  });
};

const animateCardEntrance = (card) => {
  if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  card.classList.remove("app-card-enter");
  requestAnimationFrame(() => card.classList.add("app-card-enter"));
  card.addEventListener("animationend", () => card.classList.remove("app-card-enter"), { once: true });
};

const updateLocationOccupancy = () => {
  const shouldShowOccupancy =
    (includeLocation?.checked ?? false) && locationType?.value === "rental";

  if (locationOccupancyField) {
    locationOccupancyField.hidden = !shouldShowOccupancy;
  }

  if (locationOccupancy) {
    locationOccupancy.disabled = !shouldShowOccupancy;
    locationOccupancy.required = shouldShowOccupancy;

    if (!shouldShowOccupancy) {
      locationOccupancy.value = "";
    }
  }

  locationType?.setAttribute("aria-expanded", String(shouldShowOccupancy));
};

const updateLocationFields = () => {
  const shouldShowLocation = includeLocation?.checked ?? false;

  if (!shouldShowLocation && locationFields?.contains(document.activeElement)) {
    includeLocation?.focus();
  }

  if (locationFields) {
    locationFields.hidden = !shouldShowLocation;
    setControlsDisabled(locationFields, !shouldShowLocation);
  }

  updateLocationOccupancy();
};

includeLocation?.addEventListener("change", updateLocationFields);
locationType?.addEventListener("change", updateLocationOccupancy);
updateLocationFields();

const updateClientFields = () => {
  const shouldShowClient = includeClient?.checked ?? false;

  if (!shouldShowClient && clientFields?.contains(document.activeElement)) {
    includeClient?.focus();
  }

  if (clientFields) {
    clientFields.hidden = !shouldShowClient;
  }

  if (clientRoleOptions) {
    clientRoleOptions.hidden = !shouldShowClient;
    clientRoleOptions.classList.toggle("d-none", !shouldShowClient);
    clientRoleOptions.classList.toggle("d-grid", shouldShowClient);
  }
  includeClient?.setAttribute("aria-expanded", String(shouldShowClient));

  getClientContactCards().forEach((card) => {
    const shouldEnableCard = shouldShowClient && !card.hidden;
    setControlsDisabled(card, !shouldEnableCard);

    if (shouldEnableCard) {
      updateClientContactDetails(card);
    }
  });

  clientRoleToggles.forEach((toggle) => {
    toggle.disabled = !shouldShowClient;
    const role = toggle.dataset.clientRoleToggle;
    const sourceOptions = document.querySelector(
      `[data-client-source-options="${role}"]`,
    );
    const shouldShowSourceOptions = shouldShowClient && toggle.checked;

    if (sourceOptions) {
      sourceOptions.hidden = !shouldShowSourceOptions;
      sourceOptions.classList.toggle("d-none", !shouldShowSourceOptions);
    }
    toggle.setAttribute("aria-expanded", String(shouldShowSourceOptions));
  });

  clientSourceToggles.forEach((toggle) => {
    const roleToggle = document.querySelector(`[data-client-role-toggle="${toggle.dataset.role}"]`);
    const priorityToggle = document.querySelector(
      `[data-client-priority-toggle][data-role="${toggle.dataset.role}"][data-priority="${toggle.dataset.priority}"]`,
    );
    toggle.disabled = !shouldShowClient || !roleToggle?.checked || !priorityToggle?.checked;
  });

  clientPriorityToggles.forEach((toggle) => {
    const roleToggle = document.querySelector(`[data-client-role-toggle="${toggle.dataset.role}"]`);
    const priorityOptions = document.querySelector(
      `[data-client-priority-options="${toggle.dataset.role}"]`,
    );
    const shouldShowPriorityOptions = shouldShowClient && roleToggle?.checked;

    if (priorityOptions) {
      priorityOptions.hidden = !shouldShowPriorityOptions;
      priorityOptions.classList.toggle("d-none", !shouldShowPriorityOptions);
      priorityOptions.classList.toggle("d-grid", shouldShowPriorityOptions);
    }
    toggle.disabled = !shouldShowPriorityOptions;
  });

  document.querySelectorAll("[data-client-priority-panel]").forEach((priorityPanel) => {
    const priorityToggle = document.querySelector(
      `[data-client-priority-toggle][data-role="${priorityPanel.dataset.role}"][data-priority="${priorityPanel.dataset.priority}"]`,
    );
    const shouldShowPriorityPanel = shouldShowClient && priorityToggle?.checked;

    priorityPanel.hidden = !shouldShowPriorityPanel;
    setControlsDisabled(priorityPanel, !shouldShowPriorityPanel);
  });

  const ownerPrimarySource = document.querySelector(
    '[data-client-source-toggle][data-role="owner"][data-priority="primary"]:checked',
  );
  const shouldShowLinkOption = shouldShowClient && Boolean(ownerPrimarySource);

  includeLinkOption?.classList.toggle("d-none", !shouldShowLinkOption);

  if (includeLinks) {
    includeLinks.disabled = !shouldShowLinkOption;

    if (!shouldShowLinkOption) {
      includeLinks.checked = false;
    }
  }

  updateLinkFields();

  updateClientContactModel();
};

includeClient?.addEventListener("change", () => {
  if (!includeClient.checked) {
    clientRoleToggles.forEach((toggle) => {
      toggle.checked = false;
    });
    clientSourceToggles.forEach((toggle) => {
      toggle.checked = false;
    });
    clientPriorityToggles.forEach((toggle) => {
      toggle.checked = false;
    });
    document.querySelectorAll('input[name="tenantType"]').forEach((tenantType) => {
      tenantType.checked = false;
      tenantType.setAttribute("aria-expanded", "false");
    });
    getClientContactCards().forEach((card) => {
      card.hidden = true;
      setControlsDisabled(card, true);
    });
  }

  updateClientFields();
});

const updateAppointmentFields = () => {
  const shouldShowAppointment = includeAppointment?.checked ?? false;

  if (appointmentFields) {
    appointmentFields.hidden = !shouldShowAppointment;
    setControlsDisabled(appointmentFields, !shouldShowAppointment);
  }
};

includeAppointment?.addEventListener("change", updateAppointmentFields);
updateAppointmentFields();

const updateLinkFields = () => {
  const shouldShowLinks = includeLinks?.checked ?? false;

  if (linkFields) {
    linkFields.hidden = !shouldShowLinks;
    setControlsDisabled(linkFields, !shouldShowLinks);
  }
};

includeLinks?.addEventListener("change", updateLinkFields);
updateLinkFields();

document.querySelectorAll("[data-card-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const cardBody = document.querySelector(`#${button.getAttribute("aria-controls")}`);

    if (!cardBody) {
      return;
    }

    const shouldExpand = cardBody.hidden;
    const cardName = button.getAttribute("aria-label")?.replace(/^(Minimize|Expand) /, "") ?? "section";

    cardBody.hidden = !shouldExpand;
    button.setAttribute("aria-expanded", String(shouldExpand));
    button.setAttribute("aria-label", `${shouldExpand ? "Minimize" : "Expand"} ${cardName}`);
    button.querySelector("[aria-hidden]")?.replaceChildren(shouldExpand ? "−" : "+");
  });
});

const updateClientContactDetails = (card, shouldFocusDetails = false) => {
  const selectedRole = card.querySelector('input[type="radio"][name$="Role"]:checked');
  const rolePicker = card.querySelector(":scope > fieldset");
  const contactCard = card.querySelector(":scope > section");
  const details = card.querySelector("[data-contact-details]");
  const organizationField = card.querySelector("[data-contact-organization]");

  if (!rolePicker || !contactCard || !details) {
    return;
  }

  rolePicker.hidden = Boolean(selectedRole);
  contactCard.hidden = !selectedRole;
  details.hidden = !selectedRole;
  setControlsDisabled(details, !selectedRole);

  if (organizationField) {
    const tenantType = document.querySelector('input[name="tenantType"]:checked')?.value;
    const shouldShowOrganization = selectedRole?.value !== "tenant" || tenantType === "commercial";

    organizationField.hidden = !shouldShowOrganization;
    setControlsDisabled(organizationField, !shouldShowOrganization);
  }

  card.querySelectorAll('input[type="radio"][name$="Role"]').forEach((input) => {
    input.setAttribute("aria-expanded", String(Boolean(selectedRole)));
  });

  if (selectedRole && shouldFocusDetails) {
    details.querySelector('input[type="text"]')?.focus();
  }
};

const updateClientContactModel = () => {
  const activeContacts = getClientContactCards().filter((card) => !card.hidden && card.dataset.role);

  clientRoles.forEach((role) => {
    const roleContacts = activeContacts.filter((card) => card.dataset.role === role);
    const roleCard = document.querySelector(`[data-client-role-card="${role}"]`);
    const roleContactContainers = document.querySelectorAll(`[data-role-contacts="${role}"]`);
    const roleLookups = document.querySelectorAll(`[data-client-role-lookup="${role}"]`);
    const roleToggle = document.querySelector(`[data-client-role-toggle="${role}"]`);
    const selectedSources = document.querySelectorAll(
      `[data-client-source-toggle][data-role="${role}"]:checked`,
    );
    const swapButton = document.querySelector(`[data-swap-role-priority="${role}"]`);
    const tenantType = role === "tenant" ? document.querySelector("[data-tenant-type]") : null;
    const selectedTenantType = tenantType?.querySelector("input:checked")?.value;
    const primaryTenantSource = role === "tenant"
      ? document.querySelector(
          '[data-client-source-toggle][data-role="tenant"][data-priority="primary"]:checked',
        )
      : null;
    const needsTenantType = primaryTenantSource?.value === "new";
    const tenantDetailsReady = role !== "tenant" || !needsTenantType || Boolean(selectedTenantType);

    roleContacts
      .sort((first, second) => (first.dataset.priority === "primary" ? -1 : 1))
      .forEach((contact) => {
        const contactContainer = document.querySelector(
          `[data-role-contacts="${role}"][data-priority="${contact.dataset.priority}"]`,
        );

        contactContainer?.append(contact);
        const heading = contact.querySelector(":scope > section .app-detail-heading");
        const purposeOptions = contact.querySelector("[data-contact-purpose]");
        const shouldShowPurposeOptions = roleContacts.length === 2;

        setControlsDisabled(contact, !tenantDetailsReady);

        if (tenantDetailsReady) {
          updateClientContactDetails(contact);
        }

        if (heading) {
          heading.textContent = capitalize(contact.dataset.priority);
        }

        if (purposeOptions) {
          purposeOptions.hidden = !shouldShowPurposeOptions;
          setControlsDisabled(purposeOptions, !shouldShowPurposeOptions);
        }
      });

    if (roleCard) {
      roleCard.hidden = !roleToggle?.checked || selectedSources.length === 0;
    }

    if (tenantType) {
      const shouldShowTenantType = needsTenantType;
      tenantType.hidden = !shouldShowTenantType;
      setControlsDisabled(tenantType, !shouldShowTenantType);
    }

    roleLookups.forEach((roleLookup) => {
      const selectedSource = document.querySelector(
        `[data-client-source-toggle][data-role="${role}"][data-priority="${roleLookup.dataset.priority}"]:checked`,
      );
      const shouldShowLookup = selectedSource?.value === "find";

      roleLookup.hidden = !shouldShowLookup;
      setControlsDisabled(roleLookup, !shouldShowLookup);
    });

    roleContactContainers.forEach((contactContainer) => {
      const shouldShowNewContact =
        tenantDetailsReady &&
        roleContacts.some((contact) => contact.dataset.priority === contactContainer.dataset.priority);

      contactContainer.hidden = !shouldShowNewContact;
      contactContainer.classList.toggle("d-none", !shouldShowNewContact);
    });

    if (swapButton) {
      const shouldShowSwap = roleContacts.length === 2;
      const primarySourceRow = document.querySelector(
        `[data-client-source-group][data-role="${role}"][data-priority="primary"] [data-client-source-row]`,
      );

      primarySourceRow?.append(swapButton);
      swapButton.classList.toggle("ms-auto", shouldShowSwap);
      swapButton.hidden = !shouldShowSwap;
      swapButton.disabled = !shouldShowSwap;
    }
  });

  getClientContactCards().filter((card) => !card.hidden).forEach((card) => {
    card.querySelectorAll('input[type="radio"][name$="Role"]').forEach((input) => {
      const roleCountWithoutCard = activeContacts.filter(
        (contact) => contact !== card && contact.dataset.role === input.value,
      ).length;

      input.disabled = roleCountWithoutCard >= 2 && !input.checked;
    });
  });

};

document.querySelectorAll('input[name="tenantType"]').forEach((tenantType) => {
  tenantType.addEventListener("change", () => {
    updateClientContactModel();
    document.querySelectorAll('input[name="tenantType"]').forEach((input) => {
      input.setAttribute("aria-expanded", String(input.checked));
    });
    focusClientContact("tenant", "primary");
  });
});

const initializeClientContact = (card) => {
  if (card.dataset.initialized === "true") {
    return;
  }

  card.dataset.initialized = "true";

  card.querySelectorAll('input[type="radio"][name$="Role"]').forEach((input) => {
    input.addEventListener("change", () => {
      const roleCard = document.querySelector(`[data-client-role-card="${input.value}"]`);
      const shouldAnimateRoleCard = roleCard?.hidden;

      card.dataset.role = input.value;

      const sameRoleContacts = getClientContactCards().filter(
        (contact) => !contact.hidden && contact !== card && contact.dataset.role === input.value,
      );

      card.dataset.priority = sameRoleContacts.length === 0 ? "primary" : "secondary";
      document
        .querySelector(`[data-role-contacts="${input.value}"][data-priority="${card.dataset.priority}"]`)
        ?.append(card);
      updateClientContactDetails(card, true);
      updateClientContactModel();
      animateCardEntrance(card.querySelector(":scope > section"));

      if (shouldAnimateRoleCard) {
        animateCardEntrance(roleCard);
      }
    });
  });

  updateClientContactDetails(card);
};

clientRoleCards.forEach((roleCard) => {
  roleCard.querySelector("[data-swap-role-priority]")?.addEventListener("click", () => {
    const role = roleCard.dataset.clientRoleCard;
    const roleContacts = getClientContactCards().filter(
      (contact) => !contact.hidden && contact.dataset.role === role,
    );

    if (!role || roleContacts.length !== 2) {
      return;
    }

    roleContacts.forEach((contact) => {
      contact.dataset.priority = contact.dataset.priority === "primary" ? "secondary" : "primary";
    });

    updateClientContactModel();

  });
});

getClientContactCards().forEach(initializeClientContact);
updateClientFields();

const createClientContact = () => {
  const contactCards = getClientContactCards();
  let newContact = contactCards.find((card) => card.hidden && !card.dataset.role);

  if (!newContact && contactCards.length < 6) {
    const sourceContact = contactCards[1];
    const sourceKey = sourceContact.dataset.contactKey;
    const contactNumber = contactCards.length + 1;
    const contactKey = String.fromCharCode(64 + contactNumber);

    newContact = sourceContact.cloneNode(true);
    newContact.querySelectorAll("[data-swap-role-priority]").forEach((button) => button.remove());
    newContact.dataset.contactKey = contactKey;
    newContact.dataset.initialized = "false";
    delete newContact.dataset.role;
    delete newContact.dataset.priority;

    [newContact, ...newContact.querySelectorAll("*")].forEach((element) => {
      ["id", "name", "for", "aria-controls", "aria-labelledby"].forEach((attribute) => {
        const value = element.getAttribute(attribute);

        if (value) {
          element.setAttribute(
            attribute,
            value
              .replaceAll(`Contact${sourceKey}`, `Contact${contactKey}`)
              .replaceAll(`-${sourceKey.toLowerCase()}-`, `-${contactKey.toLowerCase()}-`),
          );
        }
      });
    });

    newContact.querySelectorAll("input").forEach((input) => {
      input.checked = false;
      input.value = input.type === "radio" || input.type === "checkbox" ? input.value : "";
    });

    clientContacts?.append(newContact);
  }

  return newContact;
};

const showClientContact = (role, priority) => {
  let contact = getClientContactCards().find(
    (card) => card.dataset.role === role && card.dataset.priority === priority,
  );
  const roleCard = document.querySelector(`[data-client-role-card="${role}"]`);
  const shouldAnimateRoleCard = roleCard?.hidden;

  if (!contact) {
    contact = createClientContact();
  }

  if (!contact) {
    return;
  }

  contact.dataset.role = role;
  contact.dataset.priority = priority;
  contact.hidden = false;
  contact.querySelector(":scope > fieldset").hidden = true;
  contact.querySelector(`input[type="radio"][name$="Role"][value="${role}"]`).checked = true;
  document
    .querySelector(`[data-role-contacts="${role}"][data-priority="${priority}"]`)
    ?.append(contact);
  initializeClientContact(contact);
  setControlsDisabled(contact, false);
  updateClientContactDetails(contact);
  updateClientContactModel();
  animateCardEntrance(contact.querySelector(":scope > section"));

  if (shouldAnimateRoleCard) {
    animateCardEntrance(roleCard);
  }
};

const focusClientContact = (role, priority) => {
  const contact = getClientContactCards().find(
    (card) => !card.hidden && card.dataset.role === role && card.dataset.priority === priority,
  );
  const firstField = contact?.querySelector(
    '[data-contact-details] input:not([type="radio"]):not([type="checkbox"]):not(:disabled)',
  );

  firstField?.focus();
};

const moveNewSidebarAside = (focusTarget) => {
  const moveFocus = () => {
    requestAnimationFrame(focusTarget);
  };

  if (!window.matchMedia("(max-width: 1199.98px)").matches || !newSidebar?.classList.contains("show")) {
    moveFocus();
    return;
  }

  newSidebar.addEventListener("hidden.bs.offcanvas", moveFocus, { once: true });
  window.bootstrap?.Offcanvas.getOrCreateInstance(newSidebar).hide();
};

const focusNewClientDetails = (role, priority) => {
  moveNewSidebarAside(() => {
    const tenantType = document.querySelector("[data-tenant-type]");

    if (role === "tenant" && !tenantType?.hidden && !tenantType.querySelector("input:checked")) {
      tenantType?.querySelector("input:not(:disabled)")?.focus();
    } else {
      focusClientContact(role, priority);
    }
  });
};

const hideClientContact = (role, priority) => {
  const contact = getClientContactCards().find(
    (card) => !card.hidden && card.dataset.role === role && card.dataset.priority === priority,
  );

  if (!contact) {
    return;
  }

  contact.hidden = true;
  setControlsDisabled(contact, true);
  clientContacts?.append(contact);
  updateClientContactModel();
};

clientRoleToggles.forEach((roleToggle) => {
  roleToggle.addEventListener("change", () => {
    const role = roleToggle.dataset.clientRoleToggle;
    const sourceToggles = document.querySelectorAll(`[data-client-source-toggle][data-role="${role}"]`);
    const priorityToggles = document.querySelectorAll(`[data-client-priority-toggle][data-role="${role}"]`);
    const primaryPriority = document.querySelector(
      `[data-client-priority-toggle][data-role="${role}"][data-priority="primary"]`,
    );

    if (roleToggle.checked) {
      const primaryNew = document.querySelector(
        `[data-client-source-toggle][data-role="${role}"][data-priority="primary"][value="new"]`,
      );

      primaryPriority.checked = true;
      primaryNew.checked = true;
      showClientContact(role, "primary");
      updateClientFields();
      focusNewClientDetails(role, "primary");
      return;
    } else {
      sourceToggles.forEach((toggle) => {
        toggle.checked = false;
      });
      priorityToggles.forEach((toggle) => {
        toggle.checked = false;
      });
      if (role === "tenant") {
        document.querySelectorAll('input[name="tenantType"]').forEach((tenantType) => {
          tenantType.checked = false;
          tenantType.setAttribute("aria-expanded", "false");
        });
      }
      hideClientContact(role, "secondary");
      hideClientContact(role, "primary");
    }

    updateClientFields();
  });
});

clientPriorityToggles.forEach((priorityToggle) => {
  priorityToggle.addEventListener("change", () => {
    const { role, priority } = priorityToggle.dataset;
    const roleToggle = document.querySelector(`[data-client-role-toggle="${role}"]`);
    const sourceToggles = document.querySelectorAll(
      `[data-client-source-toggle][data-role="${role}"][data-priority="${priority}"]`,
    );

    if (priorityToggle.checked) {
      roleToggle.checked = true;
      const selectedSource = Array.from(sourceToggles).find((source) => source.checked);
      const newSource = Array.from(sourceToggles).find((source) => source.value === "new");

      if (!selectedSource) {
        newSource.checked = true;
      }

      showClientContact(role, priority);
      updateClientFields();
      focusNewClientDetails(role, priority);
      return;
    }

    sourceToggles.forEach((source) => {
      source.checked = false;
    });
    hideClientContact(role, priority);

    if (priority === "primary") {
      const secondaryPriority = document.querySelector(
        `[data-client-priority-toggle][data-role="${role}"][data-priority="secondary"]`,
      );
      const secondarySources = document.querySelectorAll(
        `[data-client-source-toggle][data-role="${role}"][data-priority="secondary"]`,
      );

      roleToggle.checked = false;
      secondaryPriority.checked = false;
      secondarySources.forEach((source) => {
        source.checked = false;
      });
      if (role === "tenant") {
        document.querySelectorAll('input[name="tenantType"]').forEach((tenantType) => {
          tenantType.checked = false;
          tenantType.setAttribute("aria-expanded", "false");
        });
      }
      hideClientContact(role, "secondary");
    }

    updateClientFields();
  });
});

clientSourceToggles.forEach((sourceToggle) => {
  sourceToggle.addEventListener("change", () => {
    const role = sourceToggle.dataset.role;
    const priority = sourceToggle.dataset.priority;

    if (sourceToggle.value === "new") {
      showClientContact(role, priority);
    } else {
      hideClientContact(role, priority);
    }

    updateClientFields();

    if (sourceToggle.value === "new") {
      focusNewClientDetails(role, priority);
    } else if (sourceToggle.value === "find") {
      moveNewSidebarAside(() => {
        document
          .querySelector(`[data-client-role-lookup="${role}"][data-priority="${priority}"] input`)
          ?.focus();
      });
    }
  });
});

includeLinks?.addEventListener("change", () => {
  if (!includeLinks.checked) {
    return;
  }

  updateLinkFields();
  moveNewSidebarAside(() => document.querySelector("#relatedRecordLookup")?.focus());
});

const validateNewFormRules = () => {
  const activeContacts = includeClient?.checked
    ? getClientContactCards().filter((card) => !card.hidden)
    : [];
  const hasSelectedDetails =
    (includeLocation?.checked ?? false) ||
    (includeClient?.checked ?? false) ||
    (includeAppointment?.checked ?? false);
  const hasSelectedClientRole = Array.from(clientRoleToggles).some((toggle) => toggle.checked);

  includeLocation?.setCustomValidity(hasSelectedDetails ? "" : "Select at least one detail to add.");
  includeClient?.setCustomValidity(
    includeClient.checked && !hasSelectedClientRole
      ? "Select at least one client role."
      : "",
  );

  activeContacts.forEach((card) => {
    card.querySelectorAll("input").forEach((input) => input.setCustomValidity(""));
  });

  const billingRoles = new Map();
  const roleCounts = activeContacts.reduce((counts, card) => {
    const role = card.dataset.role;

    if (role) {
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }

    return counts;
  }, new Map());

  activeContacts.forEach((card) => {
    const role = card.querySelector('input[name$="Role"]:checked');
    const email = card.querySelector('input[name$="Email"]');
    const mobile = card.querySelector('input[name$="Mobile"]');
    const billing = card.querySelector(
      'input[name$="Purpose"][value="billing"]:checked, input[name$="Purpose"][value="both"]:checked',
    );

    const emailValue = email?.value.trim() ?? "";
    const mobileValue = mobile?.value.trim() ?? "";

    if (emailValue && !emailAddressPattern.test(emailValue)) {
      email.setCustomValidity("Enter a complete email address, such as name@example.com.");
    } else if (email && mobile && !emailValue && !mobileValue) {
      email.setCustomValidity("Enter an email address or mobile number.");
    }

    if (role) {
      const roleCount = roleCounts.get(role.value) ?? 0;

      if (roleCount > 2) {
        role.setCustomValidity(`Only two ${role.value} contacts are allowed.`);
      }
    }

    if (billing && role && roleCounts.get(role.value) === 2) {
      if (billingRoles.has(role.value)) {
        billing.setCustomValidity(`Only one billing contact is allowed for the ${role.value} role.`);
      } else {
        billingRoles.set(role.value, card);
      }
    }
  });

  if (
    activeContacts.length &&
    !Array.from(roleCounts.values()).some((count) => count === 1) &&
    !activeContacts.some((card) =>
      card.querySelector(
        'input[name$="Purpose"][value="billing"]:checked, input[name$="Purpose"][value="both"]:checked',
      ),
    )
  ) {
    activeContacts[0]
      .querySelector('input[name$="Purpose"][value="billing"]')
      ?.setCustomValidity("Select at least one billing contact.");
  }
};

const updateNewFormReviewState = () => {
  if (!newForm || !newFormReviewButton) {
    return;
  }

  validateNewFormRules();
  newFormReviewButton.disabled = !newForm.checkValidity();
  newLocationReview?.setAttribute("hidden", "");

  if (confirmLocationSaveButton) {
    confirmLocationSaveButton.disabled = true;
    confirmLocationSaveButton.textContent = "Confirm Save";
    delete confirmLocationSaveButton.dataset.savedLocationId;
  }

  if (addAnotherLocationButton) {
    addAnotherLocationButton.hidden = true;
  }

  if (locationApiStatus) {
    locationApiStatus.textContent = "Not sent to Python yet.";
  }

  if (!newFormStatus) {
    return;
  }

  const hasSelectedDetails =
    (includeLocation?.checked ?? false) ||
    (includeClient?.checked ?? false) ||
    (includeAppointment?.checked ?? false);
  const hasSelectedClientRole = Array.from(clientRoleToggles).some((toggle) => toggle.checked);

  if (!hasSelectedDetails) {
    newFormStatus.textContent = "Select at least one detail to add.";
    return;
  }

  if (includeClient?.checked && !hasSelectedClientRole) {
    newFormStatus.textContent = "Select at least one client role.";
    return;
  }

  const incompleteLabels = Array.from(newForm.elements)
    .filter((control) => !control.disabled && !control.validity.valid)
    .map((control) => {
      if (control.name.endsWith("Email") && !control.value.trim()) {
        return "Email or Mobile";
      }

      return document.querySelector(`label[for="${control.id}"]`)?.textContent.trim();
    })
    .filter(Boolean)
    .filter((label, index, labels) => labels.indexOf(label) === index);

  newFormStatus.textContent = incompleteLabels.length
    ? `Complete required: ${incompleteLabels.join(", ")}.`
    : "Ready to review.";
};

const buildLocationReviewData = () => {
  const formData = new FormData(newForm);
  const locationTypeValue = formData.get("locationType");

  return {
    street: formData.get("streetAddress")?.trim() || null,
    unit: formData.get("unitNumber")?.trim() || null,
    type: locationTypeValue || null,
    occupancy:
      locationTypeValue === "rental"
        ? formData.get("locationOccupancy")?.trim() || null
        : null,
    city: formData.get("city")?.trim() || null,
    state: formData.get("state") || null,
    postalCode: formData.get("postalCode")?.trim() || null,
  };
};

const formatMobileNumber = (value) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 10);

  if (digits.length <= 3) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)})${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`;
};

newForm?.addEventListener("input", (event) => {
  const mobileInput = event.target.closest("[data-mobile-input]");

  if (!mobileInput) {
    return;
  }

  mobileInput.value = formatMobileNumber(mobileInput.value);
});

document.addEventListener("input", (event) => {
  if (event.target.form === newForm || newForm?.contains(event.target)) {
    updateNewFormReviewState();
  }
});

document.addEventListener("change", (event) => {
  const isClientStructureControl = event.target.matches(
    "[data-client-role-toggle], [data-client-priority-toggle], [data-client-source-toggle]",
  );

  if (event.target.form === newForm || newForm?.contains(event.target) || isClientStructureControl) {
    updateNewFormReviewState();
  }
});

updateNewFormReviewState();

newForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  updateNewFormReviewState();
  newForm.classList.add("was-validated");

  if (!newForm.checkValidity()) {
    newForm.reportValidity();

    if (newFormStatus) {
      newFormStatus.textContent = "Please correct the required fields.";
    }

    return;
  }

  if (includeLocation?.checked && newLocationReview && newLocationReviewData) {
    newLocationReviewData.textContent = JSON.stringify(buildLocationReviewData(), null, 2);
    newLocationReview.hidden = false;
    confirmLocationSaveButton?.removeAttribute("disabled");

    if (locationApiStatus) {
      locationApiStatus.textContent = "Ready to send to Python.";
    }

    animateCardEntrance(newLocationReview);
    newLocationReviewHeading?.focus();
  }

  if (newFormStatus) {
    newFormStatus.textContent = includeLocation?.checked
      ? "Location preview generated. Nothing has been saved yet."
      : "The form is valid. Location preview is available when Location is included.";
  }
});

confirmLocationSaveButton?.addEventListener("click", async () => {
  const savedLocationId = Number(
    confirmLocationSaveButton.dataset.savedLocationId,
  );

  if (Number.isInteger(savedLocationId)) {
    pendingAccountLocationId = savedLocationId;
    window.location.hash = "accounts";
    return;
  }

  confirmLocationSaveButton.disabled = true;
  confirmLocationSaveButton.textContent = "Checking…";
  confirmLocationSaveButton.setAttribute("aria-busy", "true");

  if (locationApiStatus) {
    locationApiStatus.textContent = "Python is validating the Location.";
  }

  try {
    const response = await fetch("/api/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildLocationReviewData()),
    });
    const result = await response.json();

    if (response.status === 409 && result.duplicate) {
      confirmLocationSaveButton.dataset.savedLocationId = String(result.id);
      confirmLocationSaveButton.disabled = false;
      confirmLocationSaveButton.textContent = "View Existing";
      addAnotherLocationButton?.removeAttribute("hidden");

      if (locationApiStatus) {
        locationApiStatus.textContent = result.error;
      }

      return;
    }

    if (!response.ok) {
      throw new Error(result.error || "Python could not validate the Location.");
    }

    if (result.saved) {
      confirmLocationSaveButton.dataset.savedLocationId = String(result.id);
      confirmLocationSaveButton.disabled = false;
      confirmLocationSaveButton.textContent = "View in Accounts";
      addAnotherLocationButton?.removeAttribute("hidden");
    } else {
      confirmLocationSaveButton.textContent = "Validated";
    }

    if (locationApiStatus) {
      locationApiStatus.textContent = result.saved
        ? `${result.message} Location #${result.id}.`
        : `${result.message} Nothing has been saved yet.`;
    }
  } catch (error) {
    confirmLocationSaveButton.disabled = false;
    confirmLocationSaveButton.textContent = "Try Again";

    if (locationApiStatus) {
      locationApiStatus.textContent =
        error instanceof Error
          ? error.message
          : "Python could not validate the Location.";
    }
  } finally {
    confirmLocationSaveButton.removeAttribute("aria-busy");
  }
});

addAnotherLocationButton?.addEventListener("click", () => {
  newForm?.reset();
  newForm?.classList.remove("was-validated");

  if (includeLocation) {
    includeLocation.checked = true;
  }

  updateLocationFields();
  updateClientFields();
  updateAppointmentFields();
  updateLinkFields();
  updateClientContactModel();
  updateNewFormReviewState();

  moveNewSidebarAside(() => {
    document.querySelector("#streetAddress")?.focus();
  });
});

const loadAccountLocations = async (locationIdToSelect) => {
  if (!accountLocationsStatus || !accountLocationsList) {
    return;
  }

  accountLocationsStatus.textContent = "Loading Locations…";
  accountLocationsList.hidden = true;
  accountLocationsList.replaceChildren();
  selectedAccountLocationId = undefined;

  if (accountLocationDetailStatus) {
    accountLocationDetailStatus.textContent =
      "Select a Location to view its details.";
  }

  if (accountLocationDetails) {
    accountLocationDetails.hidden = true;
  }

  try {
    const response = await fetch("/api/locations");
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Python could not retrieve Locations.");
    }

    if (!result.locations.length) {
      accountLocationsStatus.textContent = "No Locations yet.";
      return;
    }

    result.locations.forEach((location) => {
      const listItem = document.createElement("button");
      const unit = location.unit ? `, Unit ${location.unit}` : "";
      const occupancy = location.occupancy
        ? `, ${capitalize(location.occupancy)}`
        : "";

      listItem.className = "list-group-item list-group-item-action";
      listItem.type = "button";
      listItem.dataset.locationId = String(location.id);
      listItem.setAttribute("aria-pressed", "false");
      listItem.textContent =
        `#${location.id} — ${location.street}${unit}, ` +
        `${location.city}, ${location.state} ${location.postalCode} — ` +
        `${capitalize(location.type)}${occupancy}`;
      accountLocationsList.append(listItem);
    });

    accountLocationsStatus.textContent =
      `${result.count} ${result.count === 1 ? "Location" : "Locations"}.`;
    accountLocationsList.hidden = false;

    if (Number.isInteger(locationIdToSelect)) {
      const savedLocationButton = accountLocationsList.querySelector(
        `[data-location-id="${locationIdToSelect}"]`,
      );

      savedLocationButton?.click();
      savedLocationButton?.focus();
    }
  } catch (error) {
    accountLocationsStatus.textContent =
      error instanceof Error
        ? error.message
        : "Python could not retrieve Locations.";
  }
};

const loadAccountLocationDetails = async (locationId) => {
  if (!accountLocationDetailStatus || !accountLocationDetails) {
    return;
  }

  accountLocationDetailStatus.textContent = `Loading Location #${locationId}…`;
  accountLocationDetails.hidden = true;

  try {
    const response = await fetch(`/api/locations/${locationId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Python could not retrieve the Location.");
    }

    if (selectedAccountLocationId !== locationId) {
      return;
    }

    const location = result.location;

    accountLocationDetailId.textContent = location.id;
    accountLocationDetailStreet.textContent = location.street;
    accountLocationDetailUnit.textContent = location.unit || "—";
    accountLocationDetailType.textContent = capitalize(location.type);
    accountLocationDetailOccupancy.textContent = location.occupancy
      ? capitalize(location.occupancy)
      : "—";
    accountLocationDetailCity.textContent = location.city;
    accountLocationDetailState.textContent = location.state;
    accountLocationDetailPostalCode.textContent = location.postalCode;
    accountLocationDetailStatus.textContent = `Location #${location.id}.`;
    accountLocationDetails.hidden = false;
  } catch (error) {
    if (selectedAccountLocationId !== locationId) {
      return;
    }

    accountLocationDetailStatus.textContent =
      error instanceof Error
        ? error.message
        : "Python could not retrieve the Location.";
  }
};

accountLocationsList?.addEventListener("click", (event) => {
  const selectedLocation = event.target.closest("[data-location-id]");

  if (!selectedLocation || !accountLocationsList.contains(selectedLocation)) {
    return;
  }

  selectedAccountLocationId = Number(selectedLocation.dataset.locationId);

  accountLocationsList.querySelectorAll("[data-location-id]").forEach((locationButton) => {
    const isSelected = locationButton === selectedLocation;

    locationButton.classList.toggle("active", isSelected);
    locationButton.setAttribute("aria-pressed", String(isSelected));
  });

  if (accountLocationsStatus) {
    accountLocationsStatus.textContent =
      `Location #${selectedLocation.dataset.locationId} selected.`;
  }

  loadAccountLocationDetails(selectedAccountLocationId);
});

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

  const isNewView = viewName === "new";
  newButtons.forEach((button) => {
    button.classList.toggle("active", isNewView);

    if (isNewView) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  if (viewName === "accounts") {
    const locationIdToSelect = pendingAccountLocationId;

    pendingAccountLocationId = undefined;
    loadAccountLocations(locationIdToSelect);
  }
};

const showViewFromHash = () => {
  const requestedView = window.location.hash.slice(1);
  const availableViews = ["schedule", "accounts", "billing", "operations", "preferences", "new"];
  showAppView(availableViews.includes(requestedView) ? requestedView : "schedule");
};

window.addEventListener("hashchange", showViewFromHash);
showViewFromHash();

let activeNewButton;

newButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const currentView = window.location.hash.slice(1);

    if (currentView && currentView !== "new") {
      previousView = currentView;
    }

    activeNewButton = button;
    window.location.hash = "new";
    showAppView("new");
    window.bootstrap?.Collapse.getOrCreateInstance(primaryNavigation, { toggle: false }).hide();

    document.querySelectorAll(".app-sidebar.show, .app-sidebar.showing").forEach((sidebar) => {
      window.bootstrap?.Offcanvas.getOrCreateInstance(sidebar).hide();
    });

    if (includeLocation?.checked) {
      document.querySelector("#streetAddress")?.focus();
    } else {
      includeLocation?.focus();
    }
  });
});

cancelNewButton?.addEventListener("click", () => {
  window.location.hash = previousView;
  showAppView(previousView);

  if (activeNewButton?.offsetParent) {
    activeNewButton.focus();
  } else {
    menuButton?.focus();
  }
});

primaryNavigation?.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-link") || window.matchMedia("(min-width: 1200px)").matches) {
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
