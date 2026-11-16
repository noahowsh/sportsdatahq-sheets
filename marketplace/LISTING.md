# Workspace Marketplace listing (SportsDataHQ for Google Sheets)

- App name: SportsDataHQ
- Short description (80 chars max): Live sports data in Sheets: NFL, NBA, NHL, MLB, soccer, tennis, golf, UFC, cricket
- Detailed description:
  One formula turns sports data into a live table. Type =SDHQ("dunkapi","get_standings") and the answer fills your cells:
  a header row, then one row per record. Every tool of every SportsDataHQ API works the same way: games and results, box
  scores, play-by-play, player and team stats, standings, injuries, ratings and sportsbook lines as market data.

  Covers PuckAPI (NHL and more hockey), EndzoneAPI (NFL), DunkAPI (NBA, WNBA, college), StrikerAPI (17 soccer leagues),
  FastballAPI (MLB), AcesAPI (ATP and WTA), BirdieAPI (PGA Tour and four other tours), FighterAPI (UFC) and YorkerAPI
  (cricket).

  How it works: add a free key for the API you want (500 credits a month, no card) under Extensions, SportsDataHQ, Set API
  keys. Keys are stored in your Google account only and never written into the sheet. Each call uses credits from that
  API's account; results are cached for an hour so recalculation does not charge again. =SDHQ_TOOLS("puckapi") lists every
  tool and what it costs.

  Nothing in the add-on places, accepts or recommends wagers.
- Category: Business tools / Data & analytics (pick the closest)
- Pricing: Free (the APIs have a free tier and paid plans)
- Support URL: https://sportsdatahq.com/sheets   Support email: hello@sportsdatahq.com
- Privacy policy: https://sportsdatahq.com/sheets/privacy   Terms: https://sportsdatahq.com/sheets/terms
- Developer website: https://sportsdatahq.com
- Graphics: icon-128.png, icon-32.png, banner-220x140.png, screenshot-1-table.png, screenshot-2-tools.png, screenshot-3-keys.png
- OAuth scopes: spreadsheets.currentonly, script.external_request, script.container.ui
- Google Cloud project: sportsdatahq-sheets (owner noahowsh@gmail.com); authorized domain sportsdatahq.com (verified in Search Console Nov 16)
