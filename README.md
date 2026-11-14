✦ ARCANIS ORCHESTRUS

Arcanis Orchestrus is a web-based, interactive card gallery and divination tool. Designed with a sleek "Proxy Terminal" aesthetic, it dynamically synchronizes with a Google Sheet to display a collection of Major and Minor Arcana cards.

✨ Features

Dynamic Data Syncing: Bypasses local file CORS restrictions using JSONP to fetch live data directly from a public Google Sheet. Update your spreadsheet, and the web app updates instantly.

Two Interactive Modes:

Mode: Show: A responsive grid gallery categorizing cards into Major and Minor Arcana.

Mode: Shuffle & Pick (Fate's Draw): Spreads all available cards face-down in a highly interactive, animated pile. Pick a card to reveal your fate.

3D Parallax Modal: Clicking any card opens a detailed view featuring a mouse-tracking 3D tilt effect on the card image.

Tabbed Lore System: The modal includes 4 interactive tabs to display background lore, stats, or readings directly fetched from the spreadsheet.

Proxy Terminal Aesthetic: Custom styling utilizing Orbitron and Chakra Petch fonts, glowing accents, and terminal-grid backgrounds.

🚀 Getting Started

This project uses vanilla web technologies and requires no build steps or local servers to run.

Clone or Download this repository to your local machine.

Open index.html directly in any modern web browser.

Note: The app is designed to work seamlessly even when opened directly from a local file:// path.

Host on the Web: You can easily host this project for free using GitHub Pages, Vercel, or Netlify by simply pushing the files to a repository.

📊 Managing the Data Hub (Google Sheets)

The gallery content is managed entirely via a Google Sheet.

Spreadsheet Setup

Your spreadsheet must have the following column headers (case-insensitive):

Name / Title (e.g., "The Fool")

Arcana / Type (e.g., "Major Arcana" or "Minor Arcana")

Image / URL (Direct link to the card artwork, e.g., an Imgur or Discord attachment link)

Tab 1 (e.g., Background Lore)

Tab 2 (e.g., Upright Meaning)

Tab 3 (e.g., Reversed Meaning)

Tab 4 (e.g., Trivia or Stats)

The script is smart enough to auto-detect columns based on these keywords, even if you add extra columns in between.

Connecting a New Sheet

If you want to duplicate this project or connect a different spreadsheet:

Make sure your Google Sheet's sharing settings are set to "Anyone with the link can view".

Copy the long Sheet ID from your Google Sheet URL (the string of characters between /d/ and /edit).

Open script.js and paste your ID into the constant at the top:

const SHEET_ID = 'YOUR_NEW_SHEET_ID_HERE';


🛠️ Tech Stack

HTML5: Semantic structure and modal layout.

CSS3: Custom animations (drop-ins, flips), CSS Grid/Flexbox, and 3D transforms (preserve-3d, perspective).

JavaScript (ES6): DOM manipulation, JSONP Google Sheets fetching, dynamic card rendering, and mouse-tracking mathematics.

Synchronizing with Data Hub...