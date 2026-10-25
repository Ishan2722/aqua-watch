# Aqua Watch

Aqua Watch is a small, student-made project for the Congressional App Challenge. I made it to help people notice pollution along the U.S. West Coast, learn why healthy shorelines matter, and think about simple ways to care for them.

## Features

- Share a Pacific coast observation with a type, concern level, date, exact map location, and short description.
- View shared community reports on a satellite map from Tijuana to Vancouver.
- See labeled city dots, beach wave icons, report warning signs, and beach colors based on nearby reports.
- Explore five source-linked historical report examples.
- Add clearly marked TEST reports to try map filters and beach colors. Test reports stay on this device.
- Filter shared and test reports by type or concern.
- Delete reports submitted in the current browser session.
- Read five in-depth learning sections with NOAA and EPA sources.
- Take an eight-question quiz round drawn from a 40-question bank, with shuffled and evenly balanced answer positions.
- Use the site on a desktop or phone.

## Run it

Open `index.html` in a browser. There are no installs or build steps. An internet connection is needed for Leaflet, Supabase, and satellite map tiles.

The published site is connected to the Supabase project configured in `supabase-config.js`. To use a different database project, follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and replace the project URL and publishable key.

## Data storage and privacy

User reports are stored in the shared Supabase database so they appear for visitors on other devices. Exact coordinates, report type, concern level, date, and description are public. Do not include personal information. Reports are community observations, are not moderated, and do not alert an agency or emergency response team.

The site uses an anonymous browser session so visitors do not need a sign-up form. The database keeps an owner ID for each submission, and its access rules let a visitor delete only their own reports. The session and the list of reports submitted from that browser are stored in that browser; clearing its data can make deletion unavailable. TEST reports and the list of IDs used to show your own contributions are kept in `localStorage`. The historical examples are built into the front-end and are not user submissions.

Reports saved on-device in an earlier version are not uploaded automatically. They stay in the browser's old storage; submit them again if you want them to be public.

## Tools and libraries

- Plain HTML, CSS, and JavaScript
- [Leaflet 1.9.4](https://leafletjs.com/) for the map
- [Supabase JavaScript 2.118.0](https://supabase.com/docs/reference/javascript/introduction) for shared reports
- [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9) satellite tiles, credited on the map
- NOAA and U.S. EPA pages listed in the Learn section

## Demo video

Demo video link: **[Add my video link here]**
