import { CONFIG, regularOptions, topOptions } from "./data.js";

const tripCountEl = document.getElementById("tripCount");
const tripRowsEl = document.getElementById("tripRows");
const addTripBtn = document.getElementById("addTrip");
const removeTripBtn = document.getElementById("removeTrip");
const validationEl = document.getElementById("validation");
const summaryEl = document.getElementById("summary");

const allTripOptions = [
  ...regularOptions.map((x) => ({ ...x, topType: "", key: "", group: x.region })),
  ...topOptions.map((x) => ({ ...x, group: "SkiMath Top Choice" })),
];

let rowCount = Number(tripCountEl.value);

function groupedOptionsHtml(selectedValue = "") {
  const groups = { West: [], East: [], "SkiMath Top Choice": [] };

  allTripOptions.forEach((opt, i) => {
    const label = opt.group === "SkiMath Top Choice" ? opt.label : `${opt.label} - $${opt.price}`;
    const selected = String(i) === String(selectedValue) ? " selected" : "";
    groups[opt.group].push(`<option value="${i}"${selected}>${label}</option>`);
  });

  return `
    <option value="">Select an option</option>
    <optgroup label="West">${groups.West.join("")}</optgroup>
    <optgroup label="East">${groups.East.join("")}</optgroup>
    <optgroup label="SkiMath Top Choice">${groups["SkiMath Top Choice"].join("")}</optgroup>
  `;
}

function renderRows() {
  const previous = Array.from(tripRowsEl.querySelectorAll("select")).map((s) => s.value);
  tripRowsEl.innerHTML = "";

  for (let i = 0; i < rowCount; i += 1) {
    const row = document.createElement("div");
    row.className = "trip-row";
    row.innerHTML = `
      <p class="trip-title">Trip ${i + 1}</p>
      <select data-row="${i}">${groupedOptionsHtml(previous[i] || "")}</select>
    `;
    tripRowsEl.appendChild(row);
  }

  Array.from(tripRowsEl.querySelectorAll("select")).forEach((s) => {
    s.addEventListener("change", updateLiveSummary);
  });
}

function validateRestrictedCombo(selectedOptions) {
  const restricted = selectedOptions.filter((o) => o.topType === "top3" || o.topType === "pair");
  if (restricted.length === 0) return "";

  if (restricted.length % 2 !== 0) {
    return "Restricted Trip Options must be selected in complete pairs.";
  }

  const top3Count = restricted.filter((o) => o.topType === "top3").length;
  const pairCount = restricted.filter((o) => o.topType === "pair").length;

  if (top3Count !== pairCount) {
    return "Restricted Trip Options must include equal counts of 3-day and 2+2 pair selections.";
  }

  const hasJackson3 = restricted.some((o) => o.key === "jackson");
  const hasJacksonPair = restricted.some((o) => o.key === "jackson_gt");
  if (hasJackson3 && hasJacksonPair) {
    return "Jackson Hole 3-day restricted option cannot be combined with Jackson Hole + Grand Targhee 2+2.";
  }

  return "";
}

function renderSummary(total, savings, breakdown, error = "") {
  validationEl.textContent = error;

  const isSaving = savings > 0;
  const stateClass = isSaving ? "good" : "bad";
  const diffAbs = Math.abs(Math.round(savings));

  summaryEl.className = `result-card ${stateClass}`;
  summaryEl.innerHTML = `
    <p class="decision ${stateClass}">${isSaving ? "YES - This WILL save you money." : "NO - This WILL NOT save you money."}</p>
    <div><strong>Cost of Lift Access with Legends:</strong> $${Math.round(total)}</div>
    <div><strong>Benchmark Pass Cost:</strong> $${CONFIG.benchmarkPass}</div>
    <div><strong>${isSaving ? "Estimated Savings" : "Estimated Extra Cost"}:</strong> <span class="accent ${stateClass}">$${diffAbs}</span></div>
    <div>Math: $${CONFIG.benchmarkPass} - $${Math.round(total)} = <span class="accent ${stateClass}">${isSaving ? `$${diffAbs}` : `-$${diffAbs}`}</span></div>
    ${breakdown.length ? `<ol class="breakdown">${breakdown.map((line) => `<li>${line}</li>`).join("")}</ol>` : ""}
  `;
}

function updateLiveSummary() {
  const values = Array.from(tripRowsEl.querySelectorAll("select")).map((s) => s.value);
  const selectedOptions = values
    .filter((v) => v !== "")
    .map((v) => allTripOptions[Number(v)])
    .filter(Boolean);

  const breakdown = selectedOptions.map((o, idx) => `Trip ${idx + 1}: ${o.label} - $${o.price}`);
  const subtotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const total = subtotal + CONFIG.legendsPrice;
  const savings = CONFIG.benchmarkPass - total;

  const error = validateRestrictedCombo(selectedOptions);
  renderSummary(total, savings, breakdown, error);
}

tripCountEl.addEventListener("change", () => {
  rowCount = Number(tripCountEl.value);
  renderRows();
  updateLiveSummary();
});

addTripBtn.addEventListener("click", () => {
  rowCount += 1;
  if (rowCount > 8) rowCount = 8;
  tripCountEl.value = String(rowCount);
  renderRows();
  updateLiveSummary();
});

removeTripBtn.addEventListener("click", () => {
  rowCount -= 1;
  if (rowCount < 1) rowCount = 1;
  tripCountEl.value = String(rowCount);
  renderRows();
  updateLiveSummary();
});

renderRows();
updateLiveSummary();
