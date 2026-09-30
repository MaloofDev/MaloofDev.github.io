/*I like that the hero statistics are calculated dynamically instead of being hardcoded. 
This is a simple but effective way to keep the content easier to maintain over time.*/
import { site } from "../data/site.js";
import { experience } from "../data/experience.js";
import { projects } from "../data/projects.js";

function yearsSince(yearMonth) {
  const [year, month] = yearMonth.split("-").map(Number);
  const now = new Date();
  const years = now.getFullYear() - year;
  return now.getMonth() + 1 < month ? years - 1 : years;
}

export function renderHeroStats() {
  const firstStart = experience.map((role) => role.start).sort()[0];
  const stats = [
    [yearsSince(site.birthMonth), "years old"],
    [`${yearsSince(firstStart)}+`, "year of experience"],
    [experience.length, "roles"],
    [projects.length, "projects"],
  ];

  document.querySelector("[data-hero-stats]").innerHTML = stats
    .map(
      ([value, label]) =>
        `<li class="col-6 col-md-3"><span class="stat-value">${value}</span> ${label}</li>`,
    )
    .join("");
}
