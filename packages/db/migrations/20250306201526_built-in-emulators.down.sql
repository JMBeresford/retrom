delete from emulators
where
    built_in = true
    and libretro_name = any(array[
        'a5200',
        'beetle_vb',
        'melonds',
        'desmume',
        'desmume2015',
        'fbneo',
        'fbalpha2012_cps1',
        'fbalpha2012_cps2',
        'fceumm',
        'nestopia',
        'gambatte',
        'gearcoleco',
        'smsplus',
        'genesis_plus_gx',
        'picodrive',
        'handy',
        'mame2003_plus',
        'mame2003',
        'mednafen_ngp',
        'mednafen_pce',
        'mednafen_pcfx',
        'pcsx_rearmed',
        'mednafen_psx_hw',
        'mednafen_wswan',
        'mgba',
        'mupen64plus_next',
        'parallel_n64',
        'opera',
        'ppsspp',
        'prosystem',
        'snes9x',
        'stella2014',
        'virtualjaguar',
        'yabause',
        'puae',
        'vice_x64sc',
        'vice_x128',
        'vice_xpet',
        'vice_xplus4',
        'vice_xvic'
    ]);

alter table emulators drop column if exists built_in;
alter table emulators drop column if exists libretro_name;
alter table emulators drop column if exists operating_systems;
