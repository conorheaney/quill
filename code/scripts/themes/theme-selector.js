window.QuillThemeSelector = (() => {
  const DEFAULT_THEME = "dark";
  const SUPPORTED_THEMES = ["light", "dark", "sepia", "nord"];

  async function mount(mountElement) {
    if (!mountElement) {
      throw new Error("Unable to mount theme selector");
    }

    const response = await fetch("./html/themes/theme-selector.html");
    if (!response.ok) {
      throw new Error(`Unable to load theme selector (${response.status})`);
    }

    mountElement.innerHTML = await response.text();

    const themeButton = mountElement.querySelector("#themeButton");
    const themePanel = mountElement.querySelector("#themePanel");
    const themeOptions = Array.from(mountElement.querySelectorAll("[data-theme]"));
    const themeStylesheets = Array.from(document.querySelectorAll("[data-quill-theme]"));

    function normaliseTheme(theme) {
      return SUPPORTED_THEMES.includes(theme) ? theme : DEFAULT_THEME;
    }

    function setPanelOpen(isOpen) {
      themeButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      themePanel.hidden = !isOpen;
    }

    function setTheme(theme) {
      const nextTheme = normaliseTheme(theme);
      themeStylesheets.forEach((stylesheet) => {
        stylesheet.disabled = stylesheet.dataset.quillTheme !== nextTheme;
      });
      document.body.classList.toggle("dark", nextTheme === "dark");
      themeOptions.forEach((option) => {
        option.setAttribute("aria-selected", option.dataset.theme === nextTheme ? "true" : "false");
      });
      window.QuillStorage.saveTheme(nextTheme);
      return nextTheme;
    }

    themeButton.addEventListener("click", () => {
      setPanelOpen(themePanel.hidden);
    });

    themeOptions.forEach((option) => {
      option.addEventListener("click", () => {
        setTheme(option.dataset.theme);
        setPanelOpen(false);
        themeButton.focus({ preventScroll: true });
      });
    });

    document.addEventListener("click", (event) => {
      if (themePanel.hidden || mountElement.contains(event.target)) return;
      setPanelOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !themePanel.hidden) {
        setPanelOpen(false);
        themeButton.focus({ preventScroll: true });
      }
    });

    setTheme(window.QuillStorage.getTheme(DEFAULT_THEME));
  }

  return { mount };
})();
