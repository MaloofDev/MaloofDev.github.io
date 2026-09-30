import { journey } from "../data/journey.js";
//The interactive journey graph is a nice touch. I like how you generate the SVG dynamically with JavaScript and adapt the layout for different screen sizes.
const SVG_NS = "http://www.w3.org/2000/svg";
const HIGHLIGHT_MS = 1500;
const GAP_UNITS = 3;
const FORK_UNITS = 1.2;

const layouts = {
  horizontal: {
    width: 900,
    height: 292,
    unit: 22,
    timeStart: 80,
    laneStart: 60,
    laneGap: 50,
    dotRadius: 7,
  },
  vertical: {
    width: 290,
    height: 690,
    unit: 18,
    timeStart: 40,
    laneStart: 46,
    laneGap: 26,
    dotRadius: 6,
    labelX: 142,
  },
};

const toMonths = (value) => {
  if (value === "today") {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth() + (now.getDate() - 1) / 31;
  }
  const [year, month] = value.split("-").map(Number);
  return year * 12 + month - 1;
};

function svgEl(tag, attrs, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (parent) parent.append(node);
  return node;
}

function createScale(layout) {
  const dated = journey.commits.filter((commit) => commit.date !== "today");
  const start = Math.min(...dated.map((commit) => toMonths(commit.date)));
  const end = Math.max(...dated.map((commit) => toMonths(commit.date)));
  const gaps = journey.gaps.map((gap) => ({ from: toMonths(gap.from), to: toMonths(gap.to) }));

  const units = (months) =>
    gaps.reduce((total, gap) => {
      if (months <= gap.from) return total;
      const inside = Math.min(months, gap.to) - gap.from;
      return total - inside + (inside / (gap.to - gap.from)) * GAP_UNITS;
    }, months - start);

  const time = (months) =>
    layout.timeStart + units(Math.min(Math.max(months, start), end)) * layout.unit;
  return { time, gaps, start, end };
}

export function initJourneyGraph() {
  const root = document.querySelector("[data-journey]");
  if (!root) return;

  const canvas = root.querySelector("[data-journey-canvas]");
  const lanes = journey.branches.map((branch) => branch.name);
  const query = window.matchMedia("(max-width: 767px)");
  const tooltip = document.createElement("div");
  tooltip.className = "journey__tooltip";
  tooltip.setAttribute("aria-hidden", "true");
  tooltip.hidden = true;

  const render = () => {
    const mode = query.matches ? "vertical" : "horizontal";
    canvas.replaceChildren(buildSvg(mode, lanes), tooltip);
    canvas.dataset.mode = mode;
    tooltip.hidden = true;
  };

  render();
  query.addEventListener("change", render);
  renderLegend(root);
  renderList(root);
  bindTooltip(canvas, tooltip);
  bindHighlight(root);
}

