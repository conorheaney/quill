import type { OutlineHeading, OutlinePaneOptions, OutlinePanePort } from "./contracts";

(function (): void {
  function createOutlinePane(options: OutlinePaneOptions): OutlinePanePort {
    const {
      navElement,
      escapeHtml,
      onSelectHeading
    } = options;

    let activeHeadingId = "";

    navElement.addEventListener("click", (event: MouseEvent) => {
      const target = event.target;
      const trigger = target instanceof Element ? target.closest(".outline-item") as HTMLElement | null : null;
      if (!trigger) return;
      onSelectHeading(trigger.dataset.target);
    });

    function setActiveHeading(headingId = ""): void {
      activeHeadingId = headingId || "";
      navElement.querySelectorAll<HTMLElement>(".outline-item").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.target === activeHeadingId);
      });
    }

    function render(headings: OutlineHeading[], headingId = ""): void {
      if (!headings.length) {
        navElement.innerHTML = '<p class="outline-empty">Add Markdown headings to build a clickable document outline.</p>';
        activeHeadingId = "";
        return;
      }

      activeHeadingId = headingId || headings[0].id;
      navElement.innerHTML = headings
        .map((heading: OutlineHeading) => {
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
