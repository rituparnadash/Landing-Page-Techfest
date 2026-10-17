
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.querySelector(".page-loader");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".navigation");
  const backTop = document.querySelector(".back-top");
  const filterButtons = document.querySelectorAll(".filter-button");
  const cards = document.querySelectorAll(".signal-card");
  const revealElements = document.querySelectorAll(".reveal");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Intro transition
  const dismissLoader = () => {
    if (loader) loader.classList.add("done");
  };

  if (reducedMotion) {
    dismissLoader();
  } else {
    window.setTimeout(dismissLoader, 950);
  }

  // Mobile navigation
  function closeMenu() {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) closeMenu();
    });
  }

  // Scroll reveal
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element, index) => {
      element.style.transitionDelay =
        `${Math.min(index % 4, 3) * 65}ms`;

      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("in-view");
    });
  }

  // Category filtering
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const isActive = item === button;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      cards.forEach((card) => {
        const matches =
          selectedFilter === "all" ||
          card.dataset.category === selectedFilter;

        card.classList.toggle("is-hidden", !matches);
      });
    });
  });

  // Back-to-top visibility
  let scrollTicking = false;

  function updateScrollUI() {
    const scrollTop =
      window.scrollY || document.documentElement.scrollTop;

    backTop?.classList.toggle("visible", scrollTop > 550);

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;

      scrollTicking = true;
      window.requestAnimationFrame(updateScrollUI);
    },
    { passive: true }
  );

  updateScrollUI();

  backTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  });

  // Small pointer response for desktop card interactions
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (finePointer.matches && !reducedMotion) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        card.style.borderColor =
          `rgba(216, 255, 98, ${0.15 + x * 0.35})`;

        card.style.setProperty("--pointer-x", `${x * 100}%`);
        card.style.setProperty("--pointer-y", `${y * 100}%`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("border-color");
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });
  }

  // Avoid leaving the navigation locked if browser history restores the page.
  window.addEventListener("pageshow", () => {
    closeMenu();
    dismissLoader();
  });
});
