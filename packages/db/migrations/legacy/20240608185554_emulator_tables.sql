create table clients (
    id integer primary key generated always as identity,
    name text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint unique_name unique (name)
);

create table emulators (
    id integer primary key generated always as identity,
    supported_platforms integer [] not null,
    name text not null,
    save_strategy integer not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    client_id integer not null,
    executable_path text not null,
    constraint fk_client_id foreign key (client_id) references clients (
        id
    ) on delete cascade
);

create table emulator_profiles (
    id integer primary key generated always as identity,
    emulator_id integer not null,
    name text not null,
    supported_extensions text [] not null,
    custom_args text [] not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_emulator_id foreign key (
        emulator_id
    ) references emulators (id) on delete cascade
);

create table default_emulator_profiles (
    platform_id integer primary key,
    emulator_profile_id integer not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_platform_id foreign key (
        platform_id
    ) references platforms (id) on delete cascade,
    constraint fk_profile_id foreign key (
        emulator_profile_id
    ) references emulator_profiles (id) on delete cascade
)