function buildSvg(mode, lanes) {
  const layout = layouts[mode];
  const scale = createScale(layout);
  const isVertical = mode === "vertical";
  const lane = (name) => layout.laneStart + lanes.indexOf(name) * layout.laneGap;
  const point = (t, l) => (isVertical ? `${l} ${t}` : `${t} ${l}`);
  const fork = FORK_UNITS * layout.unit;
  const main = lane("main");

  const commits = journey.commits.map((commit) => ({
    ...commit,
    t: scale.time(toMonths(commit.date)) - (commit.type === "merge" ? fork : 0),
  }));
  const head = commits.find((commit) => commit.type === "head");
  const future = commits.find((commit) => commit.type === "future");

  const svg = svgEl("svg", {
    class: `journey__svg journey__svg--${mode}`,
    viewBox: `0 0 ${layout.width} ${layout.height}`,
    role: "img",
  });
  svgEl("title", {}, svg).textContent = "Kaleb's journey as a git commit graph";
  svgEl("desc", {}, svg).textContent =
    "Education and projects run along the main line from 2023 to graduation in May 2027. Each job is a branch: Videeko from May to December 2025, merged back into main; Minuteman from August 2025, ongoing; and OmniTrust from July 2026, ongoing.";

  const curve = (t1, l1, t2, l2) => {
    const mid = (t1 + t2) / 2;
    return `C ${point(mid, l1)} ${point(mid, l2)} ${point(t2, l2)}`;
  };

  const firstT = Math.min(...commits.map((commit) => commit.t)) - layout.unit * 0.8;
  svgEl(
    "path",
    { class: "journey__line branch-main", d: `M ${point(firstT, main)} L ${point(head.t, main)}` },
    svg,
  );
  svgEl(
    "path",
    {
      class: "journey__line journey__line--future branch-main",
      d: `M ${point(head.t, main)} L ${point(future.t, main)}`,
    },
    svg,
  );

  lanes
    .filter((name) => name !== "main")
    .forEach((name) => {
      const start = commits.find((commit) => commit.lane === name && commit.type === "branch");
      const merge = commits.find((commit) => commit.lane === name && commit.type === "merge");
      const l = lane(name);
      const endT = merge ? merge.t : head.t;
      let d = `M ${point(start.t - fork, main)} ${curve(start.t - fork, main, start.t, l)} L ${point(endT, l)}`;
      if (merge) d += ` ${curve(merge.t, l, merge.t + fork, main)}`;
      svgEl("path", { class: `journey__line branch-${name}`, d }, svg);

      if (!merge) {
        const tip = head.t + 12;
        const points = isVertical
          ? `${l - 6},${head.t} ${l},${tip} ${l + 6},${head.t}`
          : `${head.t},${l - 6} ${tip},${l} ${head.t},${l + 6}`;
        svgEl("polygon", { class: `journey__arrow branch-${name}`, points }, svg);
        if (!isVertical) {
          const text = svgEl(
            "text",
            { class: `journey__label journey__label--branch branch-${name}`, x: tip + 6, y: l + 4 },
            svg,
          );
          text.textContent = "ongoing";
        }
      }
    });

  scale.gaps.forEach((gap) => {
    const center = (scale.time(gap.from) + scale.time(gap.to)) / 2;
    const bg = isVertical
      ? { x: main - 14, y: center - 10, width: 28, height: 20 }
      : { x: center - 10, y: main - 14, width: 20, height: 28 };
    svgEl("rect", { class: "journey__break-bg", ...bg }, svg);
    [-4, 4].forEach((offset) => {
      const [x1, y1] = point(center + offset - 4, main + 11).split(" ");
      const [x2, y2] = point(center + offset + 4, main - 11).split(" ");
      svgEl("line", { class: "journey__break", x1, y1, x2, y2 }, svg);
    });
  });

  drawAxis(svg, layout, scale, isVertical);
  commits.forEach((commit, index) => drawCommit(svg, commit, index, { layout, lane, isVertical }));
  return svg;
}

function drawAxis(svg, layout, scale, isVertical) {
  const firstYear = Math.floor(scale.start / 12);
  const lastYear = Math.floor(scale.end / 12);
  const axisY = layout.height - 30;

  if (!isVertical) {
    svgEl(
      "line",
      {
        class: "journey__axis",
        x1: layout.timeStart - 20,
        y1: axisY,
        x2: layout.width - 40,
        y2: axisY,
      },
      svg,
    );
  }

  for (let year = firstYear; year <= lastYear; year += 1) {
    const months = Math.max(year * 12, scale.start);
    if (scale.gaps.some((gap) => months > gap.from && months < gap.to)) continue;
    const t = scale.time(months);
    const attrs = isVertical
      ? { x: 6, y: t + 4 }
      : { x: t, y: axisY + 18, "text-anchor": "middle" };
    svgEl("text", { class: "journey__year", ...attrs }, svg).textContent = String(year);
  }
}

