-- =====================================================================

create extension if not exists pgcrypto;
-- Vouch — Demo v1 schema + seed  (PRD §29)
--
-- Run this once in the Supabase SQL editor (SQL → New query → paste → Run).
-- Safe to re-run: it drops and recreates the demo tables from scratch.
--
-- Coordinates are synthetic Chennai demo data. The seed values are chosen so
-- the hero scenario ticks the pothole to 8 reports / 7 riders / 0.91 (PRD §14).
--
-- RLS policies here are DEMO-GRADE (open to the anon key) so the client can
-- read/write without auth. This is NOT a production security posture.
-- =====================================================================

drop table if exists road_reports cascade;
drop table if exists rider_events cascade;
drop table if exists trips cascade;
drop table if exists road_events cascade;
drop table if exists riders cascade;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------
create table riders (
  id             text primary key,
  name           text not null,
  vouch_score    int not null default 74,
  score_factors  jsonb not null default '[{"key":"context_aware","label":"Context-aware riding","delta":8},{"key":"smooth_acceleration","label":"Smooth acceleration","delta":4},{"key":"safe_braking","label":"Safe braking","delta":3},{"key":"unexplained_manoeuvres","label":"Unexplained manoeuvres","delta":-2}]'::jsonb,
  total_distance numeric not null default 0,
  created_at     timestamptz not null default now()
);

create table trips (
  id           text primary key,
  rider_id     text not null references riders(id) on delete cascade,
  start_time   timestamptz,
  end_time     timestamptz,
  distance     numeric not null default 0,
  score_change int not null default 0,
  created_at   timestamptz not null default now()
);

