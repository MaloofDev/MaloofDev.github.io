/*Nice fallback handling for the email copy feature. 
I had not thought about or seen this approach before, and I really liked the idea of giving users the option to copy the email address directly.
As a small improvement, I would consider adding a clear “Send Email” button as well, even though clicking the email already opens the mail client, 
just to make the action more explicit for the user.*/

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
