-- New first-class entities: Library, RootDirectory, MetadataProvider, TagDomain.
-- These are the structural tables introduced in Phase 1 (Data Layer Foundation).
-- No existing data is modified; all tables are additive.

create table libraries (
    id integer primary key generated always as identity,
    name text not null,
    structure_definition text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
);

create table root_directories (
    id integer primary key generated always as identity,
    path text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint root_directories_path_unique unique (path)
);

create table metadata_providers (
    id integer primary key generated always as identity,
    name text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint metadata_providers_name_unique unique (name)
);

create table tag_domains (
    id integer primary key generated always as identity,
    name text not null,
    is_well_known boolean not null default false,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint tag_domains_name_unique unique (name)
);

-- Seed well-known tag domains.
insert into tag_domains (name, is_well_known) values
('genre', true),
('favorites', true),
('franchise', true),
('region', true);
