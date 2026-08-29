(function () {
  function createOutlinePane(options) {
    const {
      navElement,
      escapeHtml,
      onSelectHeading
    } = options;

    let activeHeadingId = "";

    navElement.addEventListener("click", (event) => {
      const trigger = event.target.closest(".outline-item");
      if (!trigger) return;
      onSelectHeading(trigger.dataset.target);
    });

    function setActiveHeading(headingId) {
      activeHeadingId = headingId || "";
      navElement.querySelectorAll(".outline-item").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.target === activeHeadingId);
      });
    }

    function render(headings, headingId) {
      if (!headings.length) {
        navElement.innerHTML = '<p class="outline-empty">Add Markdown headings to build a clickable document outline.</p>';
        activeHeadingId = "";
        return;
      }

      activeHeadingId = headingId || headings[0].id;
      navElement.innerHTML = headings
        .map((heading) => {
          const isActive = heading.id === activeHeadingId;
          return `<button type="button" class="outline-item${isActive ? " is-active" : ""}" data-target="${heading.id}" data-level="${heading.level}">${escapeHtml(heading.text)}</button>`;
        })
        .join("");
    }

    return {
      render,
      setActiveHeading
    };
  }

  window.QuillOutlinePane = {
    createOutlinePane
  };
})();
