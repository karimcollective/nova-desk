/* ==========================================================================
   NovaDesk — script.js
   Handles: theme toggle, sticky nav, mobile drawer, smooth scrolling,
   dynamic input handling, localized date validation & form submission.
   ========================================================================== */

(function () {
  "use strict";

  const FORM_ENDPOINT = "https://formspree.io/f/xwvgewkl";

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavbarScroll();
    initMobileMenu();
    initScrollToBooking();
    initBookingForm();
    
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  /* ---------------- Theme (dark / light) ---------------- */
  function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    const stored = localStorage.getItem("novadesk-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");

    setTheme(initial);

    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });

    function setTheme(mode) {
      if (mode === "dark") {
        root.setAttribute("data-theme", "dark");
        toggle.setAttribute("aria-pressed", "true");
      } else {
        root.removeAttribute("data-theme");
        toggle.setAttribute("aria-pressed", "false");
      }
      localStorage.setItem("novadesk-theme", mode);
    }
  }

  /* ---------------- Sticky / shrinking navbar ---------------- */
  function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    const onScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add("is-scrolled");
      } else {
        navbar.classList.remove("is-scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Mobile menu toggle ---------------- */
  function initMobileMenu() {
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("mobileMenu");
    if (!hamburger || !menu) return;

    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", isOpen);
      hamburger.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      menu.setAttribute("aria-hidden", String(!isOpen));
    };

    hamburger.addEventListener("click", () => toggleMenu());

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (menu.classList.contains("is-open") && !menu.contains(e.target) && !hamburger.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  /* ---------------- Smooth scroll + highlight booking card ---------------- */
  function initScrollToBooking() {
    const triggers = document.querySelectorAll(".js-scroll-booking");
    const bookingSection = document.getElementById("booking");
    const bookingCard = document.getElementById("bookingCard");

    if (!bookingSection || !bookingCard) return;

    triggers.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
        
        bookingCard.classList.add("is-highlighted");
        clearTimeout(initScrollToBooking._t);
        initScrollToBooking._t = setTimeout(() => {
          bookingCard.classList.remove("is-highlighted");
        }, 1600);

        const firstField = document.getElementById("fullName");
        setTimeout(() => {
          if (firstField) firstField.focus({ preventScroll: true });
        }, 450);
      });
    });
  }

  /* ---------------- Booking Form Validation & Processing ---------------- */
  function initBookingForm() {
    const form = document.getElementById("bookingForm");
    if (!form) return;

    const submitBtn = document.getElementById("submitBtn");
    const formWrap = document.getElementById("bookingFormWrap");
    const successPanel = document.getElementById("bookingSuccess");
    const successHeadline = document.getElementById("successHeadline");
    const successBody = document.getElementById("successBody");
    const bookAnotherBtn = document.getElementById("bookAnotherBtn");

    const fields = {
      fullName: document.getElementById("fullName"),
      email: document.getElementById("email"),
      visitDate: document.getElementById("visitDate"),
      deskType: document.getElementById("deskType"),
    };

    // Prevent selecting dates in the past (using local ISO format)
    if (fields.visitDate) {
      fields.visitDate.min = getTodayLocalISO();
    }

    function getTodayLocalISO() {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // Clear errors on user input
    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      if (!field) return;
      const eventType = field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventType, () => clearFieldError(key));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAllErrors();

      const errors = validate();
      if (Object.keys(errors).length > 0) {
        showErrors(errors);
        return;
      }

      setLoading(true);

      const payload = {
        name: fields.fullName.value.trim(),
        email: fields.email.value.trim(),
        date: fields.visitDate.value,
        deskType: fields.deskType.value,
      };

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Request failed");

        showSuccess(payload);
      } catch (err) {
        setLoading(false);
        const note = document.querySelector(".form-note");
        if (note) {
          note.textContent = "Something went wrong sending your request — please try again in a moment.";
          note.style.color = "#EF4444";
        }
      }
    });

    if (bookAnotherBtn) {
      bookAnotherBtn.addEventListener("click", () => {
        form.reset();
        setLoading(false);
        clearAllErrors();
        successPanel.hidden = true;
        formWrap.hidden = false;
      });
    }

    function validate() {
      const errs = {};
      if (!fields.fullName.value.trim()) {
        errs.fullName = "Please enter your name.";
      }

      const emailVal = fields.email.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        errs.email = "Please enter your email address.";
      } else if (!emailPattern.test(emailVal)) {
        errs.email = "Please enter a valid email address.";
      }

      if (!fields.visitDate.value) {
        errs.visitDate = "Please choose a date.";
      } else if (fields.visitDate.value < getTodayLocalISO()) {
        errs.visitDate = "Please choose a date that isn't in the past.";
      }

      if (!fields.deskType.value) {
        errs.deskType = "Please select a desk type.";
      }

      return errs;
    }

    function showErrors(errs) {
      Object.keys(errs).forEach((key) => {
        const input = fields[key];
        const errorEl = document.getElementById("err-" + key);
        if (input) {
          input.classList.add("is-invalid");
          input.setAttribute("aria-invalid", "true");
        }
        if (errorEl) errorEl.textContent = errs[key] || "";
      });

      const firstInvalidKey = Object.keys(errs)[0];
      if (firstInvalidKey && fields[firstInvalidKey]) {
        fields[firstInvalidKey].focus();
      }
    }

    function clearFieldError(key) {
      const input = fields[key];
      const errorEl = document.getElementById("err-" + key);
      if (input) {
        input.classList.remove("is-invalid");
        input.removeAttribute("aria-invalid");
      }
      if (errorEl) errorEl.textContent = "";
    }

    function clearAllErrors() {
      Object.keys(fields).forEach(clearFieldError);
      const note = document.querySelector(".form-note");
      if (note) {
        note.textContent = "We'll email you a confirmation within one business day.";
        note.style.color = "";
      }
    }

    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      const label = submitBtn.querySelector(".btn-label");
      if (label) label.textContent = isLoading ? "Sending…" : "Submit Request";
    }

    function showSuccess(payload) {
      const prettyDate = formatDate(payload.date);
      const firstName = payload.name.split(" ")[0] || payload.name;

      if (successHeadline) {
        successHeadline.textContent = `Thanks, ${firstName}! Your pass for ${prettyDate} has been reserved.`;
      }
      if (successBody) {
        successBody.textContent = `We've sent details to ${payload.email}. See you at the front desk!`;
      }

      formWrap.hidden = true;
      successPanel.hidden = false;
      setLoading(false);
    }

    function formatDate(isoDate) {
      if (!isoDate) return "your selected date";
      const [year, month, day] = isoDate.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    }
  }
})();