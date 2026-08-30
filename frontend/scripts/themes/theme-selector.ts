import type { ThemeName } from "../contracts";

import type { ThemeSelectorPort } from "../contracts";

window.QuillThemeSelector = (() => {
  const DEFAULT_THEME = "dark";
  const SUPPORTED_THEMES: ThemeName[] = ["light", "dark", "sepia", "nord"];

  async function mount(mountElement: HTMLElement | null): Promise<void> {
    if (!mountElement) {
      throw new Error("Unable to mount theme selector");
    }

    const response = await fetch("./html/themes/theme-selector.html");
    if (!response.ok) {
      throw new Error(`Unable to load theme selector (${response.status})`);
    }

    mountElement.innerHTML = await response.text();

    const themeButton = mountElement.querySelector<HTMLButtonElement>("#themeButton");
    const themePanel = mountElement.querySelector<HTMLElement>("#themePanel");
    const themeOptions = Array.from(mountElement.querySelectorAll<HTMLElement>("[data-theme]"));
    const themeStylesheets = Array.from(document.querySelectorAll<HTMLLinkElement>("[data-quill-theme]"));

    if (!themeButton || !themePanel) {
      throw new Error("Unable to initialise theme selector");
    }

    const resolvedThemeButton = themeButton;
    const resolvedThemePanel = themePanel;

    function normaliseTheme(theme: ThemeName): ThemeName {
      return SUPPORTED_THEMES.includes(theme) ? theme : DEFAULT_THEME;
    }

    function setPanelOpen(isOpen: boolean): void {
      resolvedThemeButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      resolvedThemePanel.hidden = !isOpen;
    }

    function setTheme(theme: ThemeName): ThemeName {
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

    resolvedThemeButton.addEventListener("click", () => {
      setPanelOpen(Boolean(resolvedThemePanel.hidden));
    });

    themeOptions.forEach((option) => {
      option.addEventListener("click", () => {
        setTheme(option.dataset.theme || DEFAULT_THEME);
        setPanelOpen(false);
        resolvedThemeButton.focus({ preventScroll: true });
      });
    });

    document.addEventListener("click", (event: MouseEvent) => {
      if (resolvedThemePanel.hidden || (event.target instanceof Node && mountElement.contains(event.target))) return;
      setPanelOpen(false);
    });

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape" && !resolvedThemePanel.hidden) {
        setPanelOpen(false);
        resolvedThemeButton.focus({ preventScroll: true });
      }
    });

    setTheme(window.QuillStorage.getTheme(DEFAULT_THEME));
  }

  const themeSelector: ThemeSelectorPort = { mount };
  return themeSelector;
})();
