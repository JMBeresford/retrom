-- put the removed columns back on emulators table
alter table emulators
add column executable_path text not null;

alter table emulators
add column client_id integer not null;

alter table emulators add constraint fk_client_id foreign key (
    client_id
) references clients (id) on delete cascade;

-- Migrate data back to the emulator table
update emulators
set
    executable_path = lec.executable_path,
    client_id = lec.client_id
from
    local_emulator_configs as lec
where
    emulators.id = lec.emulator_id
    and lec.executable_path is not null;

-- DROP TABLE "local_emulator_configs";
drop table local_emulator_configs;
