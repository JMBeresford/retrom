alter table games
drop column third_party;

alter table platforms
drop column third_party;

delete from platforms
where
    path = '__RETROM_RESERVED__/Steam';

alter table games
drop column steam_app_id;
