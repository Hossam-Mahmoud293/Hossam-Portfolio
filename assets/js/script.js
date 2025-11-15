window.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Register GSAP plugins
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  const hasGSAP = !!window.gsap;
  const RECEIVER_EMAIL = "hoso9425@gmail.com";
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnnlqewj";

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId.length > 1) {
        e.preventDefault();
        document
          .querySelector(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Hero intro
  if (hasGSAP) {
    gsap.fromTo(
      ".badge",
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(
      ".headline",
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.05, delay: 0.08, ease: "power3.out" }
    );
    gsap.fromTo(
      ".tagline",
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.05, delay: 0.18, ease: "power3.out" }
    );
    gsap.fromTo(
      ".start-journey",
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.05, delay: 0.26, ease: "power3.out" }
    );
    // Smooth entrance for hero image
    gsap.fromTo(
      ".hero-media img",
      { y: 18, opacity: 0, scale: 0.985 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.15,
        delay: 0.22,
        ease: "power3.out",
      }
    );
  }

  // Generic reveal on scroll
  if (hasGSAP) {
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 76%",
          toggleActions: "play none none reverse",
        },
      });
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  // Timeline items stagger
  if (hasGSAP) {
    gsap.utils.toArray(".timeline-item").forEach((item, i) => {
      gsap.from(item.querySelector(".content"), {
        x: 20,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1,
        scrollTrigger: { trigger: item, start: "top 80%" },
      });
    });
  }

  // Projects modal interactions
  const modal = document.getElementById("project-modal");
  const modalImg = modal?.querySelector(".modal-image");
  const modalTitle = modal?.querySelector(".modal-title");
  const modalDesc = modal?.querySelector(".modal-desc");
  const modalBody = modal?.querySelector(".modal-body");
  const dialogEl = modal?.querySelector(".dialog");
  const overlayEl = modal?.querySelector(".overlay");
  let modalOriginalParent = modal ? modal.parentElement : null;
  let modalNextSibling = modal ? modal.nextSibling : null;
  let scrollLockY = 0;
  let lastFocused = null;
  const imageCache = new Map(); // url -> { loaded:bool, img:Image }
  const projectsGrid = document.querySelector(".projects .grid");
  const GITHUB_USER = "Hossam-Mahmoud293";

  function showProjectsFallback(
    message = "No projects available right now. Please check back later."
  ) {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "projects-empty";
    wrap.setAttribute("role", "status");
    wrap.setAttribute("aria-live", "polite");
    wrap.textContent = message;
    projectsGrid.appendChild(wrap);
  }

  function bindProjectCard(card) {
    if (!card || card.__bound) return;
    card.__bound = true;
    let data;
    const raw = card.getAttribute("data-project");
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      const t = card.querySelector(".card-body h3")?.textContent?.trim() || "";
      const d = card.querySelector(".card-body p")?.textContent?.trim() || "";
      const img =
        card.querySelector("img.thumb-img")?.getAttribute("src") || "";
      data = { title: t, desc: d, image: img, tech: [], demo: "#", code: "#" };
    }
    if (data?.image && !imageCache.has(data.image)) {
      const im = new Image();
      im.decoding = "async";
      im.loading = "lazy";
      im.referrerPolicy = "no-referrer";
      im.src = data.image;
      im.addEventListener("load", () =>
        imageCache.set(data.image, { loaded: true, img: im })
      );
      im.addEventListener("error", () =>
        imageCache.set(data.image, { loaded: false, img: im })
      );
    }
    card.addEventListener("click", () => openModal(data));
  }

  function createCardFromRepo(repo, techOverride) {
    const img = `https://opengraph.githubassets.com/1/${repo.owner.login}/${repo.name}`;
    const homepage =
      repo.homepage && /^https?:\/\//i.test(repo.homepage) ? repo.homepage : "";
    const pages = repo.has_pages
      ? `https://${repo.owner.login}.github.io/${repo.name}/`
      : "";
    const DEMO_OVERRIDE = {
      Bondi: `https://${repo.owner.login}.github.io/Bondi/`,
    };
    const live = DEMO_OVERRIDE[repo.name] || homepage || pages || "#";
    // Build tech list
    let techList = Array.isArray(techOverride)
      ? techOverride.filter(Boolean)
      : [];
    if (!techList.length) {
      techList = [repo.language]
        .concat(Array.isArray(repo.topics) ? repo.topics : [])
        .filter(Boolean)
        .slice(0, 6);
    }
    const data = {
      title: repo.name,
      desc: repo.description || "",
      image: img,
      tech: techList,
      demo: live,
      code: repo.html_url,
    };
    const card = document.createElement("div");
    card.className = "card reveal";
    card.setAttribute("tabindex", "0");
    card.setAttribute("data-project", JSON.stringify(data));
    const thumb = document.createElement("img");
    thumb.className = "thumb-img";
    thumb.src = img;
    thumb.alt = `${repo.name} preview`;
    thumb.loading = "lazy";
    thumb.decoding = "async";
    thumb.fetchPriority = "low";
    const body = document.createElement("div");
    body.className = "card-body";
    const h3 = document.createElement("h3");
    h3.textContent = repo.name;
    const p = document.createElement("p");
    p.textContent = data.desc;
    body.append(h3, p);
    card.append(thumb, body);
    return card;
  }

  async function loadGitHubProjects(username, limit = 6) {
    if (!projectsGrid || !username) return;
    try {
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) {
        showProjectsFallback();
        return;
      }
      const repos = await res.json();
      const filtered = repos.filter(
        (r) => !r.fork && !r.archived && !r.disabled
      );
      filtered.sort((a, b) => {
        const an = (a.name || "").toLowerCase();
        const bn = (b.name || "").toLowerCase();
        if (an === "bondi" && bn !== "bondi") return -1;
        if (bn === "bondi" && an !== "bondi") return 1;
        return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      });
      const picked = filtered.slice(0, limit);
      projectsGrid.innerHTML = "";
      if (!picked.length) {
        showProjectsFallback();
        return;
      }
      // Fetch languages for each picked repo and build richer tech list
      const withLangs = await Promise.all(
        picked.map(async (r) => {
          try {
            const lr = await fetch(
              `https://api.github.com/repos/${r.owner.login}/${r.name}/languages`,
              { headers: { Accept: "application/vnd.github+json" } }
            );
            const langs = lr.ok ? await lr.json() : {};
            const sortedLangs = Object.entries(langs)
              .sort((a, b) => b[1] - a[1])
              .map(([k]) => k);
            const topics = Array.isArray(r.topics) ? r.topics : [];
            const base = r.language ? [r.language] : [];
            const tech = Array.from(
              new Set([...sortedLangs, ...base, ...topics])
            )
              .filter(Boolean)
              .slice(0, 8);
            return { repo: r, tech };
          } catch {
            const fallback = Array.from(
              new Set([
                r.language,
                ...(Array.isArray(r.topics) ? r.topics : []),
              ])
            )
              .filter(Boolean)
              .slice(0, 6);
            return { repo: r, tech: fallback };
          }
        })
      );

      withLangs.forEach(({ repo, tech }) => {
        const card = createCardFromRepo(repo, tech);
        projectsGrid.appendChild(card);
        bindProjectCard(card);
      });
      if (hasGSAP) {
        gsap.utils.toArray(".projects .card.reveal").forEach((el) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          });
        });
      }
    } catch (e) {
      showProjectsFallback();
    }
  }

  loadGitHubProjects(GITHUB_USER);

  // Ensure tech and actions containers exist
  function ensureModalSections() {
    if (!modalBody) return {};
    let tech = modalBody.querySelector(".modal-tech");
    if (!tech) {
      tech = document.createElement("div");
      tech.className = "modal-tech";
      modalBody.appendChild(tech);
    }
    let actions = modalBody.querySelector(".modal-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "modal-actions";
      modalBody.appendChild(actions);
    }
    return { tech, actions };
  }

  // Create spinner element if not exists
  function ensureSpinner() {
    if (!dialogEl) return null;
    let sp = dialogEl.querySelector(".spinner");
    if (!sp) {
      sp = document.createElement("div");
      sp.className = "spinner";
      dialogEl.appendChild(sp);
    }
    return sp;
  }

  function focusTrap(e) {
    if (!modal?.hasAttribute("open")) return;
    if (e.key !== "Tab") return;
    const focusable = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function disableScrollTriggers() {
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach((st) => st.disable());
    }
  }
  function enableScrollTriggers() {
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach((st) => st.enable());
    }
  }

  function openModal(data) {
    if (!modal) return;
    const { tech, actions } = ensureModalSections();
    const spinner = ensureSpinner();

    // Populate content
    const safe = {
      title: data && typeof data.title === "string" ? data.title : "",
      desc: data && typeof data.desc === "string" ? data.desc : "",
      image: data && typeof data.image === "string" ? data.image : "",
      tech: Array.isArray(data?.tech) ? data.tech.filter(Boolean) : [],
      demo: data && typeof data.demo === "string" ? data.demo : "",
      code: data && typeof data.code === "string" ? data.code : "",
    };

    if (modalTitle) modalTitle.textContent = safe.title;
    if (modalDesc) modalDesc.textContent = safe.desc;

    if (tech) {
      tech.innerHTML = "";
      safe.tech.forEach((t) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = t;
        tech.appendChild(chip);
      });
    }

    if (actions) {
      actions.innerHTML = "";
      const addAction = (href, label) => {
        const a = document.createElement("a");
        a.className = "btn-outline";
        a.textContent = label;
        if (href && href !== "#") {
          a.href = href;
          a.target = "_blank";
          a.rel = "noopener";
        } else {
          a.classList.add("is-disabled");
          a.setAttribute("aria-disabled", "true");
          a.setAttribute("tabindex", "-1");
          a.addEventListener("click", (e) => e.preventDefault());
        }
        actions.appendChild(a);
      };
      addAction(safe.demo, "Live Demo");
      addAction(safe.code, "Source Code");
    }

    if (modalImg) {
      if (safe.image) {
        modalImg.style.display = "";
        modalImg.src = safe.image;
        modalImg.setAttribute("alt", safe.title || "Project preview");
        modalImg.setAttribute("decoding", "async");
        modalImg.setAttribute("fetchpriority", "low");
        modalImg.setAttribute("loading", "lazy");
        const onErr = () => {
          modalImg.style.display = "none";
        };
        modalImg.removeEventListener("error", onErr);
        modalImg.addEventListener("error", onErr, { once: true });
      } else {
        modalImg.style.display = "none";
        modalImg.removeAttribute("src");
      }
    }

    // Accessibility and state
    lastFocused = document.activeElement;

    // Move modal to body to prevent underlying page scroll attempts when focusing inside the modal
    if (modal && modal.parentElement !== document.body) {
      modalOriginalParent = modalOriginalParent || modal.parentElement;
      modalNextSibling = modalNextSibling || modal.nextSibling;
      document.body.appendChild(modal);
    }

    modal.setAttribute("open", "");
    modal.setAttribute("aria-hidden", "false");
    modal.setAttribute("aria-modal", "true");
    // Lock background scroll without jumping
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    // Disable scroll triggers while modal is open
    disableScrollTriggers();

    // Reset any residual styles on body children to ensure visibility
    if (modalBody && modalBody.children.length) {
      Array.from(modalBody.children).forEach((ch) => {
        if (hasGSAP) {
          gsap.set(ch, { clearProps: "all", opacity: 1, y: 0, autoAlpha: 1 });
        } else {
          ch.style.opacity = "1";
          ch.style.transform = "none";
        }
      });
    }

    // GSAP animations (no ScrollTrigger)
    const dlg = dialogEl;
    const overlay = overlayEl;
    if (dlg) dlg.scrollTop = 0;
    if (hasGSAP) {
      gsap.set(dlg, { opacity: 0, scale: 0.96, y: "15%" });
      gsap.set(overlay, { opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(overlay, { opacity: 1, duration: 0.25 })
        .to(dlg, { opacity: 1, scale: 1, y: 0, duration: 0.35 }, "<")
        .from(
          modalBody.children,
          { y: 8, opacity: 0, stagger: 0.06, duration: 0.28 },
          "-=0.1"
        );
    } else {
      // Fallback: instantly show modal without animation
      if (overlay) overlay.style.opacity = "1";
      if (dlg) {
        dlg.style.opacity = "1";
        dlg.style.transform = "translate(0px, 15%)";
      }
    }

    // Show spinner only if image is not already ready
    if (spinner && modalImg) {
      spinner.style.display = "none";
      const isReady = !!(modalImg.complete && modalImg.naturalWidth > 0);
      if (!isReady) {
        let timer = setTimeout(() => {
          spinner.style.display = "grid";
        }, 300);
        const hideSpinner = () => {
          clearTimeout(timer);
          spinner.style.display = "none";
          modalImg.removeEventListener("load", hideSpinner);
          modalImg.removeEventListener("error", hideSpinner);
        };
        modalImg.addEventListener("load", hideSpinner);
        modalImg.addEventListener("error", hideSpinner);
      }
    }

    // Focus trap
    const closeBtn = modal.querySelector(".close");
    if (closeBtn) closeBtn.focus();
    if (hasGSAP && closeBtn) {
      const enter = () =>
        gsap.to(closeBtn, {
          rotate: 15,
          scale: 1.05,
          duration: 0.18,
          ease: "power2.out",
        });
      const leave = () =>
        gsap.to(closeBtn, {
          rotate: 0,
          scale: 1,
          duration: 0.18,
          ease: "power2.out",
        });
      closeBtn.addEventListener("mouseenter", enter);
      closeBtn.addEventListener("mouseleave", leave);
      closeBtn.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          gsap.to(closeBtn, {
            scale: 0.9,
            duration: 0.12,
            ease: "power2.in",
            onComplete: () => {
              gsap.to(closeBtn, {
                autoAlpha: 0,
                duration: 0.12,
                ease: "power2.out",
              });
              closeModal();
            },
          });
        },
        { once: true }
      );
      closeBtn.__hoverHandlers = { enter, leave };
    }
    trapHandler = focusTrap;
    window.addEventListener("keydown", trapHandler);
  }

  function closeModal() {
    if (!modal) return;
    const dlg = modal.querySelector(".dialog");
    const overlay = modal.querySelector(".overlay");
    const closeBtn = modal.querySelector(".close");
    if (closeBtn && closeBtn.__hoverHandlers) {
      closeBtn.removeEventListener(
        "mouseenter",
        closeBtn.__hoverHandlers.enter
      );
      closeBtn.removeEventListener(
        "mouseleave",
        closeBtn.__hoverHandlers.leave
      );
      delete closeBtn.__hoverHandlers;
      if (hasGSAP)
        gsap.set(closeBtn, {
          clearProps: "all",
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
        });
    }

    if (hasGSAP) {
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          modal.removeAttribute("open");
          modal.setAttribute("aria-hidden", "true");
          modal.setAttribute("aria-modal", "false");
          // Unlock scroll and restore position
          const y =
            Math.abs(parseInt(document.body.style.top || "0", 10)) ||
            scrollLockY;
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.left = "";
          document.body.style.right = "";
          document.body.style.width = "";
          window.scrollTo(0, y);

          // Re-enable ScrollTrigger
          enableScrollTriggers();

          // Cleanup focus trap
          if (trapHandler) window.removeEventListener("keydown", trapHandler);
          trapHandler = null;
          if (lastFocused && lastFocused.focus) lastFocused.focus();

          // Restore modal to its original place in the DOM
          if (modalOriginalParent) {
            if (
              modalNextSibling &&
              modalNextSibling.parentNode === modalOriginalParent
            ) {
              modalOriginalParent.insertBefore(modal, modalNextSibling);
            } else {
              modalOriginalParent.appendChild(modal);
            }
          }
        },
      });

      tl.to(modalBody.children, {
        y: -8,
        opacity: 0,
        stagger: { each: 0.05, from: "end" },
        duration: 0.2,
      })
        .to(dlg, { opacity: 0, y: -12, scale: 0.98, duration: 0.25 }, "<")
        .to(overlay, { opacity: 0, duration: 0.25 }, "<");
      tl.add(() => {
        if (dlg) gsap.set(dlg, { clearProps: "all" });
        if (overlay) gsap.set(overlay, { clearProps: "all" });
        if (modalBody && modalBody.children.length) {
          Array.from(modalBody.children).forEach((ch) =>
            gsap.set(ch, { clearProps: "all" })
          );
        }
      });
    } else {
      // Fallback: instantly hide modal and cleanup
      if (dlg) dlg.style.opacity = "0";
      if (overlay) overlay.style.opacity = "0";
      modal.removeAttribute("open");
      modal.setAttribute("aria-hidden", "true");
      modal.setAttribute("aria-modal", "false");
      const y =
        Math.abs(parseInt(document.body.style.top || "0", 10)) || scrollLockY;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, y);
      enableScrollTriggers();
      if (trapHandler) window.removeEventListener("keydown", trapHandler);
      trapHandler = null;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      if (modalOriginalParent) {
        if (
          modalNextSibling &&
          modalNextSibling.parentNode === modalOriginalParent
        ) {
          modalOriginalParent.insertBefore(modal, modalNextSibling);
        } else {
          modalOriginalParent.appendChild(modal);
        }
      }
    }
  }

  document.querySelectorAll(".projects .card").forEach((card) => {
    let data;
    const raw = card.getAttribute("data-project");
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (err) {
      // Fallback: build data from DOM if JSON parsing fails
      const t = card.querySelector(".card-body h3")?.textContent?.trim() || "";
      const d = card.querySelector(".card-body p")?.textContent?.trim() || "";
      const img =
        card.querySelector("img.thumb-img")?.getAttribute("src") || "";
      data = { title: t, desc: d, image: img, tech: [], demo: "#", code: "#" };
    }
    // Preload large modal image on idle
    if (data?.image && !imageCache.has(data.image)) {
      const im = new Image();
      im.decoding = "async";
      im.loading = "lazy";
      im.referrerPolicy = "no-referrer";
      im.src = data.image;
      im.addEventListener("load", () =>
        imageCache.set(data.image, { loaded: true, img: im })
      );
      im.addEventListener("error", () =>
        imageCache.set(data.image, { loaded: false, img: im })
      );
    }

    card.addEventListener("click", () => {
      openModal(data);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(data);
      }
    });
  });

  modal?.addEventListener("click", (e) => {
    if (
      e.target.hasAttribute("data-close") ||
      e.target.classList.contains("overlay")
    )
      closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (modal?.hasAttribute("open") && e.key === "Escape") closeModal();
  });

  // Skills animation: reveal each item individually on scroll
  const skills = document.querySelectorAll("#skills .skills li");
  if (skills.length) {
    const animateSkill = (li) => {
      const fill = li.querySelector(".fill");
      const val = li.querySelector(".value");
      const level = parseInt(fill.getAttribute("data-level"), 10);
      if (hasGSAP) {
        gsap.from(li, {
          y: 16,
          opacity: 0,
          scale: 0.985,
          duration: 0.6,
          ease: "power2.out",
        });
        gsap.to(fill, {
          width: level + "%",
          duration: 1.1,
          ease: "power2.out",
          delay: 0.15,
        });
        let count = { v: 0 };
        gsap.to(count, {
          v: level,
          duration: 1.1,
          ease: "power2.out",
          delay: 0.15,
          onUpdate: () => {
            val.textContent = Math.round(count.v) + "%";
          },
        });
      } else {
        li.style.opacity = "1";
        li.style.transform = "none";
        fill.style.width = level + "%";
        val.textContent = level + "%";
      }
    };

    if (window.ScrollTrigger && hasGSAP) {
      skills.forEach((li) => {
        ScrollTrigger.create({
          trigger: li,
          start: "top 85%",
          once: true,
          onEnter: () => animateSkill(li),
        });
      });
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateSkill(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -15% 0px", threshold: 0.1 }
      );
      skills.forEach((li) => io.observe(li));
    } else {
      // Immediate fallback
      skills.forEach(animateSkill);
    }
  }

  // Testimonials simple carousel
  if (hasGSAP) {
    const quotes = gsap.utils.toArray(".quote");
    if (quotes.length > 1) {
      let tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      quotes.forEach((q, i) => {
        tl.to({}, { duration: i === 0 ? 0 : 2 }) // pause between
          .to(q, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            onStart: () => {
              quotes.forEach((el) => el.classList.remove("is-active"));
              q.classList.add("is-active");
            },
          })
          .to(q, { autoAlpha: 0, y: -10, duration: 0.6, delay: 2 });
      });
    }
  }

  // Contact form handler with validation and animated feedback
  const form = document.querySelector("#contact .form");
  const statusSuccess = document.querySelector(
    "#contact .form-status.status-success"
  );
  const statusError = document.querySelector(
    "#contact .form-status.status-error"
  );
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const msgInput = form.querySelector('textarea[name="message"]');
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();

      // Simple validation
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const nameOk = name.length >= 2;
      const msgOk = message.length >= 10;

      // Clear previous invalid highlights
      [nameInput, emailInput, msgInput].forEach((el) =>
        el.classList.remove("is-invalid")
      );

      let ok = true;
      if (!nameOk) {
        nameInput.classList.add("is-invalid");
        ok = false;
      }
      if (!emailOk) {
        emailInput.classList.add("is-invalid");
        ok = false;
      }
      if (!msgOk) {
        msgInput.classList.add("is-invalid");
        ok = false;
      }

      // Hide both statuses first (prevent overlap/loops)
      [statusSuccess, statusError].forEach((el) => {
        if (!el) return;
        gsap.killTweensOf(el);
        el.style.display = "none";
        gsap.set(el, { autoAlpha: 0, y: 6 });
      });

      // Show appropriate status and auto-hide
      const show = (el) => {
        if (!el) return;
        el.style.display = "block";
        if (hasGSAP) {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 6 },
            { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }
          );
          gsap.to(el, {
            autoAlpha: 0,
            y: -4,
            delay: 4,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
              el.style.display = "none";
            },
          });
        } else {
          el.style.opacity = "1";
          el.style.transform = "none";
          setTimeout(() => {
            el.style.display = "none";
          }, 4000);
        }
      };

      if (!ok) {
        show(statusError);
      } else {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : "";
        const setLoading = (state) => {
          if (submitBtn) {
            submitBtn.disabled = state;
            submitBtn.textContent = state ? "Sending…" : originalText;
          }
        };
        const payload = new FormData();
        payload.append("name", name);
        payload.append("email", email);
        payload.append("message", message);
        payload.append("_subject", `New message from ${name}`);
        payload.append("_replyto", email);
        setLoading(true);
        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: payload,
        })
          .then(async (res) => {
            if (res.ok) {
              if (statusSuccess)
                statusSuccess.textContent = `Thanks, ${name}! Your message was sent.`;
              show(statusSuccess);
              form.reset();
            } else {
              show(statusError);
            }
          })
          .catch(() => {
            show(statusError);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  }

  // Accessibility: reduce motion preference
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mediaQuery.matches) {
    // Kill scroll triggers and animations for reduced motion users
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    }
  }

  // Link hover/focus animations (subtle scale/raise)
  // Applies to nav links, social links, and general anchors
  if (hasGSAP) {
    const interactiveEls = [
      ...document.querySelectorAll(".main-nav a, .social, a.logo"),
    ];
    interactiveEls.forEach((el) => {
      let hoverTl;
      const enter = () => {
        hoverTl = gsap.to(el, {
          y: -1,
          scale: 1.02,
          duration: 0.18,
          ease: "power2.out",
        });
      };
      const leave = () => {
        if (hoverTl) hoverTl.kill();
        gsap.to(el, { y: 0, scale: 1, duration: 0.18, ease: "power2.out" });
      };
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      el.addEventListener("focus", enter);
      el.addEventListener("blur", leave);
    });
  }

  // Project cards hover/focus subtle scale without fighting CSS translateY
  if (hasGSAP) {
    document.querySelectorAll(".projects .card").forEach((card) => {
      let tl;
      const enter = () => {
        tl = gsap.to(card, { scale: 1.01, duration: 0.2, ease: "power2.out" });
      };
      const leave = () => {
        if (tl) tl.kill();
        gsap.to(card, { scale: 1, duration: 0.2, ease: "power2.out" });
      };
      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);
      card.addEventListener("focus", enter);
      card.addEventListener("blur", leave);
    });
  }

  // Sticky navbar with smooth slide/shadow when sticking
  const header = document.querySelector(".site-header");
  if (header && hasGSAP && window.ScrollTrigger) {
    gsap.set(header, { y: 0 });
    ScrollTrigger.create({
      start: 80,
      onEnter: () => {
        header.classList.add("is-stuck");
        gsap.fromTo(
          header,
          { y: -60 },
          { y: 0, duration: 0.25, ease: "power2.out" }
        );
      },
      onLeaveBack: () => {
        gsap.to(header, { y: 0, duration: 0.2, ease: "power2.out" });
        header.classList.remove("is-stuck");
      },
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.getElementById("main-nav");
  if (navToggle && mainNav) {
    const setOpen = (open) => {
      if (open) {
        mainNav.classList.add("is-open");
        navToggle.setAttribute("aria-expanded", "true");
      } else {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    };
    navToggle.addEventListener("click", () =>
      setOpen(!mainNav.classList.contains("is-open"))
    );
    mainNav
      .querySelectorAll('a[href^="#"]')
      .forEach((a) => a.addEventListener("click", () => setOpen(false)));
    // Initialize and keep closed on desktop (>1000px)
    if (window.innerWidth > 1000) setOpen(false);
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1000) setOpen(false);
    });
    document.addEventListener("click", (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        setOpen(false);
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // Back-to-top button behavior
  const backTopBtn = document.getElementById("back-to-top");
  if (backTopBtn) {
    const updateBackTopVisibility = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const doc = document.documentElement;
      const docHeight = Math.max(
        doc.scrollHeight,
        doc.offsetHeight,
        document.body ? document.body.scrollHeight : 0,
        document.body ? document.body.offsetHeight : 0
      );
      const nearBottom = scrollY + window.innerHeight >= docHeight - 200;
      backTopBtn.classList.toggle("is-visible", nearBottom);
    };
    window.addEventListener("scroll", updateBackTopVisibility, {
      passive: true,
    });
    window.addEventListener("resize", updateBackTopVisibility);
    updateBackTopVisibility();
    backTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const reduce =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }
});
