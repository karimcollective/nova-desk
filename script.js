/* ==========================================================================
   NovaDesk — script.js
   Handles: sticky/shrinking navbar, mobile menu, dark/light theme,
   scroll-to-booking triggers, form validation + Formspree submission.
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
    document.getElementById("year").textContent = new Date().getFullYear();
  });

  /* ---------------- Theme (dark / light) ---------------- */
  function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById("themeToggle");
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
    const onScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add("is-scrolled");
      } else {
        navbar.classList.remove("is-scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Mobile hamburger menu ---------------- */
  function initMobileMenu() {
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("mobileMenu");

    hamburger.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      hamburger.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Smooth scroll + highlight the booking card ---------------- */
  function initScrollToBooking() {
    const triggers = document.querySelectorAll(".js-scroll-booking");
    const bookingSection = document.getElementById("booking");
    const bookingCard = document.getElementById("bookingCard");

    triggers.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
        bookingCard.classList.add("is-highlighted");
        window.clearTimeout(initScrollToBooking._t);
        initScrollToBooking._t = window.setTimeout(() => {
          bookingCard.classList.remove("is-highlighted");
        }, 1600);
        const firstField = document.getElementById("fullName");
        window.setTimeout(() => firstField && firstField.focus({ preventScroll: true }), 500);
      });
    });
  }

  /* ---------------- Booking form: validation + submission ---------------- */
  function initBookingForm() {
    const form = document.getElementById("bookingForm");
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

    // Prevent picking a date in the past.
    fields.visitDate.min = new Date().toISOString().split("T")[0];

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const errors = validate();
      if (Object.keys(errors).length > 0) {
        showErrors(errors);
        return;
      }

      setLoading(true);

      try {
        const payload = {
          name: fields.fullName.value.trim(),
          email: fields.email.value.trim(),
          date: fields.visitDate.value,
          deskType: fields.deskType.value,
        };

        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Request failed");

        showSuccess(payload);
      } catch (err) {
        setLoading(false);
        showErrors({ fullName: "" });
        const note = document.querySelector(".form-note");
        note.textContent = "Something went wrong sending your request — please try again in a moment.";
        note.style.color = "#EF4444";
      }
    });

    bookAnotherBtn.addEventListener("click", () => {
      form.reset();
      setLoading(false);
      successPanel.hidden = true;
      formWrap.hidden = false;
    });

    function validate() {
      const errs = {};
      if (!fields.fullName.value.trim()) {
        errs.fullName = "Please enter your name.";
      }
      const emailVal = fields.email.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        errs.email = "Please enter your email.";
      } else if (!emailPattern.test(emailVal)) {
        errs.email = "Please enter a valid email address.";
      }
      if (!fields.visitDate.value) {
        errs.visitDate = "Please choose a date.";
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
        if (input) input.classList.add("is-invalid");
        if (errorEl) errorEl.textContent = errs[key] || "";
      });
    }

    function clearErrors() {
      Object.values(fields).forEach((input) => input.classList.remove("is-invalid"));
      document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
      const note = document.querySelector(".form-note");
      note.textContent = "We'll email you a confirmation within one business day.";
      note.style.color = "";
    }

    function setLoading(isLoading) {
      submitBtn.disabled = isLoading;
      submitBtn.querySelector(".btn-label").textContent = isLoading ? "Sending…" : "Submit Request";
    }

    function showSuccess(payload) {
      const prettyDate = formatDate(payload.date);
      const firstName = payload.name.split(" ")[0] || payload.name;
      successHeadline.textContent = `Thanks, ${firstName}! Your pass for ${prettyDate} has been reserved.`;
      successBody.textContent = `We've sent the details to ${payload.email}. See you at the front desk.`;
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