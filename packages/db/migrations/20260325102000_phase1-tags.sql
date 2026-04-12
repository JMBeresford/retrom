-- General-purpose tags table.  Each tag belongs to a domain (genre, region, etc.)
-- and holds a single text value.  Uniqueness is enforced per (domain, value) pair.
-- Replaces the IGDB-specific game_genres / game_genre_maps system (Phase 4 data migration).

create table tags (
    id integer primary key generated always as identity,
    tag_domain_id integer not null,
    value text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_tags_tag_domain_id
        foreign key (tag_domain_id) references tag_domains (id) on delete cascade,
    constraint tags_domain_value_unique unique (tag_domain_id, value)
);
