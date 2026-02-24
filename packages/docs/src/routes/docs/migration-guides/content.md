# Migration Guides

The following documentation is for helping you migrate from one version of Retrom to another, generally
for versions that have breaking changes. If you are looking to update Retrom to a newer version, see
the [Updating](./Updating) guide.

## v0.7.30

### Docker Changes

The web client which was previously exposed on port `3000` is now statically served by the Retrom service under the path `/web`.

This means that, assuming your compose file is set up like the following:

```yml
services:
  retrom:
    image: ghcr.io/jmberesford/retrom-service:latest
    ports:
      - 5101:5101
      - 3000:3000
```

You were likely accessing the web client at `http://localhost:3000/web`, or `http://<your-server-ip>:3000/web`. You should now access the web client at `http://localhost:5101/web` or `http://<your-server-ip>:5101/web` instead, and remove the redundant port binding for port `3000` in your compose file:

```diff
  services:
    retrom:
      image: ghcr.io/jmberesford/retrom-service:latest
      ports:
        - 5101:5101
-       - 3000:3000 # remove this line
```

Additionally, you will want to update any reverse proxy configurations to stop using the deprecated port `3000` and instead use the new port `5101` for the Retrom service. If you already have the service port exposed via the proxy, you can already access the web client at the new path. Otherwise, you will need to update your reverse proxy configuration to point to the new port `5101`. For example, if you are using Nginx as a reverse proxy, you would update your configuration like so:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /retrom {
        proxy_pass http://localhost:5101/; # Update to the new port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

This will ensure that the Retrom web client is served correctly at `http://your-domain.com/retrom/web`, and the service is accessible at `http://your-domain.com/retrom`.

## v0.7.0

### Docker Changes

#### Permissions Changes

Retrom now handles docker permissions in a more standard and flexible fashion. If you encounter permissions issues such as

```text

Could not execute usermod, is the container not running as root?
If rootless mode is enabled, use the --user flag to specify a user with the correct permissions
for your host system. So long as the user and group IDs are the same in the container as they are
on the host, you can _probably_ ignore resulting permission errors.
Retrom may not work correctly if the user and group IDs are not set correctly!!!

```

make sure of the following:

- You are not running the container as a non-root user ( generally, you should omit _any_ `user` directives when running the container )
  - The container must run as root initially to ensure that file permissions for Retrom's internals are updated and correct
  - The entrypoint of the container will ultimately run the server as a **non-root** user, after doing the above
- If you have bind-mounted volumes that have certain restrictions on your host machine, make sure you pass env vars `PUID` and `PGID` to make the server run under those id's ( see example below )

For example, if your library folder `/my/library` on your host machine ( let's assume a unix system here ) is only accessible by your current user:

Find your user's IDs with:

```bash
id

# or `id {user}` for some other user
```

Note the `uid` and `gid` ( let's assume `1000` and `1000` here ) from that output, and use it in your docker-compose.yml like so:

```yaml
services:
  retrom:
    # user: DO NOT INCLUDE THIS
    environment:
      PUID: 1000 # the uid
      PGID: 1000 # the gid
    volumes:
      - /my/library:/app/library
```

#### Volume Changes

The directory for the embedded database in the retrom Docker container has changed from `/app/data` to `/app/data/db`.
This was done in order to better organize the data directory and because the DB requires specific permissions on its own directory. For those
using the embedded DB prior to this version, you may notice that your data has been "lost". You can follow these steps to ensure that you
retain your data:

1. Access the container's `/app/data` directory, either via shell access to the container or on the host machine if using a
   bind mount ( [see the installation docs for more info](./Installation#docker) )

2. If you have already updated, you may see a `db/` directory in the `/app/data` directory. If so, remove the entire
   `db/` directory and its contents. ( e.g. `rm -rf /app/data/db` )

3. Move _all_ files and directories from `/app/data` to `/app/data/db`, creating the new directory if needed.
   ( currently, the data directory is used exclusively by the DB -- but this is subject to change )

   ex:

   **before**:

   ```bash
   app/
     data/
       PG_VERSION
       base
       ...
   ```

   **after**:

   ```bash
   app/
     data/
       db/
         PG_VERSION
         base
         ...
   ```

> [!WARNING]
> Note that the container still expects the `/app/data` directory to be present as a volume, so you should not alter the volume definition
> in your compose file! The `db/` directory is expected as a _subdirectory_ of the `data/` volume.

## v0.5.0

### Docker Changes

The default `config/` directory location in the retrom docker container has changed from `/config` to `/app/config`

You can generally avoid issues by updating your `docker-compose.yml` file to reflect the new location.

ex:

```diff
services:
  retrom:
    volumes:
-      - retrom-config:/config/
+      - retrom-config:/app/config/
```
