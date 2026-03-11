# Frame --- CS185 W26 Project

Seamless photo sharing across iOS and Android because memories deserve
to be shared, not managed.

------------------------------------------------------------------------

## Overview

Frame is a research-driven design project exploring how event-based
photo sharing can be automated to eliminate friction.

Instead of manually sorting photos, creating albums, and sending links
across multiple platforms, Frame proposes:

-   Automatic event detection\
-   Intelligent photo grouping\
-   Smart, secure share links\
-   Transparent AI-assisted workflows

This website documents the full research and development journey from
GR1 through GR7.

------------------------------------------------------------------------

## Live Site

Hosted via GitHub Pages:

https://`<your-username>`{=html}.github.io/ucsb_cs185_w26_frame/

------------------------------------------------------------------------

## Repository Structure

. ├── index.html \# Main landing page\
├── css/\
│   ├── app_colors.css \# App palette + theme tokens\
│   ├── styles.css \# Shared site styling\
│   └── subpages.css \# Shared demo/GR4 page styling\
├── assets/design/design-elements.md \# Brand/design reference file\
├── pages/ \# Additional website pages\
├── images/ \# Image assets\
└── README.md \# Project documentation

------------------------------------------------------------------------

## Research Progression (GR1--GR7)

### GR1 --- Initial Research

Identified user frustration around post-event photo organization.

### GR2 --- Refined Interviews

Validated that sharing primarily occurs after social events (parties,
trips, campus gatherings).

### GR3 --- Problem Framing

How might we make sharing event photos effortless and intelligent
without requiring manual sorting?

### GR4 --- Ideation

Explored multiple solutions including manual tagging, QR-based grouping,
and collaborative albums.\
Automatic grouping was selected due to lowest friction.

### GR5 --- Prototype

Tested upload flow, grouping visualization, and smart sharing mechanics.

### GR6 --- Street Testing

Observed real users interacting with event photos.\
Identified need for transparency and user control before sharing.

### GR7 --- Final Iteration

Added review step, AI transparency indicators, and improved onboarding
flow.

------------------------------------------------------------------------

## Design System

-   Design reference file: `assets/design/design-elements.md`\
-   Centralized CSS variables\
-   App color themes (`ocean`, `teal`, `sage`) via `data-theme` on `<html>`\
-   Instrument Serif (headlines)\
-   DM Sans (body text)\
-   Scroll-based animation using IntersectionObserver\
-   Fully responsive layout

------------------------------------------------------------------------

## Tech Stack

-   HTML5\
-   CSS3\
-   Vanilla JavaScript\
-   GitHub Pages (static hosting)

No backend or database required.

------------------------------------------------------------------------

## Team

This project was built collaboratively by:

-   Rachit Gupta\
-   Zeel Patel\
-   Gavin Cao

------------------------------------------------------------------------

## How to Run Locally

Clone the repository:

git clone
https://github.com/`<your-username>`{=html}/ucsb_cs185_w26_frame.git\
cd ucsb_cs185_w26_frame

Open index.html in your browser.
