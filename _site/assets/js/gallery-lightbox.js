(function () {
  var galleryLinks = Array.prototype.slice.call(document.querySelectorAll(".project-gallery-item"));
  if (!galleryLinks.length) return;

  var items = galleryLinks.map(function (link) {
    var img = link.querySelector("img");
    return {
      href: link.getAttribute("href"),
      alt: img ? img.getAttribute("alt") || "" : "",
      trigger: link
    };
  });

  var currentIndex = 0;
  var lastFocus = null;
  var touchStartX = 0;
  var touchStartY = 0;

  var lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.hidden = true;
  lightbox.innerHTML =
    '<div class="gallery-lightbox-backdrop" data-lightbox-close></div>' +
    '<div class="gallery-lightbox-shell" role="dialog" aria-modal="true" aria-label="Project photo gallery">' +
    '<button class="gallery-lightbox-close" type="button" aria-label="Close gallery">&times;</button>' +
    '<button class="gallery-lightbox-nav gallery-lightbox-prev" type="button" aria-label="Previous image">&lsaquo;</button>' +
    '<div class="gallery-lightbox-stage" tabindex="-1">' +
    '<img class="gallery-lightbox-image" alt="" />' +
    '</div>' +
    '<button class="gallery-lightbox-nav gallery-lightbox-next" type="button" aria-label="Next image">&rsaquo;</button>' +
    '<div class="gallery-lightbox-count" aria-live="polite"></div>' +
    '</div>';

  document.body.appendChild(lightbox);

  var shell = lightbox.querySelector(".gallery-lightbox-shell");
  var stage = lightbox.querySelector(".gallery-lightbox-stage");
  var image = lightbox.querySelector(".gallery-lightbox-image");
  var count = lightbox.querySelector(".gallery-lightbox-count");
  var closeButton = lightbox.querySelector(".gallery-lightbox-close");
  var prevButton = lightbox.querySelector(".gallery-lightbox-prev");
  var nextButton = lightbox.querySelector(".gallery-lightbox-next");

  function renderImage() {
    var item = items[currentIndex];
    image.src = item.href;
    image.alt = item.alt;
    count.textContent = currentIndex + 1 + " / " + items.length;
  }

  function showImage(index) {
    currentIndex = (index + items.length) % items.length;
    renderImage();
  }

  function openLightbox(index) {
    lastFocus = document.activeElement;
    currentIndex = index;
    renderImage();
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("gallery-lightbox-open");
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("gallery-lightbox-open");
    image.removeAttribute("src");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function showPrevious() {
    showImage(currentIndex - 1);
  }

  function showNext() {
    showImage(currentIndex + 1);
  }

  galleryLinks.forEach(function (link, index) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openLightbox(index);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);

  lightbox.addEventListener("click", function (event) {
    if (event.target.closest(".gallery-lightbox-close, .gallery-lightbox-nav")) return;
    closeLightbox();
  });

  document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowLeft") {
      showPrevious();
    } else if (event.key === "ArrowRight") {
      showNext();
    }
  });

  stage.addEventListener("touchstart", function (event) {
    if (!event.touches || event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener("touchend", function (event) {
    if (!event.changedTouches || event.changedTouches.length !== 1) return;

    var touchEndX = event.changedTouches[0].clientX;
    var touchEndY = event.changedTouches[0].clientY;
    var deltaX = touchEndX - touchStartX;
    var deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX > 0) {
      showPrevious();
    } else {
      showNext();
    }
  }, { passive: true });

  shell.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;

    var focusable = Array.prototype.slice.call(shell.querySelectorAll("button"));
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
