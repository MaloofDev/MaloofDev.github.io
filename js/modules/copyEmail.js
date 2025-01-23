import { site } from "../data/site.js";

export function initCopyEmail() {
  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    const status = button.parentElement.querySelector("[data-copy-status]");

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(site.email);
        status.textContent = "Email copied";
        setTimeout(() => (status.textContent = ""), 2000);
      } catch {
        window.location.href = `mailto:${site.email}`;
      }
    });
  });
}
