// Performance: Debounce & Throttle utilities
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Mobile Navigation Toggle
function toggleNav() {
  var nav = document.getElementById("nav-mobile");
  var toggle = document.getElementById("nav-toggle");
  if (!nav) return;

  nav.classList.toggle("open");

  // Update aria-expanded for accessibility
  if (toggle) {
    var isOpen = nav.classList.contains("open");
    toggle.setAttribute("aria-expanded", isOpen);
  }
}

// Attach nav toggle event listener
document.addEventListener("DOMContentLoaded", function () {
  const navToggleBtn = document.getElementById("nav-toggle");
  if (navToggleBtn) {
    navToggleBtn.addEventListener("click", toggleNav);
  }

  // Close mobile menu when clicking nav links
  const mobileNavLinks = document.querySelectorAll(".nav-mobile a");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      const nav = document.getElementById("nav-mobile");
      if (nav && nav.classList.contains("open")) {
        toggleNav();
      }
    });
  });
});

// Smooth Scroll Behavior - Delegate event listeners for better performance
document.addEventListener("click", function (e) {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;

  e.preventDefault();
  const target = document.querySelector(anchor.getAttribute("href"));
  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    // Close mobile menu if open
    const navMobile = document.getElementById("nav-mobile");
    if (navMobile && navMobile.classList.contains("open")) {
      navMobile.classList.remove("open");
    }
  }
});

// Active Navigation Highlighting (optimized with throttle)
function updateActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a, .nav-mobile a");

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 60) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").slice(1) === current) {
      link.classList.add("active");
    }
  });
}

// Throttle scroll events for better performance (16ms = ~60 FPS)
const throttledUpdateNav = throttle(updateActiveNav, 16);
window.addEventListener("scroll", throttledUpdateNav, { passive: true });
updateActiveNav();

// Scroll-triggered animations (optimized Intersection Observer)
const observerOptions = {
  threshold: 0.05,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements (use single selector for better performance)
document
  .querySelectorAll(".card, .gallery-item, .review-card, .about-media")
  .forEach((el) => {
    observer.observe(el);
  });

// Lazy load images (if image elements exist)
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // Handle both data-src and regular src lazy loading
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add("loaded");
          }
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "50px 0px", // Start loading 50px before image enters viewport
      threshold: 0.01,
    },
  );

  // Observe images with data-src or loading="lazy"
  document
    .querySelectorAll("img[data-src], img[loading='lazy']")
    .forEach((img) => imageObserver.observe(img));
}

function normalizePhoneValue(value) {
  if (!value) return "";
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? "+" + digits : digits;
}

function isValidNorthAmericanPhone(value) {
  const normalized = normalizePhoneValue(value);
  // Allow 10 digits with optional +1 prefix
  return /^(\+1)?\d{10}$/.test(normalized);
}

const phoneInput = document.getElementById("phone");
if (phoneInput) {
  phoneInput.addEventListener("input", function () {
    const value = this.value;
    const hasPlus = value.trim().startsWith("+");
    const digitsOnly = value.replace(/\D/g, "");
    this.value = hasPlus ? "+" + digitsOnly : digitsOnly;
  });
}

// Form Validation and Submission
const contactForm = document.querySelector('form[name="contact"]');
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";
    const phoneField = this.querySelector("#phone");

    if (phoneField) {
      if (!isValidNorthAmericanPhone(phoneField.value)) {
        phoneField.setCustomValidity(
          "Please enter a valid Canadian or US phone number with 10 digits, optionally starting with +1.",
        );
        phoneField.reportValidity();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        e.preventDefault();
        return;
      }
      phoneField.setCustomValidity("");
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 3000);
    }
  });
}

// Smooth page load
window.addEventListener("load", function () {
  document.body.classList.add("loaded");
});

// Prevent accidental double submissions
let isSubmitting = false;
document.addEventListener("submit", function (e) {
  if (isSubmitting) {
    e.preventDefault();
    return;
  }
  isSubmitting = true;
  setTimeout(() => {
    isSubmitting = false;
  }, 3000);
});
