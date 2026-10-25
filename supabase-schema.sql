create or replace function public.aqua_watch_is_us_west_coast(point_lat double precision, point_lng double precision)
returns boolean
language sql
immutable
parallel safe
as $$
  with segments(start_lat, start_lng, end_lat, end_lng) as (
    values
      (48.38, -124.7, 46.25, -124.1),
      (46.25, -124.1, 44.6, -124.0),
      (44.6, -124.0, 42.0, -124.2),
      (42.0, -124.2, 40.4, -124.4),
      (40.4, -124.4, 38.0, -123.0),
      (38.0, -123.0, 37.0, -122.0),
      (37.0, -122.0, 35.3, -120.9),
      (35.3, -120.9, 34.4, -119.7),
      (34.4, -119.7, 34.1, -119.3),
      (34.1, -119.3, 33.7, -118.2),
      (33.7, -118.2, 33.6, -117.9),
      (33.6, -117.9, 33.4, -117.6),
      (33.4, -117.6, 32.7, -117.2),
      (32.7, -117.2, 32.5, -117.1)
  ),
  scaled as (
    select
      point_lat * 110.57 as py,
      point_lng * (111.32 * cos(radians((point_lat + start_lat + end_lat) / 3.0))) as px,
      start_lat * 110.57 as ay,
      start_lng * (111.32 * cos(radians((point_lat + start_lat + end_lat) / 3.0))) as ax,
      end_lat * 110.57 as by,
      end_lng * (111.32 * cos(radians((point_lat + start_lat + end_lat) / 3.0))) as bx
    from segments
  ),
  distances as (
    select sqrt(
      power(px - (ax + ratio * (bx - ax)), 2)
      + power(py - (ay + ratio * (by - ay)), 2)
    ) as distance_km
    from (
      select *, greatest(0.0, least(1.0,
        ((px - ax) * (bx - ax) + (py - ay) * (by - ay))
        / nullif(power(bx - ax, 2) + power(by - ay, 2), 0)
      )) as ratio
      from scaled
    ) projected
  )
  select coalesce(
    point_lat between 32.1 and 49.2
    and point_lng between -126.5 and -116.5
    and exists (select 1 from distances where distance_km <= 35),
    false
  );
$$;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('trash', 'oil', 'runoff', 'algae', 'wildlife', 'other')),
  concern text not null check (concern in ('low', 'medium', 'high')),
  report_date date not null,
  description text not null check (char_length(trim(description)) between 1 and 180),
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now(),
  constraint reports_us_west_coast_location check (public.aqua_watch_is_us_west_coast(lat, lng))
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_location_idx on public.reports (lat, lng);

alter table public.reports enable row level security;

revoke all on table public.reports from anon, authenticated;
grant select (id, type, concern, report_date, description, lat, lng, created_at)
  on table public.reports to anon, authenticated;
grant insert (owner_id, type, concern, report_date, description, lat, lng)
  on table public.reports to authenticated;
grant delete on table public.reports to authenticated;

drop policy if exists "Anyone can view shared reports" on public.reports;
create policy "Anyone can view shared reports"
  on public.reports for select
  to anon, authenticated
  using (true);

drop policy if exists "Anonymous visitors can submit their own reports" on public.reports;
create policy "Anonymous visitors can submit their own reports"
  on public.reports for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and coalesce(auth.jwt() ->> 'is_anonymous', 'false') = 'true'
    and report_date <= current_date
  );

drop policy if exists "People can delete their own reports" on public.reports;
create policy "People can delete their own reports"
  on public.reports for delete
  to authenticated
  using (owner_id = auth.uid());
