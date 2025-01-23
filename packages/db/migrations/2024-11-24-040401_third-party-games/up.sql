alter table games
add column third_party boolean not null default false;

alter table platforms
add column third_party boolean not null default false;

insert into
platforms (path, third_party)
values
('__RETROM_RESERVED__/Steam', true);

alter table games
add column steam_app_id bigint;
