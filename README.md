# NovaDesk — Coworking Landing Page

A clean, high-converting, mobile-responsive landing page for **NovaDesk Coworking Space**, built for Sarah Lin's pre-launch email/day-pass sign-up campaign.

Built with plain **HTML5, CSS3, and vanilla JavaScript** — no frameworks, no build step.

## Live demo

Open `index.html` in a browser, or host the folder on GitHub Pages / Netlify / Vercel and drop the live URL here:

`https://your-username.github.io/novadesk-landing/`

## Screenshot

`screenshot.png` — add a screenshot of the finished hero section here before publishing the repo.

## Features

- Sticky navbar that shrinks and picks up a blur + shadow after 50px of scroll
- Dark / light mode toggle, preference saved in `localStorage`
- Responsive hamburger menu below 720px
- "Claim Free Day Pass" / "Book a Tour" buttons smoothly scroll to the booking form and briefly highlight it
- Day-pass booking form with client-side validation (required fields + email format) and a live inline success state on submit
- Form submissions post to [Formspree](https://formspree.io/) so they land in your inbox with zero backend
- 4-card feature grid, 3-tier pricing table with a "Most Popular" badge, location section, and FAQ accordion

## Project structure

```
novadesk-landing/
├── index.html      # Markup + section content
├── style.css        # Design tokens, layout, responsive rules
├── script.js         # Navbar, theme toggle, scroll behavior, form logic
└── README.md
```

## Setup

No build tools required.

1. Clone the repo
2. Open `index.html` directly in a browser, or serve it locally:
   ```bash
   npx serve .
   ```

## Wiring up the booking form

The form in `script.js` posts to a Formspree endpoint:

```js
const FORM_ENDPOINT = "https://formspree.io/f/xwvgewkl";
```

Swap in your own Formspree endpoint (or any endpoint that accepts a JSON POST) if you fork this for a different project. Formspree will forward each submission to the account email on file — no server code needed.

## Browser support

Tested in the latest Chrome, Firefox, Safari, and Edge. Uses `backdrop-filter` and `color-mix()`; both degrade gracefully to a solid background in older browsers.

## Credits

Photography via [Unsplash](https://unsplash.com). Fonts: [Outfit](https://fonts.google.com/specimen/Outfit) and [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts.
