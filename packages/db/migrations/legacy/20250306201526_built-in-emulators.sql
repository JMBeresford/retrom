alter table emulators add column if not exists built_in boolean not null default false;
alter table emulators add column if not exists libretro_name text;
alter table emulators add column if not exists operating_systems integer [] not null default '{}';

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
        ('mGBA', 'mgba'),
        ('Atari 5200', 'a5200'),
        ('Beetle VB', 'beetle_vb'),
        ('MelonDS', 'melonds'),
        ('DeSmuME', 'desmume'),
        ('DeSmeME 2015', 'desmume2015'),
        ('FinalBurn Neo', 'fbneo'),
        ('FinalBurn Alpha 2012 - CPS1', 'fbalpha2012_cps1'),
        ('FinalBurn Alpha 2012 - CPS2', 'fbalpha2012_cps2'),
        ('FCEUmm', 'fceumm'),
        ('Nestopia', 'nestopia'),
        ('Gambatte', 'gambatte'),
        ('Gearcoleco', 'gearcoleco'),
        ('SMSPlus', 'smsplus'),
        ('Genesis Plus GX', 'genesis_plus_gx'),
        ('PicoDrive', 'picodrive'),
        ('Handy', 'handy'),
        ('MAME 2003-Plus', 'mame2003_plus'),
        ('MAME 2003', 'mame2003'),
        ('Mednafen - Neo Geo Pocket', 'mednafen_ngp'),
        ('Mednafen - PC Engine', 'mednafen_pce'),
        ('Mednafen - PCFX', 'mednafen_pcfx'),
        ('PCSX ReARMed', 'pcsx_rearmed'),
        ('Mednafen - Playstation', 'mednafen_psx_hw'),
        ('Mednafen - WonderSwan', 'mednafen_wswan'),
        ('Mupen64Plus Next', 'mupen64plus_next'),
        ('ParaLLEl N64', 'parallel_n64'),
        ('opera', 'opera'),
        ('PPSSPP', 'ppsspp'),
        ('ProSystem', 'prosystem'),
        ('Snes9x', 'snes9x'),
        ('Stella2014', 'stella2014'),
        ('Virtual Jaguar', 'virtualjaguar'),
        ('Yabause', 'yabause'),
        ('PUAE', 'puae'),
        ('Vice x64sc', 'vice_x64sc'),
        ('Vice x128', 'vice_x128'),
        ('Vice xPET', 'vice_xpet'),
        ('Vice xPlus4', 'vice_xplus4'),
        ('Vice xVIC', 'vice_xvic')
    ]::emujs_names []
) as emujs;

drop type emujs_names;