function drawCommit(svg, commit, index, { layout, lane, isVertical }) {
  const l = lane(commit.lane);
  const [cx, cy] = isVertical ? [l, commit.t] : [commit.t, l];
  const label = `${commit.label}, ${commit.range}`;

  const attrs = commit.target
    ? { href: `#${commit.target}`, "data-target": commit.target, "aria-label": label }
    : { tabindex: "0", role: "img", "aria-label": `${label}. ${commit.summary}` };
  const group = svgEl(commit.target ? "a" : "g", attrs, svg);
  group.setAttribute(
    "class",
    `journey__commit journey__commit--${commit.type} branch-${commit.lane}`,
  );
  group.dataset.commit = index;

  const r = commit.type === "head" ? layout.dotRadius - 2 : layout.dotRadius;
  svgEl("circle", { class: "journey__ring", cx, cy, r: layout.dotRadius + 6 }, group);
  svgEl("circle", { class: "journey__dot", cx, cy, r }, group);

  const onMain = commit.lane === "main";
  const textAttrs = isVertical
    ? { x: layout.labelX, y: cy + 4 }
    : { x: cx, y: onMain ? cy - 18 : cy + 26, "text-anchor": "middle" };
  const text = svgEl(
    "text",
    {
      class: `journey__label${onMain ? "" : " journey__label--branch"}${commit.type === "head" ? " journey__label--head" : ""}`,
      ...textAttrs,
    },
    group,
  );
  text.textContent = commit.label;
}

function renderLegend(root) {
  const legend = root.querySelector("[data-journey-legend]");
  if (!legend) return;
  legend.innerHTML = journey.branches
    .map(
      (branch) => `
        <li class="journey__legend-item branch-${branch.name}">
          <span class="journey__swatch" aria-hidden="true"></span>${branch.label}
        </li>`,
    )
    .join("");
}

function renderList(root) {
  const list = root.querySelector("[data-journey-list]");
  if (!list) return;
  list.innerHTML = journey.commits
    .map((commit) => {
      const text = `${commit.label}, ${commit.range}: ${commit.summary}`;
      return commit.target
        ? `<li><a href="#${commit.target}" data-target="${commit.target}">${text}</a></li>`
        : `<li>${text}</li>`;
    })
    .join("");
}

function bindTooltip(canvas, tooltip) {
  const show = (group) => {
    const commit = journey.commits[Number(group.dataset.commit)];
    tooltip.innerHTML = `
      <strong class="journey__tooltip-title">${commit.label}</strong>
      <span class="journey__tooltip-range">${commit.range}</span>
      <span class="journey__tooltip-summary">${commit.summary}</span>`;
    tooltip.hidden = false;

    const dot = group.querySelector(".journey__dot").getBoundingClientRect();
    const box = canvas.getBoundingClientRect();
    const half = tooltip.offsetWidth / 2;
    const center = dot.left + dot.width / 2 - box.left;
    tooltip.style.left = `${Math.min(Math.max(center, half), box.width - half)}px`;
    tooltip.style.top = `${dot.top - box.top}px`;
  };
  const hide = () => {
    tooltip.hidden = true;
  };
  const commitFrom = (event) => event.target.closest?.(".journey__commit");

  canvas.addEventListener("mouseover", (event) => {
    const group = commitFrom(event);
    if (group) show(group);
  });
  canvas.addEventListener("mouseout", (event) => {
    const group = commitFrom(event);
    if (group && !group.contains(event.relatedTarget)) hide();
  });
  canvas.addEventListener("focusin", (event) => {
    const group = commitFrom(event);
    if (group) show(group);
  });
  canvas.addEventListener("focusout", hide);
  canvas.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hide();
  });
}

function bindHighlight(root) {
  root.addEventListener("click", (event) => {
    const link = event.target.closest("[data-target]");
    if (!link) return;
    const card = document.querySelector(`[data-card="${link.dataset.target}"]`);
    if (!card) return;

    card.classList.add("is-highlighted");
    clearTimeout(card.highlightTimer);
    card.highlightTimer = setTimeout(() => card.classList.remove("is-highlighted"), HIGHLIGHT_MS);
  });
}
