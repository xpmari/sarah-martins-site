(() => {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ==========================================================================
     1. STATE & DOM REFERENCES
     ========================================================================== */
  const STORAGE_KEY = "sahvm_portfolio_lang";
  let currentLang = "pt";

  const header = document.querySelector(".site-header");
  const langToggle = document.getElementById("lang-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  const tabsScrollShell = document.querySelector(".tabs-scroll-shell");
  const tabList = document.querySelector(".niche-tablist");
  const tabs = Array.from(document.querySelectorAll(".niche-tab"));
  const tabPill = document.getElementById("tab-active-pill");
  const videosPanel = document.getElementById("niche-videos-panel");
  const videosGrid = document.getElementById("videos-grid");
  const videoCards = Array.from(document.querySelectorAll("[data-niche-item]"));
  const videosCarouselFooter = document.getElementById("videos-carousel-footer");
  const videosCarouselDots = document.getElementById("videos-carousel-dots");
  const casesGrid = document.querySelector(".cases-grid");
  const caseCards = casesGrid
    ? Array.from(casesGrid.querySelectorAll(".case-card"))
    : [];
  const casesCarouselDots = document.getElementById("cases-carousel-dots");
  const portfolioIframes = Array.from(
    document.querySelectorAll(".video-frame iframe")
  );
  const interactedIframes = new WeakSet();

  const lightbox = document.getElementById("photo-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  let activePhotoTrigger = null;

  /* ==========================================================================
     2. FLOATING GLASS NAVBAR SCROLL STATE
     ========================================================================== */
  function handleHeaderScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ==========================================================================
     3. BILINGUAL SWITCHER (PT | EN) — INSTANT & ZERO RELOAD
     ========================================================================== */
  const PAGE_TITLES = {
    pt: "Sarah Martins (@sahvm) — Portfólio UGC Creator",
    en: "Sarah Martins (@sahvm) — UGC Creator Portfolio"
  };

  function getInitialLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "pt" || saved === "en") return saved;
    } catch (_) {
      /* Ignore storage restrictions on file:// */
    }
    return "pt";
  }

  function updateMenuAriaLabel() {
    if (!menuToggle) return;
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    const attrName = isOpen
      ? `data-aria-close-${currentLang}`
      : `data-aria-open-${currentLang}`;
    const label = menuToggle.getAttribute(attrName);
    if (label) menuToggle.setAttribute("aria-label", label);
  }

  function applyLanguage(lang) {
    currentLang = lang === "en" ? "en" : "pt";

    document.documentElement.lang = currentLang === "pt" ? "pt-BR" : "en";
    document.title = PAGE_TITLES[currentLang];

    document.querySelectorAll("[data-pt][data-en]").forEach((el) => {
      if (el.dataset.ticking === "1") return;
      const nextText = el.getAttribute(`data-${currentLang}`);
      if (nextText !== null) {
        el.textContent = nextText;
      }
    });

    document.querySelectorAll("[data-alt-pt][data-alt-en]").forEach((img) => {
      const nextAlt = img.getAttribute(`data-alt-${currentLang}`);
      if (nextAlt !== null) {
        img.setAttribute("alt", nextAlt);
      }
    });

    document.querySelectorAll("[data-aria-pt][data-aria-en]").forEach((el) => {
      const nextAria = el.getAttribute(`data-aria-${currentLang}`);
      if (nextAria !== null) {
        el.setAttribute("aria-label", nextAria);
      }
    });

    updateMenuAriaLabel();

    if (langToggle) {
      langToggle.setAttribute("data-current-lang", currentLang);
      langToggle.querySelectorAll(".lang-opt").forEach((opt) => {
        const isMatch = opt.getAttribute("data-lang-code") === currentLang;
        opt.classList.toggle("is-active", isMatch);
      });
    }

    if (activePhotoTrigger && lightbox && lightbox.open && lightboxCaption) {
      const cap = activePhotoTrigger.getAttribute(`data-caption-${currentLang}`);
      if (cap) lightboxCaption.textContent = cap;
    }

    try {
      localStorage.setItem(STORAGE_KEY, currentLang);
    } catch (_) {
      /* Ignore storage restrictions */
    }

    requestAnimationFrame(updateTabIndicator);
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      applyLanguage(currentLang === "pt" ? "en" : "pt");
    });
  }

  /* ==========================================================================
     4. MOBILE MENU & ACTIVE SECTION HIGHLIGHTING
     ========================================================================== */
  function setMenuOpen(open) {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    mainNav.classList.toggle("is-open", open);
    updateMenuAriaLabel();
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("click", (event) => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;
      if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menuToggle.getAttribute("aria-expanded") === "true"
      ) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 980) {
        setMenuOpen(false);
      }
    });
  }

  const observedSections = Array.from(
    document.querySelectorAll("main section[id], #contato")
  );

  if ("IntersectionObserver" in window && observedSections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === `#${id}`
            );
          });
        });
      },
      { rootMargin: "-32% 0px -55% 0px", threshold: 0 }
    );

    observedSections.forEach((sec) => navObserver.observe(sec));
  }

  /* ==========================================================================
     5. ANIMATED NICHE TABS & GOOGLE DRIVE IFRAME COORDINATION
     ========================================================================== */
  function getActiveTab() {
    return tabs.find((t) => t.classList.contains("is-active")) || tabs[0];
  }

  function updateTabIndicator() {
    const activeTab = getActiveTab();
    if (!activeTab || !tabPill) return;
    tabPill.style.width = `${activeTab.offsetWidth}px`;
    tabPill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
  }

  function centerTabInScrollShell(tab) {
    if (!tabsScrollShell || !tab) return;
    const shellRect = tabsScrollShell.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const currentScroll = tabsScrollShell.scrollLeft;
    const offset =
      tabRect.left - shellRect.left - shellRect.width / 2 + tabRect.width / 2;

    tabsScrollShell.scrollTo({
      left: Math.max(0, currentScroll + offset),
      behavior: "smooth"
    });
  }

  const isRealIOSWebKit =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("-webkit-touch-callout", "none");

  const IOS_MP4_DRIVE_IDS = new Set([
    "1PnoAiXySj3dY8HMFupdxcYztP3kptIjw",
    "1r4aCL6WBrDi7XMvED-MoDk2MIi-V1BvP",
    "1nPGnNssHsxzx8j29if6EIeFgbc2DEJfA",
    "1u64vbYn8zpbOXOaLIg0Uvijd_p8fqI3m",
    "10ioE7z6ZX2DEGBThsPJPwLaQqB6yIvZL",
    "1nKjXGumw3iZnGsNr1BE0aDMpxIAbZGl0",
    "15raKfXvzDtvoNbS29Av7Y96NMj0B6bNk",
    "1T53WaxCRZsUVsZh0E-z0X6pG_mNhRpyB",
    "1RvlLOSiq-ooYWJXsxZXLRrTLqYDLpd0n",
    "1IcjD2Svtwss7vxRor8BX2KTeeA94VMiC",
    "1VSgm7pBBb9F-XCsAjhEkYGvJrzDx8pQu"
  ]);

  function extractDriveFileId(url) {
    if (!url) return null;
    const match = url.match(/\/file\/d\/([^/]+)/);
    return match ? match[1] : null;
  }

  function pauseAllNativeVideos(exceptVideo = null) {
    document
      .querySelectorAll("[data-case-video], .portfolio-native-video")
      .forEach((vid) => {
        if (vid !== exceptVideo && !vid.paused) {
          vid.pause();
        }
      });
  }

  function buildIOSPosterLink(fileId, titleText) {
    const link = document.createElement("a");
    link.href = `https://drive.google.com/file/d/${fileId}/view`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "ios-drive-poster-link";
    link.setAttribute("aria-label", titleText || "Assistir vídeo");

    const img = document.createElement("img");
    img.src = `https://lh3.googleusercontent.com/d/${fileId}=w720`;
    img.alt = titleText || "";
    img.loading = "lazy";
    img.className = "ios-drive-poster-img";

    const badge = document.createElement("span");
    badge.className = "ios-drive-play-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5L8 5.5z"/></svg>';

    link.appendChild(img);
    link.appendChild(badge);
    return link;
  }

  function hydrateVisiblePortfolioMedia() {
    videoCards.forEach((card) => {
      if (card.hidden) return;
      const frame = card.querySelector(".video-frame");
      if (!frame || frame.dataset.hydrated === "1") return;
      const iframe = frame.querySelector("iframe");
      if (!iframe) return;

      const previewUrl =
        iframe.getAttribute("src") || iframe.getAttribute("data-src") || "";
      const fileId = extractDriveFileId(previewUrl);

      if (isRealIOSWebKit && fileId) {
        frame.dataset.hydrated = "1";
        const titleText = iframe.getAttribute("title") || "Vídeo UGC";
        iframe.remove();

        if (IOS_MP4_DRIVE_IDS.has(fileId)) {
          const vid = document.createElement("video");
          vid.className = "portfolio-native-video";
          vid.controls = true;
          vid.playsInline = true;
          vid.setAttribute("playsinline", "");
          vid.preload = "metadata";
          vid.poster = `https://lh3.googleusercontent.com/d/${fileId}=w720`;
          vid.src = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
          vid.setAttribute("aria-label", titleText);

          vid.addEventListener("play", () => {
            pauseAllNativeVideos(vid);
            stopInteractedIframes();
          });

          vid.addEventListener("error", () => {
            vid.replaceWith(buildIOSPosterLink(fileId, titleText));
          });

          frame.appendChild(vid);
        } else {
          frame.appendChild(buildIOSPosterLink(fileId, titleText));
        }
        return;
      }

      if (!iframe.getAttribute("src") && previewUrl) {
        iframe.setAttribute("src", previewUrl);
      }
      frame.dataset.hydrated = "1";
    });
  }

  function stopInteractedIframes(excludeNiche = null) {
    document.querySelectorAll(".portfolio-native-video").forEach((vid) => {
      const card = vid.closest("[data-niche-item]");
      if (card && card.getAttribute("data-niche-item") === excludeNiche) return;
      if (!vid.paused) vid.pause();
    });

    portfolioIframes.forEach((iframe) => {
      if (!interactedIframes.has(iframe)) return;
      const card = iframe.closest("[data-niche-item]");
      if (card && card.getAttribute("data-niche-item") === excludeNiche) return;
      const currentSrc = iframe.getAttribute("src");
      if (currentSrc) {
        iframe.setAttribute("src", currentSrc);
        interactedIframes.delete(iframe);
      }
    });
  }

  function activateNicheTab(nextTab, { focusTab = false, scrollTab = true } = {}) {
    if (!nextTab) return;
    const targetNiche = nextTab.getAttribute("data-niche");
    if (!targetNiche) return;

    stopInteractedIframes(targetNiche);

    tabs.forEach((tab) => {
      const isSelected = tab === nextTab;
      tab.classList.toggle("is-active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
    });

    if (videosPanel && nextTab.id) {
      videosPanel.setAttribute("aria-labelledby", nextTab.id);
    }

    videoCards.forEach((card) => {
      const matches = card.getAttribute("data-niche-item") === targetNiche;
      card.hidden = !matches;
    });

    hydrateVisiblePortfolioMedia();
    syncVideosCarousel(true);
    updateTabIndicator();
    if (scrollTab) centerTabInScrollShell(nextTab);
    if (focusTab) nextTab.focus();
  }

  /* Mobile Horizontal Snap Carousel Helpers (#cases & #videos-grid) */
  function scrollCarouselToCard(track, card) {
    if (!track || !card) return;
    const align = window.getComputedStyle(card).scrollSnapAlign;
    const targetLeft =
      align === "start"
        ? card.offsetLeft - 18
        : card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }

  function updateActiveCarouselDot(track, items, dotsContainer) {
    if (!track || !dotsContainer || items.length === 0) return;
    const dots = Array.from(dotsContainer.querySelectorAll(".carousel-dot"));
    if (dots.length === 0) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closestIdx = 0;
    let minDistance = Infinity;

    items.forEach((item, idx) => {
      const rect = item.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - trackCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    dots.forEach((dot, idx) => {
      const isSelected = idx === closestIdx;
      dot.classList.toggle("is-active", isSelected);
      dot.setAttribute("aria-current", String(isSelected));
    });
  }

  function getVisibleVideoCards() {
    return videoCards.filter((card) => !card.hidden);
  }

  function syncVideosCarousel(resetScroll = false) {
    const visibleCards = getVisibleVideoCards();
    const isSingle = visibleCards.length <= 1;

    if (videosGrid) {
      videosGrid.classList.toggle("is-single-video", isSingle);
      if (resetScroll) {
        videosGrid.scrollTo({ left: 0, behavior: "auto" });
      }
    }

    if (videosCarouselFooter) {
      videosCarouselFooter.hidden = isSingle;
    }

    if (!videosCarouselDots || isSingle) return;

    videosCarouselDots.innerHTML = "";
    visibleCards.forEach((card, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = idx === 0 ? "carousel-dot is-active" : "carousel-dot";
      btn.setAttribute("data-carousel-index", String(idx));
      btn.setAttribute("aria-current", idx === 0 ? "true" : "false");
      const labelPt = `Vídeo ${idx + 1}`;
      const labelEn = `Video ${idx + 1}`;
      btn.setAttribute("data-aria-pt", labelPt);
      btn.setAttribute("data-aria-en", labelEn);
      btn.setAttribute("aria-label", currentLang === "en" ? labelEn : labelPt);
      btn.addEventListener("click", () => {
        scrollCarouselToCard(videosGrid, card);
      });
      videosCarouselDots.appendChild(btn);
    });
  }

  if (casesGrid && casesCarouselDots && caseCards.length > 0) {
    let casesScrollRaf = 0;
    casesGrid.addEventListener(
      "scroll",
      () => {
        if (casesScrollRaf) return;
        casesScrollRaf = requestAnimationFrame(() => {
          casesScrollRaf = 0;
          updateActiveCarouselDot(casesGrid, caseCards, casesCarouselDots);
        });
      },
      { passive: true }
    );

    Array.from(casesCarouselDots.querySelectorAll(".carousel-dot")).forEach(
      (dot, idx) => {
        dot.setAttribute("aria-current", idx === 0 ? "true" : "false");
        dot.addEventListener("click", () => {
          scrollCarouselToCard(casesGrid, caseCards[idx]);
        });
      }
    );
  }

  if (videosGrid && videosCarouselDots) {
    let videosScrollRaf = 0;
    videosGrid.addEventListener(
      "scroll",
      () => {
        if (videosScrollRaf) return;
        videosScrollRaf = requestAnimationFrame(() => {
          videosScrollRaf = 0;
          updateActiveCarouselDot(
            videosGrid,
            getVisibleVideoCards(),
            videosCarouselDots
          );
        });
      },
      { passive: true }
    );
  }

  tabs.forEach((tab, index) => {
    tab.setAttribute("tabindex", index === 0 ? "0" : "-1");

    tab.addEventListener("click", () => {
      activateNicheTab(tab, { focusTab: false, scrollTab: true });
    });

    tab.addEventListener("keydown", (event) => {
      let targetIndex = null;
      if (event.key === "ArrowRight") {
        targetIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        targetIndex = 0;
      } else if (event.key === "End") {
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== null) {
        event.preventDefault();
        activateNicheTab(tabs[targetIndex], { focusTab: true, scrollTab: true });
      }
    });
  });

  if (tabList && "ResizeObserver" in window) {
    const tabResizeObserver = new ResizeObserver(updateTabIndicator);
    tabResizeObserver.observe(tabList);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateTabIndicator);
  }

  window.addEventListener("blur", () => {
    const active = document.activeElement;
    if (active && active.tagName === "IFRAME") {
      interactedIframes.add(active);
      pauseAllNativeVideos();
    }
  });

  /* ==========================================================================
     6. ANIMATED NUMBER COUNTERS (#cases)
     ========================================================================== */
  const counterElements = Array.from(document.querySelectorAll(".counter-val"));

  function formatCounterNumber(val, decimals, lang) {
    const fixed = val.toFixed(decimals);
    return lang === "pt" ? fixed.replace(".", ",") : fixed;
  }

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute("data-count-target") || "0");
    const decimals = parseInt(el.getAttribute("data-count-decimals") || "0", 10);
    if (!target || prefersReducedMotion) return;

    const duration = 1200;
    const start = performance.now();
    el.dataset.ticking = "1";

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * eased;
      const suffix = el.getAttribute(`data-suffix-${currentLang}`) || "";

      if (progress < 1) {
        el.textContent = `${formatCounterNumber(currentVal, decimals, currentLang)}${suffix}`;
        requestAnimationFrame(tick);
      } else {
        delete el.dataset.ticking;
        const finalText = el.getAttribute(`data-${currentLang}`);
        if (finalText) el.textContent = finalText;
      }
    }

    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && counterElements.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    counterElements.forEach((el) => counterObserver.observe(el));
  }

  /* ==========================================================================
     7. CASE VIDEOS, 3D COVERFLOW CAROUSEL & LIGHTBOX MODAL
     ========================================================================== */
  const caseVideos = Array.from(document.querySelectorAll("[data-case-video]"));

  caseVideos.forEach((vid) => {
    vid.addEventListener("play", () => {
      pauseAllNativeVideos(vid);
      stopInteractedIframes();
    });
  });

  function openPhotoLightbox(trigger) {
    if (!lightbox || !lightboxImg || !trigger) return;
    const src = trigger.getAttribute("data-lightbox-src");
    const caption = trigger.getAttribute(`data-caption-${currentLang}`) || "";
    const thumbImg = trigger.querySelector("img");
    const alt = thumbImg ? thumbImg.getAttribute("alt") || caption : caption;

    if (!src) return;
    activePhotoTrigger = trigger;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    if (lightboxCaption) lightboxCaption.textContent = caption;

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    }
  }

  // 21st.dev 3D Coverflow Carousel Logic
  const coverflowRoot = document.getElementById("product-coverflow");
  const coverflowStage = document.getElementById("coverflow-stage");
  const coverflowSlides = coverflowStage
    ? Array.from(coverflowStage.querySelectorAll(".coverflow-slide"))
    : [];
  const coverflowDots = Array.from(
    document.querySelectorAll("#coverflow-dots .coverflow-dot")
  );
  const coverflowPrev = document.getElementById("coverflow-prev");
  const coverflowNext = document.getElementById("coverflow-next");

  let activeSlideIndex = 2; // Starts centered on Natura Una with 2 cards on each side
  let dragStartX = null;
  let dragDeltaX = 0;
  let didSwipe = false;

  function renderCoverflow() {
    const total = coverflowSlides.length;
    if (!total) return;

    const half = Math.floor(total / 2);

    coverflowSlides.forEach((slide, idx) => {
      let diff = idx - activeSlideIndex;
      if (diff > half) diff -= total;
      if (diff < -half) diff += total;
      slide.setAttribute("data-offset", String(diff));

      const btn = slide.querySelector(".coverflow-card-btn");
      if (btn) {
        btn.setAttribute("tabindex", diff === 0 ? "0" : "-1");
      }
    });

    coverflowDots.forEach((dot, idx) => {
      const isSelected = idx === activeSlideIndex;
      dot.classList.toggle("is-active", isSelected);
      dot.setAttribute("aria-current", String(isSelected));
    });
  }

  function goToSlide(nextIndex) {
    const total = coverflowSlides.length;
    if (!total) return;
    activeSlideIndex = ((nextIndex % total) + total) % total;
    renderCoverflow();
  }

  if (coverflowSlides.length > 0) {
    renderCoverflow();

    coverflowSlides.forEach((slide, idx) => {
      const btn = slide.querySelector(".coverflow-card-btn");
      if (!btn) return;

      btn.addEventListener("click", (e) => {
        if (didSwipe) {
          e.preventDefault();
          didSwipe = false;
          return;
        }
        const offset = Number(slide.getAttribute("data-offset"));
        if (offset === 0) {
          openPhotoLightbox(btn);
        } else {
          goToSlide(idx);
        }
      });
    });

    if (coverflowPrev) {
      coverflowPrev.addEventListener("click", () => goToSlide(activeSlideIndex - 1));
    }

    if (coverflowNext) {
      coverflowNext.addEventListener("click", () => goToSlide(activeSlideIndex + 1));
    }

    coverflowDots.forEach((dot, idx) => {
      dot.addEventListener("click", () => goToSlide(idx));
    });

    if (coverflowRoot) {
      coverflowRoot.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goToSlide(activeSlideIndex - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goToSlide(activeSlideIndex + 1);
        }
      });
    }

    // Touch / Pointer Swipe Support
    if (coverflowStage) {
      coverflowStage.addEventListener(
        "pointerdown",
        (e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          dragStartX = e.clientX;
          dragDeltaX = 0;
          didSwipe = false;
        },
        { passive: true }
      );

      coverflowStage.addEventListener(
        "pointermove",
        (e) => {
          if (dragStartX === null) return;
          dragDeltaX = e.clientX - dragStartX;
        },
        { passive: true }
      );

      const finishSwipe = () => {
        if (dragStartX === null) return;
        if (Math.abs(dragDeltaX) > 38) {
          didSwipe = true;
          if (dragDeltaX < 0) {
            goToSlide(activeSlideIndex + 1);
          } else {
            goToSlide(activeSlideIndex - 1);
          }
          setTimeout(() => {
            didSwipe = false;
          }, 80);
        }
        dragStartX = null;
        dragDeltaX = 0;
      };

      coverflowStage.addEventListener("pointerup", finishSwipe);
      coverflowStage.addEventListener("pointercancel", finishSwipe);
      coverflowStage.addEventListener("pointerleave", finishSwipe);
    }
  }

  if (lightbox) {
    if (lightboxClose) {
      lightboxClose.addEventListener("click", () => lightbox.close());
    }

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        lightbox.close();
      }
    });

    lightbox.addEventListener("close", () => {
      if (activePhotoTrigger) {
        activePhotoTrigger.focus();
        activePhotoTrigger = null;
      }
    });
  }

  /* ==========================================================================
     8. SCROLL REVEAL
     ========================================================================== */
  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  revealItems.forEach((el) => {
    const delay = el.getAttribute("data-delay");
    if (delay) {
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    }
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  }

  /* ==========================================================================
     9. 21st.dev CLOSING MONOLITH — GLASS SPOTLIGHT & WORDMARK GLOW
     ========================================================================== */
  // 21st.dev Spotlight Cards: track cursor coordinates inside each channel card
  if (!prefersReducedMotion) {
    const glassChannelCards = Array.from(
      document.querySelectorAll(".glass-channel-card")
    );

    glassChannelCards.forEach((card) => {
      card.addEventListener(
        "pointermove",
        (e) => {
          if (e.pointerType === "touch") return;
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--ch-x", `${(e.clientX - rect.left).toFixed(1)}px`);
          card.style.setProperty("--ch-y", `${(e.clientY - rect.top).toFixed(1)}px`);
        },
        { passive: true }
      );
    });

    // 21st.dev TextHoverEffect: radial spotlight reveal across SARAH MARTINS wordmark
    const wordmarkSpotlight = document.getElementById("wordmark-spotlight");
    if (wordmarkSpotlight) {
      wordmarkSpotlight.addEventListener(
        "pointermove",
        (e) => {
          if (e.pointerType === "touch") return;
          const rect = wordmarkSpotlight.getBoundingClientRect();
          wordmarkSpotlight.style.setProperty(
            "--wm-x",
            `${(e.clientX - rect.left).toFixed(1)}px`
          );
          wordmarkSpotlight.style.setProperty(
            "--wm-y",
            `${(e.clientY - rect.top).toFixed(1)}px`
          );
        },
        { passive: true }
      );
    }
  }

  /* ==========================================================================
     10. INITIALIZE
     ========================================================================== */
  hydrateVisiblePortfolioMedia();
  syncVideosCarousel(false);
  applyLanguage(getInitialLanguage());
  updateTabIndicator();
})();
