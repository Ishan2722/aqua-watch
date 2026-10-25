# Aqua Watch submission guide

## 1. Upload the folder to a new public GitHub repository

The live project is already configured in `supabase-config.js`. If you switch to a different Supabase project, complete [SUPABASE_SETUP.md](SUPABASE_SETUP.md) first. The publishable key is intended for the site; never upload a `service_role` or secret key.

1. Sign in to [GitHub](https://github.com/) and choose **New repository**.
2. Name it `aqua-watch`, choose **Public**, and create it. You can leave the “Add a README” option off because this folder already has one.
3. In the new repository, select **Add file → Upload files**.
4. Open the `aqua-watch` folder on your computer. Drag all files inside it, including `index.html`, `style.css`, `app.js`, `supabase-config.js`, `supabase-schema.sql`, `SUPABASE_SETUP.md`, `README.md`, `SUBMISSION_GUIDE.md`, `logo.svg`, and `.gitignore`, into the upload area. Upload the files into the repository's top level; don't upload an extra enclosing `aqua-watch` folder.
5. Add a short commit message such as `Add Aqua Watch site`, then select **Commit changes**.

## 2. Turn on GitHub Pages

1. In the repository, open **Settings**.
2. In the left sidebar, choose **Pages**.
3. Under **Build and deployment**, set the source to **Deploy from a branch**.
4. Choose the `main` branch and the `/ (root)` folder, then select **Save**.
5. Wait for publishing to finish. The Pages panel will show the live address, usually `https://YOUR-USERNAME.github.io/aqua-watch/`. Open it and check the site.

## 3. Download a ZIP backup

1. Return to the repository's **Code** page.
2. Select the green **Code** button.
3. Choose **Download ZIP** and save the ZIP somewhere easy to find.

## 4. Submit your links

1. Open the Congressional App Challenge submission form.
2. Paste the public GitHub repository link where it asks for the project or source-code link.
3. Paste the GitHub Pages live address where it asks for a demo or website link, if that field is available.
4. Add your demo video link after you upload it, then review the form and submit.

## 1–3 minute demo video outline

- **Problem (15–25 sec):** Explain why U.S. coasts matter and why noticing pollution is a useful first step.
- **Reporting walkthrough (25–35 sec):** Pick a coastal point, choose a pollution type and concern level, add a short description, and share it. Explain that exact locations and descriptions are public.
- **Map walkthrough (20–30 sec):** Zoom with the wheel or map buttons, point out city labels, beach waves and report-based color badges, then click an aqua-outlined warning example to show its public source. Add the TEST reports to demonstrate filters and delete them from the Report page afterward; TEST reports stay on the device.
- **Learn and quiz (25–40 sec):** Show the five Learn topics and sources, then answer a quiz question to reveal its explanation. Mention that each round draws eight questions from the 40-question bank and varies the answer positions.
- **Technical challenge (15–25 sec):** Describe how you connected a shared database while using access rules to keep report deletion limited to the person who submitted it, and how the map checks that report locations are along the U.S. West Coast.
- **What I learned (10–20 sec):** Share what you learned about coasts, making a simple website, or testing an idea.
