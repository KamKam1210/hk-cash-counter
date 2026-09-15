import { calculateLineCents, calculateTotals, denominations, formatHKD, sanitizeCount } from "./calculator.mjs";

const STORAGE_KEY = "hk-cash-counter-v1";
const THEME_KEY = "hk-cash-counter-theme";
const counts = loadCounts();
const rows = new Map();

function loadCounts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  const state = document.querySelector("#save-state");
  state.textContent = "已自動儲存";
  state.classList.add("saved-pulse");
  setTimeout(() => state.classList.remove("saved-pulse"), 450);
}

function renderGroup(group, unit) {
  const container = document.querySelector(`#${group}-list`);
  const template = document.querySelector("#denomination-template");

  denominations[group].forEach((amount) => {
    const id = `${group}-${amount}`;
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector(".denomination-row");
    const name = fragment.querySelector(".denomination-name strong");
    const unitLabel = fragment.querySelector(".denomination-name span");
    const input = fragment.querySelector("input");
    const output = fragment.querySelector("output");

    row.dataset.id = id;
    name.textContent = amount < 1 ? `${amount.toFixed(1)} 元` : `${amount} 元`;
    unitLabel.textContent = unit;
    input.value = sanitizeCount(counts[id]);
    input.setAttribute("aria-label", `${amount} 元${unit}數`);
    fragment.querySelector(".minus").setAttribute("aria-label", `${amount} 元減一${unit}`);
    fragment.querySelector(".plus").setAttribute("aria-label", `${amount} 元加一${unit}`);

    const setCount = (next) => {
      counts[id] = sanitizeCount(next);
      input.value = counts[id];
      output.value = formatHKD(calculateLineCents(amount, counts[id]));
      updateTotals();
      persist();
    };

    input.addEventListener("input", () => setCount(input.value));
    input.addEventListener("focus", () => input.select());
    fragment.querySelector(".minus").addEventListener("click", () => setCount(Math.max(0, sanitizeCount(input.value) - 1)));
    fragment.querySelector(".plus").addEventListener("click", () => setCount(sanitizeCount(input.value) + 1));

    output.value = formatHKD(calculateLineCents(amount, input.value));
    rows.set(id, { input, output, amount });
    container.append(fragment);
  });
}

function updateTotals() {
  const totals = calculateTotals(counts);
  document.querySelector("#notes-total").textContent = formatHKD(totals.notes);
  document.querySelector("#coins-total").textContent = formatHKD(totals.coins);
  document.querySelector("#grand-total").textContent = formatHKD(totals.grand);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelector("#theme-toggle").setAttribute("aria-label", theme === "dark" ? "轉用淺色主題" : "轉用深色主題");
}

renderGroup("notes", "張");
renderGroup("coins", "個");
updateTotals();

const storedTheme = localStorage.getItem(THEME_KEY);
setTheme(storedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
document.querySelector("#theme-toggle").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

document.querySelector("#today").textContent = new Intl.DateTimeFormat("zh-HK", { month: "long", day: "numeric", weekday: "long" }).format(new Date());

const dialog = document.querySelector("#confirm-dialog");
document.querySelector("#reset-button").addEventListener("click", () => dialog.showModal());
document.querySelector("#cancel-reset").addEventListener("click", () => dialog.close());
document.querySelector("#confirm-reset").addEventListener("click", () => {
  Object.keys(counts).forEach((key) => delete counts[key]);
  rows.forEach(({ input, output }) => { input.value = 0; output.value = formatHKD(0); });
  updateTotals();
  persist();
  dialog.close();
});
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
