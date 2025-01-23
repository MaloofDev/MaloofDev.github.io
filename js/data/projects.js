export const projects = [
  {
    id: "proj-srft",
    name: "Secure Reliable File Transfer",
    date: "Spring 2026",
    team: "Team of 3",
    stack: ["Python", "Raw sockets", "AES-GCM", "AWS EC2"],
    summary:
      "Custom file-transfer protocol over raw UDP with Go-Back-N reliability and AES-GCM authenticated encryption, tested with files up to 800 MB.",
    repo: "https://github.com/MaloofDev/Secure-Reliable-File-Transfer-CS5700-Final-Project",
    image: {
      src: "./images/projects/srft.png",
      alt: "Terminal output from a Secure Reliable File Transfer test run on AWS EC2",
    },
  },
  {
    id: "proj-gamenite",
    name: "GameNite",
    date: "Summer 2026",
    team: "Team project",
    stack: ["TypeScript", "React", "Node.js", "Vitest", "Playwright"],
    summary:
      "Real-time multiplayer game site with Elo-rated matches, live spectating, bracket tournaments, and a leaderboard.",
    repo: "https://github.com/MaloofDev/CS4530-GameNite-Project",
    image: {
      src: "./images/projects/gamenite.png",
      alt: "GameNite player profile page showing rating, wins, losses, and recent opponents",
    },
  },
  {
    id: "proj-elo",
    name: "NBA Elo Engine",
    date: "Jan 2025",
    team: "Solo",
    stack: ["Python", "Pandas", "SQL"],
    summary: "Player rating engine using a modified Glicko-2 algorithm over 68,000+ NBA games.",
    repo: "https://github.com/MaloofDev/NBA-ELO-ENGINE",
    image: {
      src: "./images/projects/elo.svg",
      alt: "Illustration of a player rating chart climbing over time",
    },
  },
  {
    id: "proj-scraper",
    name: "Sports Data Scraper",
    date: "Fall 2023",
    team: "Team of 3",
    stack: ["Java", "JavaFX", "Jsoup"],
    summary:
      "Desktop app that scrapes ESPN stats for four major leagues and calculates expected win percentage, with sortable tables.",
    repo: "https://github.com/MaloofDev/WIT-CS2-FINAL-PROJ",
    image: {
      src: "./images/projects/scraper.svg",
      alt: "Illustration of a sortable table of team stats and expected win percentage",
    },
  },
];
