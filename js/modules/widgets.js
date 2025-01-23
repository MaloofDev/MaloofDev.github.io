import { hobbies, categories, routine, goals, stats, gifs } from "../data/life.js";

const statusLabels = { done: "done", "in-progress": "in progress", "not-started": "not started" };

function fill(selector, items, template) {
  document.querySelector(selector).innerHTML = items.map(template).join("");
}

export function renderLife() {
  fill(
    "[data-hobbies]",
    hobbies,
    (hobby) => `
      <div class="col-12 col-md-6">
        <article class="panel">
          <img class="photo" src="${hobby.image.src}" alt="${hobby.image.alt}" width="640" height="400" loading="lazy">
          <h3 class="h5">${hobby.title}</h3>
          <p class="muted mb-0">${hobby.copy}</p>
        </article>
      </div>`,
  );

  fill(
    "[data-categories]",
    categories,
    (category) => `
      <li class="col-6 col-lg-3">
        <img class="photo photo-tall" src="${category.image.src}" alt="${category.image.alt}" width="480" height="600" loading="lazy">
        <p class="label mb-0">${category.label}</p>
        <p class="fw-semibold">${category.title}</p>
      </li>`,
  );

  fill(
    "[data-routine]",
    routine,
    (item) => `<li><span class="label">${item.time}</span> ${item.activity}</li>`,
  );

  fill(
    "[data-goals]",
    goals,
    (goal) =>
      `<li>${goal.text} <span class="muted small">(${statusLabels[goal.status]})</span></li>`,
  );

  fill(
    "[data-stats]",
    stats,
    (stat) =>
      `<li><span class="stat-value">${stat.value.toLocaleString("en-US")}</span> ${stat.label}</li>`,
  );

  fill(
    "[data-gifs]",
    gifs,
    (gif) => `<img src="${gif.src}" alt="${gif.alt}" width="160" height="160" loading="lazy">`,
  );
}
