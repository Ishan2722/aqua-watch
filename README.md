# Aqua Watch

Aqua Watch is a small, student-made project for the Congressional App Challenge. I made it to help people notice pollution along the U.S. West Coast, learn why healthy shorelines matter, and think about simple ways to care for them.

## Features

- Record a Pacific coast observation with a type, concern level, date, description, and map location.
- View a satellite map from Tijuana to Vancouver, with historical public examples and reports saved on this device as separate markers.
- See labeled city dots and warning-sign report pins colored by concern level; public examples have an aqua outline. Zoom with the wheel, buttons, or touch.
- See beach wave icons and labels on the ocean side, city labels on the land side, and short descriptions when a beach is clicked. Beach colors reflect nearby local reports (not official water-quality alerts).
- Explore five historical, source-linked public report examples. They are separate from reports saved on this device and do not affect beach colors.
- Add three clearly labeled test reports to try map filters and beach colors, then delete them from the Report page.
- Filter reports on the map by type or concern.
- Delete your own saved reports.
- Read three short learning sections and visit the sources.
- Take an eight-question quiz with instant explanations and a retry option.
- Use a responsive dark layout on desktop or phone.
- Show the Aqua Watch logo in the navigation and as the browser tab icon.

## Run it

Open `index.html` in a browser. There are no installs, accounts, terminal commands, or build steps. An internet connection is needed to load Leaflet and satellite map tiles.

## Data storage

Reports you submit are stored only in this browser's `localStorage` on this device. They are not sent to anyone, and there is no backend, shared database, or agency connection. Clearing browser data may remove them. The five source-linked historical examples are built into the front-end and are not saved as user reports.

## Tools and libraries

- Plain HTML, CSS, and JavaScript
- [Leaflet 1.9.4](https://leafletjs.com/) for the map
- [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9) satellite tiles, credited on the map
- NOAA and U.S. EPA pages listed in the Learn section

## Demo video

Demo video link: **[Add my video link here]**
