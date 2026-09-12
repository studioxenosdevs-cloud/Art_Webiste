# Supabase migration and fresh-project runbook

## What the application requires

The application uses the `public` tables `artworks`, `inquiries`, `reviews`,
`timeline`, and `settings`, plus a public Storage bucket named `artworks`.
Database columns are always `snake_case`; React models are mapped to camelCase
only in `src/lib/mappers.ts`.

The complete, idempotent bootstrap is [supabase_schema.sql](./supabase_schema.sql).
It creates tables, constraints, indexes, timestamp triggers, RLS policies, the
Storage bucket, and initial timeline/settings records. It is designed for a
new Supabase project with no application tables or policies.

## Move to a new Supabase account/project

1. In the old project, export data you need from each application table using
   the Supabase Table Editor or `pg_dump`. Do not export `auth.users` through
   the browser client; user migration needs the Supabase admin/API tooling.
2. Create the new Supabase project. In **Project Settings → API**, copy the
   Project URL and the **anon** key (never the service-role key).
3. In the new project, open **SQL Editor**, paste the entire contents of
   `supabase_schema.sql`, and run it once. Confirm that the query succeeds.
4. Import old data only after schema setup. Import parent `artworks` before
   `inquiries`, because `inquiries.artwork_id` references it. Preserve UUIDs
   if you want existing links to remain valid.
5. In **Authentication → Users**, create the admin user, then log in once via
   `/admin`. Email/password authentication must be enabled in **Auth →
   Providers**.
6. In **Database → Replication**, add `artworks`, `reviews`, `inquiries`, and
   `timeline` to the `supabase_realtime` publication if live updates are
   desired.
7. Update local and deployed environment variables, then redeploy:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

8. Run `npm run typecheck`, `npm run build`, and perform the smoke test below.

## Existing project compatibility

The deployed project shown in the audit already stores reviews in `author_name`
and `comment`; that is the current supported contract. No column rename is
needed for that project. If an older database instead has `author` and
`message`, migrate it before deploying the current client:

```sql
alter table public.reviews rename column author to author_name;
alter table public.reviews rename column message to comment;
```

Run those two statements only when those old column names actually exist.
The SQL editor schema visualizer is the source of truth; do not run a rename
blindly.

For legacy inquiry statuses, the frontend safely displays unknown values as
`new`. Normalize the stored data once:

```sql
update public.inquiries
set status = 'new'
where status is null or status not in ('new', 'contacted', 'completed');
```

## Production security notes

- Public visitors can read artworks, timeline entries, and approved reviews.
- Public visitors can submit inquiries and unapproved reviews.
- Inquiries, settings, and review moderation require an authenticated session.
- Storage upload/delete requires an authenticated session; image reads are
  public because artwork URLs are displayed on the public site.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in Vite variables, source code, or
  the browser. It bypasses RLS.

The included policies use `authenticated` for the admin dashboard. For a
multi-user production system, replace those policies with a role/claim-based
`is_admin()` policy before allowing general user sign-up.

## Smoke test

1. Public site: gallery loads and approved review text/initials appear.
2. Public site: submit a review; it is pending and does not appear publicly.
3. Admin: sign in, approve it, and confirm it appears in the marquee.
4. Admin: create/edit/delete an artwork and upload one image.
5. Public site: submit an inquiry; admin sees it and can move it through all
   three statuses.
6. Refresh two browser tabs and confirm realtime changes propagate.
