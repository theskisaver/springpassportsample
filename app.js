import { CONFIG, regularOptions, topOptions } from "./data.js";

const oneOpt = document.getElementById("oneOpt");
const twoOptA = document.getElementById("twoOptA");
const twoOptB = document.getElementById("twoOptB");
const oneWrap = document.getElementById("oneWrap");
const twoWrap = document.getElementById("twoWrap");
const result = document.getElementById("result");
const twoHint = document.getElementById("twoHint");
const calcBtn = document.getElementById("calc");

const allTwoTripOptions = [
  ...regularOptions.map((x) => ({ ...x, topType: "", key: "", region: x.region })),
  ...topOptions.map((x) => ({ ...x, region: "Top" })),
];

function renderGroupedSelect(selectEl, options, placeholder, includeTop = false) {
  const west = [];
  const east = [];
  const top = [];

  options.forEach((opt, index) => {
    const label = includeTop || opt.region === "Top" ? `${opt.label}` : `${opt.label} - $${opt.price}`;
    const html = `<option value="${index}">${label}</option>`;
    if (opt.region === "West") west.push(html);
    else if (opt.region === "East") east.push(html);
    else top.push(html);
  });

  let html = `<option value="" selected>${placeholder}</option>`;
  html += `<optgroup label="West">${west.join("")}</optgroup>`;
  html += `<optgroup label="East">${east.join("")}</optgroup>`;
  if (includeTop) html += `<optgroup label="SkiMath Top Choice">${top.join("")}</optgroup>`;
  selectEl.innerHTML = html;
}

function setMode(mode) {
  oneWrap.classList.toggle("hidden", mode !== "one");
  twoWrap.classList.toggle("hidden", mode !== "two");
  result.innerHTML = "";
  twoHint.textContent = "";
}

function applyRestrictions() {
  twoHint.textContent = "";
  Array.from(twoOptB.options).forEach((o) => {
    o.disabled = false;
  });

  if (!twoOptA.value) return;
  const selected = allTwoTripOptions[Number(twoOptA.value)];
  if (!selected) return;

  if (selected.topType === "top3") {
    Array.from(twoOptB.options).forEach((opt) => {
      if (!opt.value) return;
      const choice = allTwoTripOptions[Number(opt.value)];
      if (!choice || choice.topType !== "pair") opt.disabled = true;
      if (selected.key === "jackson" && choice?.key === "jackson_gt") opt.disabled = true;
    });
    twoHint.textContent = "Restricted selection detected. Trip Option 2 is now limited to compatible restricted pair options.";
  }

  if (selected.topType === "pair") {
    Array.from(twoOptB.options).forEach((opt) => {
      if (!opt.value) return;
      const choice = allTwoTripOptions[Number(opt.value)];
      if (!choice || choice.topType !== "top3") opt.disabled = true;
      if (selected.key === "jackson_gt" && choice?.key === "jackson") opt.disabled = true;
    });
    twoHint.textContent = "Restricted selection detected. Trip Option 2 is now limited to compatible restricted 3-day options.";
  }

  const selectedOpt = twoOptB.options[twoOptB.selectedIndex];
  if (selectedOpt?.disabled) twoOptB.value = "";
}

function formatResult(total, savings, lines) {
  const isSaving = savings > 0;
  const diffAbs = Math.abs(Math.round(savings));
  const stateClass = isSaving ? "good" : "bad";

  result.innerHTML = `
    <div class="result-card ${stateClass}">
      <p class="decision ${stateClass}">${isSaving ? "YES - This WILL save you money." : "NO - This WILL NOT save you money."}</p>
      <div><strong>Cost of Lift Access with Legends:</strong> $${Math.round(total)}</div>
      <div><strong>Benchmark Pass Cost:</strong> $${CONFIG.benchmarkPass}</div>
      <div><strong>${isSaving ? "Estimated Savings" : "Estimated Extra Cost"}:</strong> <span class="accent ${stateClass}">$${diffAbs}</span></div>
      <div class="hint">Math: $${CONFIG.benchmarkPass} - $${Math.round(total)} = <span class="accent ${stateClass}">${isSaving ? `$${diffAbs}` : `-$${diffAbs}`}</span></div>
    </div>
    <ol class="breakdown">${lines.map((line) => `<li>${line}</li>`).join("")}</ol>
  `;
}

function calculate() {
  const mode = document.querySelector("input[name=mode]:checked")?.value;
  let productCost = 0;
  const lines = [];

  if (mode === "one") {
    if (!oneOpt.value) {
      result.textContent = "Please select a single trip option.";
      return;
    }
    const one = regularOptions[Number(oneOpt.value)];
    productCost += one.price;
    lines.push(`${one.label}: $${one.price}`);
  }

  if (mode === "two") {
    if (!twoOptA.value || !twoOptB.value) {
      result.textContent = "Please select both Trip Option 1 and Trip Option 2.";
      return;
    }

    const a = allTwoTripOptions[Number(twoOptA.value)];
    const b = allTwoTripOptions[Number(twoOptB.value)];
    const aRestricted = a.topType === "top3" || a.topType === "pair";
    const bRestricted = b.topType === "top3" || b.topType === "pair";

    if (aRestricted !== bRestricted) {
      result.textContent = "Restricted options must be paired together. Select two regular options or one compatible restricted pair.";
      return;
    }

    if (aRestricted && bRestricted) {
      if (a.topType === b.topType) {
        result.textContent = "Choose one restricted 3-day option and one restricted pair option.";
        return;
      }
      if ((a.key === "jackson" && b.key === "jackson_gt") || (b.key === "jackson" && a.key === "jackson_gt")) {
        result.textContent = "Jackson Hole restricted options conflict. Choose a different pairing.";
        return;
      }
    }

    productCost += a.price + b.price;
    lines.push(`${a.label}: $${a.price}`);
    lines.push(`${b.label}: $${b.price}`);
  }

  const total = productCost + CONFIG.legendsPrice;
  const savings = CONFIG.benchmarkPass - total;
  formatResult(total, savings, lines);
}

renderGroupedSelect(oneOpt, regularOptions, "Select an option", false);
renderGroupedSelect(twoOptA, allTwoTripOptions, "Select trip option 1", true);
renderGroupedSelect(twoOptB, allTwoTripOptions, "Select trip option 2", true);

document.querySelectorAll("input[name=mode]").forEach((radio) => {
  radio.addEventListener("change", () => setMode(radio.value));
});

twoOptA.addEventListener("change", applyRestrictions);
calcBtn.addEventListener("click", calculate);
setMode("one");
