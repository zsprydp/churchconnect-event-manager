-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text default '',
  role text not null default 'member' check (role in ('admin', 'coordinator', 'volunteer', 'member')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can read all profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can manage profiles" on profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Households
create table households (
  id bigint generated always as identity primary key,
  name text not null,
  address text default '',
  primary_contact_id uuid references profiles(id),
  created_at timestamptz default now()
);

alter table households enable row level security;
create policy "Authenticated users can read households" on households for select using (auth.uid() is not null);
create policy "Coordinators can manage households" on households for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

-- Household members
create table household_members (
  id bigint generated always as identity primary key,
  household_id bigint not null references households(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  relationship text not null default 'member' check (relationship in ('head', 'spouse', 'child', 'other')),
  created_at timestamptz default now()
);

alter table household_members enable row level security;
create policy "Authenticated users can read household members" on household_members for select using (auth.uid() is not null);
create policy "Coordinators can manage household members" on household_members for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

-- Events
create table events (
  id bigint generated always as identity primary key,
  name text not null,
  date_type text not null default 'single',
  dates text[] default '{}',
  start_time text default '09:00',
  end_time text default '17:00',
  recurrence_pattern text,
  location text default '',
  capacity int default 50,
  registration_fee numeric(10,2) default 0,
  donation_goal numeric(10,2) default 0,
  donations_total numeric(10,2) default 0,
  status text not null default 'active' check (status in ('active', 'closed', 'archived')),
  event_type text default '',
  custom_questions jsonb default '[]',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table events enable row level security;
create policy "Anyone can read events" on events for select using (true);
create policy "Coordinators can manage events" on events for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

-- Volunteers
create table volunteers (
  id bigint generated always as identity primary key,
  profile_id uuid references profiles(id),
  name text not null,
  email text not null,
  phone text default '',
  role text default 'Volunteer',
  security_level text default 'volunteer',
  created_at timestamptz default now()
);

alter table volunteers enable row level security;
create policy "Anyone can read volunteers" on volunteers for select using (auth.uid() is not null);
create policy "Coordinators can manage volunteers" on volunteers for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

-- Event volunteer assignments
create table event_volunteers (
  event_id bigint references events(id) on delete cascade,
  volunteer_id bigint references volunteers(id) on delete cascade,
  primary key (event_id, volunteer_id)
);

alter table event_volunteers enable row level security;
create policy "Anyone can read assignments" on event_volunteers for select using (auth.uid() is not null);
create policy "Coordinators can manage assignments" on event_volunteers for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

-- Attendees
create table attendees (
  id bigint generated always as identity primary key,
  event_id bigint not null references events(id) on delete cascade,
  household_id bigint references households(id),
  primary_name text not null,
  email text not null,
  phone text default '',
  registration_date date default current_date,
  checked_in boolean default false,
  payment_status text default 'pending',
  group_members jsonb default '[]',
  custom_responses jsonb default '{}',
  created_at timestamptz default now()
);

alter table attendees enable row level security;
create policy "Anyone can read attendees" on attendees for select using (auth.uid() is not null);
create policy "Coordinators can manage attendees" on attendees for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

-- Communications
create table communications (
  id bigint generated always as identity primary key,
  type text not null default 'announcement',
  subject text not null,
  message text not null,
  recipients text default '',
  sent_date date default current_date,
  sent_by text default 'Admin',
  recipient_count int default 0,
  send_via text default 'email',
  status text default 'sent',
  created_at timestamptz default now()
);

alter table communications enable row level security;
create policy "Authenticated can read communications" on communications for select using (auth.uid() is not null);
create policy "Coordinators can manage communications" on communications for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

-- Payments
create table payments (
  id bigint generated always as identity primary key,
  event_id bigint references events(id),
  attendee_id bigint references attendees(id),
  event_name text default '',
  attendee_name text default '',
  attendee_count int default 1,
  amount numeric(10,2) not null,
  payment_method text default '',
  status text default 'pending',
  date date default current_date,
  transaction_id text default '',
  stripe_session_id text,
  description text default '',
  recipient_email text default '',
  created_at timestamptz default now()
);

alter table payments enable row level security;
create policy "Authenticated can read payments" on payments for select using (auth.uid() is not null);
create policy "Admins can manage payments" on payments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Donations
create table donations (
  id bigint generated always as identity primary key,
  household_id bigint references households(id),
  donor_name text not null,
  amount numeric(10,2) not null,
  campaign text default 'General Fund',
  payment_method text default '',
  recurring boolean default false,
  anonymous boolean default false,
  message text default '',
  date date default current_date,
  transaction_id text default '',
  stripe_payment_id text,
  created_at timestamptz default now()
);

alter table donations enable row level security;
create policy "Authenticated can read donations" on donations for select using (auth.uid() is not null);
create policy "Admins can manage donations" on donations for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''), 'member');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
