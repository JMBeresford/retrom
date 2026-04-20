alter table platforms add column deleted_at timestamp with time zone;
alter table platforms add column is_deleted boolean not null default false;

alter table games add column deleted_at timestamp with time zone;
alter table games add column is_deleted boolean not null default false;
alter table games add column default_file_id integer references game_files (
    id
) on delete set null;

alter table game_files add column deleted_at timestamp with time zone;
alter table game_files add column is_deleted boolean not null default false;
