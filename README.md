# SportsDataHQ for Google Sheets

Live sports data in a spreadsheet: NHL, NFL, NBA, soccer, MLB, tennis, golf, UFC and cricket, from PuckAPI, EndzoneAPI, DunkAPI, StrikerAPI, FastballAPI, AcesAPI, BirdieAPI, FighterAPI and YorkerAPI.

```
=SDHQ("dunkapi", "get_standings")
=SDHQ("endzoneapi", "get_player_stats", "player_id", "00-0033873", "season", 2025)
=SDHQ("puckapi", "get_games", A1:B3)        two columns: parameter names and values
=SDHQ_TOOLS("strikerapi")                   every tool, with its credit cost
=SDHQ_REFRESH()                             clear cached results
```

Each formula returns a table: a header row, then one row per record. Nested fields become `parent.child` columns.

## Setup

1. Get a free key for the brand you want (500 credits a month, no card): e.g. https://dunkapi.com/signup.
2. Extensions > SportsDataHQ > Set API keys, pick the brand, paste the key. Keys are saved to your Google account only, never into the sheet, so sharing a sheet never shares a key.
3. Type a formula.

Each call uses credits from that brand's account, and results are cached for an hour so recalculation does not charge again. Tool names, parameters and costs are in each brand's docs (e.g. https://dunkapi.com/docs).

## Install from source

Extensions > Apps Script in any sheet, then add `Code.gs`, `Sidebar.html` and `appsscript.json` from this repo (show the manifest under Project Settings), save and reload the sheet.

## License

MIT
