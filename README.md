# The Way Inn — site concept (TWI)

A high-end **concept redesign** for [thewayinn.co.il](https://thewayinn.co.il/) — the boutique
suite hotel in a 250-year-old stone house in the Artists' Quarter of Safed (Tzfat), founded by
Chef Rony BarEl & Genine.

This is a **design concept**, kept `noindex` so it never competes with the live business site. It
is the hotel-facing sibling of the [La Buffet flagship (BC)](https://wattsonworks.github.io/BC/).

## The idea

The hotel is built on the Kabbalah — its ten suites are named for the ten **Sephirot** of the
Tree of Life. So the Tree of Life *is* the spine of the site:

- **Flower-of-Life preloader** that draws itself.
- **Interactive Tree of Life** — ten glowing Sephirot nodes + the twenty-two connecting paths;
  each node is a suite, and selecting one reveals it.
- **3D walk through Safed's old city** (lazy-loaded Three.js) down to the real blue gate at
  Simtat Yud-Zayin 23, the Flower-of-Life medallion on the wall beyond it — graded to the **real
  Safed solar time** so a night visitor arrives in the dark.
- **Rooftop sunset** — a scroll-driven sun setting over the real Galilee panorama, fading to stars.
- **Hammam & spa** steam section.
- **"Compose your stay"** — pick a Sephirah suite, date, nights and guests → a prefilled WhatsApp
  reservation request.

Carried over and elevated from the buffet flagship: Lenis smooth scroll, GSAP + ScrollTrigger
choreography, masked word reveals, magnetic CTAs, a horizontal gallery, and full
reduced-motion / no-JS fallbacks.

## Tech

Single-file `index.html`. GSAP 3.12 + ScrollTrigger, Lenis 1.1, Three.js r128 (lazy). Fonts:
Frank Ruhl Libre (Hebrew serif), Cormorant Garamond (Latin display), Heebo (sans). RTL Hebrew.

## Run locally

```
python -m http.server 8025 --directory .
```

Then open http://localhost:8025/

## Status

Concept / not the production site. Do **not** swap to production without the owner's explicit OK.
