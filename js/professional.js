import { renderHeroStats } from "./modules/heroStats.js";
import { renderCards } from "./modules/cards.js";
import { initCopyEmail } from "./modules/copyEmail.js";

renderHeroStats();
renderCards();
initCopyEmail();
//I like how you separated the JavaScript into ES6 modules. Using dedicated files for reusable logic and data makes the code easier to understand and maintain.
