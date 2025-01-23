create table local_emulator_configs (
    id integer primary key generated always as identity,
    emulator_id integer not null,
    client_id integer not null,
    created_at timestamp
    with
    time zone default current_timestamp,
    updated_at timestamp
    with
    time zone default current_timestamp,
    executable_path text not null,
    nickname text default null,
    constraint uq_local_emulator_configs_emulator_id_client_id unique (
        emulator_id, client_id
    ),
    constraint fk_local_emulator_configs_emulators foreign key (
        emulator_id
    ) references emulators (id) on delete cascade,
    constraint fk_local_emulator_configs_clients foreign key (
        client_id
    ) references clients (id) on delete cascade
);

-- move the executable_path column from emulators table to local_emulator_configs table
insert into
local_emulator_configs (emulator_id, client_id, executable_path)
select
    id,
    client_id,
    executable_path
from
    emulators
on conflict do nothing;

-- drop the columns from emulators table
alter table emulators
drop column executable_path;

alter table emulators
drop column client_id cascade;
