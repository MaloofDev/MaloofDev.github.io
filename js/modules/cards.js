import { experience } from "../data/experience.js";
import { projects } from "../data/projects.js";

const monthYear = (value) => {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const list = (items, className) =>
  `<ul class="${className}">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

function experienceCard(role) {
  const dates = `${monthYear(role.start)} to ${role.end ? monthYear(role.end) : "present"}`;
  const link = role.link
    ? `<a href="${role.link.href}" target="_blank" rel="noopener">${role.link.label}</a>`
    : "";

  return `
    <div class="col-12 col-lg-4">
      <article class="panel exp-panel branch-${role.branch}" id="${role.id}" data-card="${role.id}">
        <img class="logo" src="${role.logo.src}" alt="${role.logo.alt}" width="900" height="300" loading="lazy">
        <h3 class="h5 mb-1">${role.company}</h3>
        <p class="mb-1 fw-semibold">${role.role}</p>
        <p class="muted small">${role.location} · ${dates}</p>
        ${list(role.key, "mb-3")}
        ${list(role.stack, "chips")}
        ${link}
      </article>
    </div>`;
}

function projectCard(project) {
  return `
    <div class="col-12 col-md-6">
      <article class="panel" id="${project.id}" data-card="${project.id}">
        <img class="screenshot" src="${project.image.src}" alt="${project.image.alt}" width="800" height="450" loading="lazy">
        <h3 class="h5 mb-1">${project.name}</h3>
        <p class="muted small">${project.date} · ${project.team}</p>
        <p>${project.summary}</p>
        ${list(project.stack, "chips")}
        <a href="${project.repo}" target="_blank" rel="noopener">View on GitHub<span class="visually-hidden"> (${project.name})</span></a>
      </article>
    </div>`;
}

export function renderCards() {
  document.querySelector("[data-experience]").innerHTML = experience.map(experienceCard).join("");
  document.querySelector("[data-projects]").innerHTML = projects.map(projectCard).join("");
}
