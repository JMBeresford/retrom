delete from emulators
where
    built_in = true
    and libretro_name = any(array[
        'same_cdi',
        'dosbox_pure'
    ]);

drop type emujs_names;
