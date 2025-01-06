# Third Party Libraries

Retrom supports importing games from third-party libraries. Currently, the only supported third-party
library is Steam. Support for more third-party libraries is planned.

##### Steam

To import games from Steam, you will need to create a Steam API key. You can do this by following the
instructions [here](https://steamcommunity.com/dev/apikey).

You will also need your Steam user ID. You can find your Steam user ID by going to your
[Account Details](https://store.steampowered.com/account/) page on Steam ( you must be logged in to
view this page ).

You will see your Steam user ID displayed below your profile name, as shown in the following image:

![Steam ID](docs/imgs/steam-id.png)

With these two pieces of information, you can import your Steam games into Retrom.
Add the following to the root of your `config.json` file:

```json
{
  "steam": {
    "apiKey": "your_steam_api_key",
    "userId": "your_steam_id"
  }
}
```

Now, when you update your library and download metadata, your Steam games will be included and usable
from within Retrom!
