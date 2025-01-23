alter table platforms
drop column deleted_at;

alter table platforms
drop column is_deleted;

alter table games
drop column deleted_at;

alter table games
drop column is_deleted;

alter table games
drop column default_file_id;

alter table game_files
drop column deleted_at;

alter table game_files
drop column is_deleted;