create table road_events (
  id             text primary key,
  type           text not null check (type in ('pothole','speed_breaker','waterlogging','debris')),
  latitude       double precision not null,
  longitude      double precision not null,
  confidence     numeric not null default 0.5,
  status         text not null default 'possible' check (status in ('possible','probable','confirmed')),
  reports        int not null default 1,
  riders         int not null default 1,
  first_detected text,
  last_confirmed text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table rider_events (
  id             text primary key,
  trip_id        text not null references trips(id) on delete cascade,
  rider_id       text not null references riders(id) on delete cascade,
  event_type     text not null,
  latitude       double precision not null,
  longitude      double precision not null,
  motion_data    jsonb,
  context_result jsonb,
  confidence     numeric not null default 0,
  created_at     timestamptz not null default now()
);

create table road_reports (
  id            uuid primary key default gen_random_uuid(),
  road_event_id text references road_events(id) on delete cascade,
  rider_id      text not null references riders(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create index on rider_events (created_at desc);
create index on road_reports (road_event_id);
create unique index road_reports_event_rider_unique on road_reports (road_event_id, rider_id);

-- ---------------------------------------------------------------------
-- Seed data (mirrors src/config/demoData.ts exactly)
-- ---------------------------------------------------------------------
insert into riders (id, name, vouch_score, score_factors, total_distance, created_at) values
  ('rider-demo-1', 'Rahul K.', 87, '[{"key":"context_aware","label":"Context-aware riding","delta":8},{"key":"smooth_acceleration","label":"Smooth acceleration","delta":4},{"key":"safe_braking","label":"Safe braking","delta":3},{"key":"unexplained_manoeuvres","label":"Unexplained manoeuvres","delta":-2}]', 2847.6, '2025-11-02T06:00:00Z');

insert into trips (id, rider_id, start_time, end_time, distance, score_change) values
  ('trip-earlier-1', 'rider-demo-1', '2026-09-03T02:00:00Z', '2026-09-03T04:30:00Z', 12.1, 5);

insert into road_events
  (id, type, latitude, longitude, confidence, status, reports, riders, first_detected, last_confirmed, created_at, updated_at)
values
  ('road-pothole-hero',    'pothole',       13.0700, 80.2498, 0.88, 'confirmed', 7, 6, '09:42', '10:18', '2026-09-03T04:12:00Z', '2026-09-03T04:48:00Z'),
  ('road-speedbreaker-1',  'speed_breaker', 13.0602, 80.2422, 0.84, 'confirmed', 5, 4, '08:55', '10:02', '2026-09-03T03:25:00Z', '2026-09-03T04:32:00Z'),
  ('road-waterlogging-1',  'waterlogging',  13.0655, 80.2450, 0.76, 'probable',  3, 3, '09:10', '09:58', '2026-09-03T03:40:00Z', '2026-09-03T04:28:00Z'),
  ('road-debris-1',        'debris',        13.0800, 80.2568, 0.69, 'possible',  2, 2, '09:33', '09:47', '2026-09-03T04:03:00Z', '2026-09-03T04:17:00Z');

insert into rider_events
  (id, trip_id, rider_id, event_type, latitude, longitude, motion_data, context_result, confidence, created_at)
values
  (
    'rider-event-seed-1', 'trip-earlier-1', 'rider-demo-1', 'lateral_manoeuvre', 13.0602, 80.2420,
    '{"lateralG":0.42,"longitudinalG":-0.05,"gyroZ":28,"speed":34,"timestamp":0}',
    '{"eventType":"lateral_manoeuvre","context":["pothole_detected"],"confidence":0.9,"verdict":"likely_justified","explanation":"Lateral movement coincided with a nearby pothole on the road.","signals":{"motion":true,"roadContext":true,"rearApproach":false},"nearbyEvent":null,"cameraDetection":null,"hazardDistanceM":9}',
    0.9, '2026-09-03T04:12:00Z'
  ),
  (
    'rider-event-seed-2', 'trip-earlier-1', 'rider-demo-1', 'hard_braking', 13.0655, 80.2455,
    '{"lateralG":0.06,"longitudinalG":-0.58,"gyroZ":4,"speed":41,"timestamp":0}',
    '{"eventType":"hard_braking","context":["obstacle_detected"],"confidence":0.82,"verdict":"likely_justified","explanation":"Hard braking coincided with an obstacle detected ahead.","signals":{"motion":true,"roadContext":false,"rearApproach":true},"nearbyEvent":null,"cameraDetection":null,"hazardDistanceM":null}',
    0.86, '2026-09-03T02:47:00Z'
  ),
  (
    'rider-event-seed-3', 'trip-earlier-1', 'rider-demo-1', 'lateral_manoeuvre', 13.0545, 80.2385,
    '{"lateralG":0.38,"longitudinalG":-0.02,"gyroZ":22,"speed":29,"timestamp":0}',
    '{"eventType":"lateral_manoeuvre","context":[],"confidence":0.4,"verdict":"context_unclear","explanation":"Lateral movement detected with no supporting road or surrounding context.","signals":{"motion":true,"roadContext":false,"rearApproach":false},"nearbyEvent":null,"cameraDetection":null,"hazardDistanceM":null}',
    0.71, '2026-09-03T02:21:00Z'
  );

-- ---------------------------------------------------------------------
-- Row Level Security — demo-grade open access via the anon key
-- ---------------------------------------------------------------------
alter table riders       enable row level security;
alter table trips        enable row level security;
alter table road_events  enable row level security;
alter table rider_events enable row level security;
alter table road_reports enable row level security;

create policy "demo_all_riders"       on riders       for all to anon, authenticated using (true) with check (true);
create policy "demo_all_trips"        on trips        for all to anon, authenticated using (true) with check (true);
create policy "demo_all_road_events"  on road_events  for all to anon, authenticated using (true) with check (true);
create policy "demo_all_rider_events" on rider_events for all to anon, authenticated using (true) with check (true);
create policy "demo_all_road_reports" on road_reports for all to anon, authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- Realtime — push road-event changes to connected riders (shared map)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'road_events'
  ) then
    alter publication supabase_realtime add table road_events;
  end if;
end
$$;
