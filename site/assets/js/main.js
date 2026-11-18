(() => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-links");
  const languageLinks = document.querySelectorAll("[data-language]");
  const languageSwitcher = document.querySelector(".language-switcher");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 16);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && menu) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
      document.body.classList.remove("menu-open");
    };

    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("open", !open);
      document.body.classList.toggle("menu-open", !open);
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  let languageNavigationPending = false;

  const resetLanguageState = () => {
    languageNavigationPending = false;
    document.body.classList.remove("language-changing");
    languageSwitcher?.classList.remove("is-switching");
    languageSwitcher?.removeAttribute("aria-busy");
    languageSwitcher?.querySelectorAll(".is-loading").forEach((link) => link.classList.remove("is-loading"));
    document.querySelector(".language-status")?.remove();
  };

  window.addEventListener("pageshow", resetLanguageState);

  languageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      try {
        localStorage.setItem("ets2ss-language", link.dataset.language);
      } catch (_) {
        // The site remains fully usable when browser storage is disabled.
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        languageNavigationPending
      ) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.pathname === window.location.pathname) return;

      event.preventDefault();
      languageNavigationPending = true;

      const targetLanguage = link.dataset.language;
      const selectedButton = languageSwitcher?.querySelector(`[data-language="${targetLanguage}"]`);
      const status = document.createElement("span");
      status.className = "sr-only language-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.textContent = targetLanguage === "pt-br" ? "Aplicando português…" : "Applying English…";

      languageSwitcher?.classList.add("is-switching");
      languageSwitcher?.setAttribute("aria-busy", "true");
      selectedButton?.classList.add("is-loading");
      languageSwitcher?.append(status);
      document.body.classList.add("language-changing");

      requestAnimationFrame(() => {
        window.setTimeout(() => window.location.assign(destination.href), prefersReducedMotion ? 40 : 180);
      });
    });
  });

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      const answer = document.getElementById(button.getAttribute("aria-controls"));
      button.setAttribute("aria-expanded", String(!expanded));
      if (answer) answer.hidden = expanded;
    });
  });

  const revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
})();
