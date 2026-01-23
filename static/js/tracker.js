// Habit Tracker Mini Project Extension
// Stores data in localStorage (offline-friendly) + draws a 7-day Canvas chart

const STORAGE_KEY = "habits_v1";

function isoDate(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateStr, delta) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return isoDate(dt);
}

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function streakForHabit(habit, today) {
  // Count consecutive checked days ending today
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = addDays(today, -i);
    if (habit.history && habit.history[day]) streak++;
    else break;
  }
  return streak;
}

function completedCountForDay(habits, day) {
  if (!habits.length) return 0;
  let done = 0;
  for (const h of habits) {
    if (h.history && h.history[day]) done++;
  }
  return done;
}

function render() {
  const today = isoDate();
  const todayLabel = document.getElementById("todayLabel");
  const habitList = document.getElementById("habitList");
  const summaryText = document.getElementById("summaryText");

  todayLabel.textContent = `Date: ${today}`;

  const habits = loadHabits();

  // --- List UI ---
  habitList.innerHTML = "";
  if (habits.length === 0) {
    habitList.innerHTML = `<p style="opacity:0.85;">No habits yet. Add one above.</p>`;
  } else {
    for (const habit of habits) {
      const isDone = !!(habit.history && habit.history[today]);
      const streak = streakForHabit(habit, today);

      const row = document.createElement("div");
      row.className = "habitRow";
      row.innerHTML = `
        <label class="habitItem">
          <input type="checkbox" ${isDone ? "checked" : ""} />
          <span class="habitName"></span>
        </label>
        <span class="habitMeta">🔥 Streak: <b>${streak}</b></span>
        <button class="danger small">Delete</button>
      `;

      row.querySelector(".habitName").textContent = habit.name;

      // toggle checkbox
      row.querySelector("input").addEventListener("change", (e) => {
        const updated = loadHabits();
        const target = updated.find((h) => h.id === habit.id);
        if (!target.history) target.history = {};
        target.history[today] = e.target.checked;
        saveHabits(updated);
        render();
      });

      // delete
      row.querySelector("button").addEventListener("click", () => {
        const updated = loadHabits().filter((h) => h.id !== habit.id);
        saveHabits(updated);
        render();
      });

      habitList.appendChild(row);
    }
  }

  // --- Summary + Canvas chart ---
  const doneToday = completedCountForDay(habits, today);
  const total = habits.length;
  const pct = total === 0 ? 0 : Math.round((doneToday / total) * 100);
  summaryText.textContent = total === 0
    ? "Add habits to see your progress."
    : `Completed today: ${doneToday}/${total} (${pct}%).`;

  drawWeekChart(habits, today);
}

function drawWeekChart(habits, today) {
  const canvas = document.getElementById("weekChart");
  const ctx = canvas.getContext("2d");

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDays(today, -i));

  const totals = habits.length;
  const values = days.map((d) => {
    if (totals === 0) return 0;
    const done = completedCountForDay(habits, d);
    return Math.round((done / totals) * 100);
  });

  // Basic chart layout
  const pad = 40;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  const barW = Math.floor(w / days.length) - 10;

  // Axes
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, pad + h);
  ctx.lineTo(pad + w, pad + h);
  ctx.stroke();

  // Labels + bars
  ctx.font = "14px Arial";

  for (let i = 0; i < days.length; i++) {
    const x = pad + i * (barW + 10) + 10;
    const yBase = pad + h;
    const barH = Math.round((values[i] / 100) * (h - 10));
    const y = yBase - barH;

    // bar
    ctx.fillRect(x, y, barW, barH);

    // day label (MM-DD)
    const short = days[i].slice(5);
    ctx.fillText(short, x, yBase + 18);

    // value label
    ctx.fillText(`${values[i]}%`, x, y - 8);
  }

  // Title
  ctx.fillText("Completion % (last 7 days)", pad, 20);
}

// --- Wire up form/buttons ---
document.addEventListener("DOMContentLoaded", () => {
  const habitForm = document.getElementById("habitForm");
  const habitInput = document.getElementById("habitInput");
  const clearTodayBtn = document.getElementById("clearTodayBtn");
  const resetAllBtn = document.getElementById("resetAllBtn");

  habitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (!name) return;

    const habits = loadHabits();
    habits.push({ id: uid(), name, created: isoDate(), history: {} });
    saveHabits(habits);

    habitInput.value = "";
    render();
  });

  clearTodayBtn.addEventListener("click", () => {
    const today = isoDate();
    const habits = loadHabits();
    for (const h of habits) {
      if (!h.history) h.history = {};
      delete h.history[today];
    }
    saveHabits(habits);
    render();
  });

  resetAllBtn.addEventListener("click", () => {
    saveHabits([]);
    render();
  });

  render();
});
