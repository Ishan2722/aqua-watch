# Connect shared reports

The live Aqua Watch site is already connected to its Supabase project. Follow this guide if you are setting up another project or replacing the current connection.

The site uses Supabase for shared reports. Visitors do not need to create an account. Report type, concern, date, exact map coordinates, and description are public. The database keeps a private owner ID only so a visitor can delete reports submitted from their browser session.

## Set up the database

1. Create a project at [supabase.com](https://supabase.com/) and wait for it to finish setting up.
2. In the project dashboard, open **SQL Editor** and choose **New query**.
3. Open `supabase-schema.sql` from this folder, copy all of it into the query, and select **Run**.
4. Open **Authentication → Sign In / Providers** and enable **Allow anonymous sign-ins**.
5. Open **Project Settings → API**. Copy the **Project URL** and the **publishable key**. An older project may call its public key the `anon` key.

## Connect the website

1. Open `supabase-config.js` in a text editor.
2. Put the Project URL between the quotes after `url:` and the publishable key between the quotes after `publishableKey:`.
3. Save the file and open `index.html` to check the site. A report submitted from the form should appear on the map after it is shared.
4. Upload the updated `index.html`, `app.js`, `supabase-config.js`, and `supabase-schema.sql` to the top level of the GitHub repository. GitHub Pages will publish the update.

The publishable (or legacy `anon`) key is designed for browser use. Never put a `service_role` key or secret key in this folder. The table has row-level security: visitors can read reports, new submissions must belong to an anonymous visitor, and deletes are limited to the report owner.

Test reports stay in the browser and are never uploaded to Supabase. Reports submitted from this site are public, unmoderated community observations and are not official safety notices or alerts. Deleting a report is tied to the anonymous session saved by that browser; clearing browser data can make that session unavailable.

Reports saved locally in an earlier Aqua Watch version are not migrated or published automatically. Re-enter a report if you want it added to the shared map.
