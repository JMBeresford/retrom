create type emujs_names as (name text, libretro_name text);

insert into emulators (
    name, libretro_name, built_in, operating_systems, save_strategy, supported_platforms
)

select
    emujs.name,
    emujs.libretro_name,
    true                as built_in,
    array[3]            as operating_systems,
    1                   as save_strategy,
    array[]::integer [] as supported_platforms
from unnest(
    array[
        ('SAME CDI', 'same_cdi'),
        ('DOSBox Pure', 'dosbox_pure')
    ]::emujs_names []
) as emujs;
