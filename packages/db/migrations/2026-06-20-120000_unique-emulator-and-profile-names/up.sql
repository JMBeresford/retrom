DO $$
DECLARE
    duplicate RECORD;
    candidate TEXT;
    suffix INTEGER;
BEGIN
    FOR duplicate IN
        SELECT
            id,
            name
        FROM (
            SELECT
                id,
                name,
                row_number() OVER (PARTITION BY name ORDER BY id) AS duplicate_index
            FROM emulators
        ) ranked
        WHERE duplicate_index > 1
        ORDER BY id
    LOOP
        suffix := 2;

        LOOP
            candidate := duplicate.name || ' (' || suffix || ')';

            EXIT WHEN NOT EXISTS (
                SELECT 1
                FROM emulators
                WHERE name = candidate
                  AND id <> duplicate.id
            );

            suffix := suffix + 1;
        END LOOP;

        UPDATE emulators
        SET name = candidate
        WHERE id = duplicate.id;
    END LOOP;
END
$$;

DO $$
DECLARE
    duplicate RECORD;
    candidate TEXT;
    suffix INTEGER;
BEGIN
    FOR duplicate IN
        SELECT
            id,
            emulator_id,
            name
        FROM (
            SELECT
                id,
                emulator_id,
                name,
                row_number() OVER (
                    PARTITION BY emulator_id, name
                    ORDER BY id
                ) AS duplicate_index
            FROM emulator_profiles
        ) ranked
        WHERE duplicate_index > 1
        ORDER BY emulator_id, id
    LOOP
        suffix := 2;

        LOOP
            candidate := duplicate.name || ' (' || suffix || ')';

            EXIT WHEN NOT EXISTS (
                SELECT 1
                FROM emulator_profiles
                WHERE emulator_id = duplicate.emulator_id
                  AND name = candidate
                  AND id <> duplicate.id
            );

            suffix := suffix + 1;
        END LOOP;

        UPDATE emulator_profiles
        SET name = candidate
        WHERE id = duplicate.id;
    END LOOP;
END
$$;

ALTER TABLE emulators
ADD CONSTRAINT emulators_name_unique UNIQUE (name);

ALTER TABLE emulator_profiles
ADD CONSTRAINT emulator_profiles_emulator_id_name_unique
UNIQUE (emulator_id, name);
