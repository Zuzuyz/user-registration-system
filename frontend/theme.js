const themeContext = {
  key: "rescue-nexus-theme",
  value: "light",
  subscribers: [],
  init() {
    const saved = window.localStorage.getItem(this.key);
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.value = saved || (systemPrefersDark ? "dark" : "light");
    this.apply(this.value);
  },
  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.value);
  },
  setTheme(nextTheme) {
    this.value = nextTheme;
    window.localStorage.setItem(this.key, nextTheme);
    this.apply(nextTheme);
  },
  toggleTheme() {
    this.setTheme(this.value === "dark" ? "light" : "dark");
  },
  apply(theme) {
    document.documentElement.dataset.theme = theme;
    this.subscribers.forEach((callback) => callback(theme));
  }
};

window.themeContext = themeContext;

function attachThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");

  if (!themeToggle) {
    return;
  }

  themeToggle.addEventListener("click", () => {
    themeContext.toggleTheme();
  });

  themeContext.subscribe((theme) => {
    const icon = theme === "dark" ? "☾" : "☀";
    const label = theme === "dark" ? "Night" : "Light";
    themeToggle.querySelector(".theme-icon").textContent = icon;
    themeToggle.querySelector(".theme-label").textContent = label;
  });
}

themeContext.init();
attachThemeToggle();
