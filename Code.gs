/**
 * SportsDataHQ for Google Sheets: sports data from PuckAPI, EndzoneAPI, DunkAPI, StrikerAPI, FastballAPI, AcesAPI,
 * BirdieAPI, FighterAPI and YorkerAPI as live tables.
 *
 *   =SDHQ("dunkapi", "get_standings")
 *   =SDHQ("endzoneapi", "get_player_stats", "player_id", "00-0033873", "season", 2025)
 *   =SDHQ("puckapi", "get_games", A1:B3)      a two-column range of parameter names and values
 *
 * Each call uses credits from that brand's account. Results are cached for an hour, so a sheet that recalculates
 * does not pay again; =SDHQ_REFRESH() clears the cache.
 */

var BRANDS = ["puckapi", "endzoneapi", "dunkapi", "strikerapi", "fastballapi", "acesapi", "birdieapi", "fighterapi", "yorkerapi"];
var CACHE_SECONDS = 3600;
var MAX_ROWS = 5000;

function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
    .addItem("Set API keys", "showKeySidebar")
    .addItem("Clear cached results", "clearCacheMenu")
    .addToUi();
}

function onInstall(e) { onOpen(e); }

function showKeySidebar() {
  var html = HtmlService.createHtmlOutputFromFile("Sidebar").setTitle("SportsDataHQ API keys");
  SpreadsheetApp.getUi().showSidebar(html);
}

/** Saves one brand's key for the current user only (never in the sheet itself). */
function saveKey(brand, key) {
  if (BRANDS.indexOf(brand) < 0) throw new Error("Unknown brand: " + brand);
  var props = PropertiesService.getUserProperties();
  if (key) props.setProperty("key:" + brand, String(key).trim()); else props.deleteProperty("key:" + brand);
  return listKeys();
}

/** Which brands have a key saved, without returning the keys. */
function listKeys() {
  var props = PropertiesService.getUserProperties();
  return BRANDS.map(function (b) { return { brand: b, saved: !!props.getProperty("key:" + b) }; });
}

function clearCacheMenu() {
  PropertiesService.getUserProperties().setProperty("cacheEpoch", String(Date.now()));
  SpreadsheetApp.getActive().toast("Cached results cleared. Edit or reopen the sheet to fetch fresh data.");
}

/**
 * Sports data as a table.
 *
 * @param {string} brand puckapi, endzoneapi, dunkapi, strikerapi, fastballapi, acesapi, birdieapi, fighterapi or yorkerapi.
 * @param {string} tool The tool name, e.g. get_standings (list them with =SDHQ_TOOLS("dunkapi")).
 * @param {...any} params Parameter name and value pairs, or one two-column range of names and values.
 * @return A table: a header row, then one row per record.
 * @customfunction
 */
function SDHQ(brand, tool) {
  var args = Array.prototype.slice.call(arguments, 2);
  return toTable(call(String(brand || "").toLowerCase().trim(), String(tool || "").trim(), paramsFrom(args)));
}

/**
 * The tools a brand offers, with what each costs.
 *
 * @param {string} brand e.g. dunkapi
 * @return A table of tool names, credits and descriptions.
 * @customfunction
 */
function SDHQ_TOOLS(brand) {
  brand = String(brand || "").toLowerCase().trim();
  checkBrand(brand);
  var res = UrlFetchApp.fetch("https://mcp." + brand + ".com/v1/tools", { muteHttpExceptions: true });
  var body = JSON.parse(res.getContentText());
  var tools = body.tools || (body.data && body.data.tools) || [];
  return [["tool", "credits", "description"]].concat(tools.map(function (t) {
    return [t.name, t.credits === undefined ? "" : t.credits, String(t.description || "").slice(0, 300)];
  }));
}

/**
 * Clears this user's cached results; the next calculation fetches fresh data (and uses credits).
 * @customfunction
 */
function SDHQ_REFRESH() {
  PropertiesService.getUserProperties().setProperty("cacheEpoch", String(Date.now()));
  return "Cache cleared " + new Date().toISOString();
}

function checkBrand(brand) {
  if (BRANDS.indexOf(brand) < 0) throw new Error("Unknown brand '" + brand + "'. One of: " + BRANDS.join(", "));
}

function paramsFrom(args) {
  var params = {};
  if (args.length === 1 && Array.isArray(args[0])) {
    args[0].forEach(function (row) { if (row[0] !== "" && row[0] !== null) params[String(row[0]).trim()] = cell(row[1]); });
    return params;
  }
  for (var i = 0; i + 1 < args.length; i += 2) if (args[i] !== "" && args[i] !== null) params[String(args[i]).trim()] = cell(args[i + 1]);
  return params;
}

function cell(v) {
  if (v instanceof Date) return Utilities.formatDate(v, "UTC", "yyyy-MM-dd");
  if (v === "TRUE" || v === true) return true;
  if (v === "FALSE" || v === false) return false;
  return v;
}

function call(brand, tool, params) {
  checkBrand(brand);
  if (!/^[a-z_]+$/.test(tool)) throw new Error("Pass a tool name like get_standings. List them with =SDHQ_TOOLS(\"" + brand + "\").");
  var key = PropertiesService.getUserProperties().getProperty("key:" + brand);
  if (!key) throw new Error("No " + brand + " key yet: Extensions > SportsDataHQ > Set API keys. Free key at https://" + brand + ".com/signup");
  var props = PropertiesService.getUserProperties();
  var cacheKey = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    [brand, tool, JSON.stringify(params), props.getProperty("cacheEpoch") || "0", key.slice(-6)].join("|")));
  var cache = CacheService.getUserCache();
  var hit = cache.get(cacheKey);
  if (hit) return JSON.parse(hit);
  var res = UrlFetchApp.fetch("https://mcp." + brand + ".com/v1/" + tool, {
    method: "post", contentType: "application/json", payload: JSON.stringify(params),
    headers: { "x-api-key": key, "x-client": "sdhq-sheets" }, muteHttpExceptions: true,
  });
  var text = res.getContentText();
  var body;
  try { body = JSON.parse(text); } catch (e) { throw new Error("HTTP " + res.getResponseCode() + ": " + text.slice(0, 200)); }
  if (res.getResponseCode() >= 400) throw new Error(body.message || body.error || ("HTTP " + res.getResponseCode()));
  var data = body.data === undefined ? body : body.data;
  if (text.length < 95000) cache.put(cacheKey, JSON.stringify(data), CACHE_SECONDS);
  return data;
}

/** The first list of records in the answer becomes the table; anything else becomes field and value rows. */
function toTable(data) {
  var list = Array.isArray(data) ? data : firstList(data);
  if (!list) return [["field", "value"]].concat(Object.keys(flatten(data || {})).map(function (k) { return [k, flatten(data)[k]]; }));
  if (list.length === 0) return [["No rows"]];
  var rows = list.slice(0, MAX_ROWS).map(function (r) { return flatten(r); });
  var headers = [];
  rows.forEach(function (r) { Object.keys(r).forEach(function (k) { if (headers.indexOf(k) < 0) headers.push(k); }); });
  return [headers].concat(rows.map(function (r) { return headers.map(function (h) { return r[h] === undefined || r[h] === null ? "" : r[h]; }); }));
}

function firstList(obj) {
  if (!obj || typeof obj !== "object") return null;
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var v = obj[keys[i]];
    if (Array.isArray(v) && v.length && typeof v[0] === "object" && v[0] !== null) return v;
  }
  for (var j = 0; j < keys.length; j++) if (Array.isArray(obj[keys[j]])) return obj[keys[j]];
  return null;
}

function flatten(obj, prefix, out) {
  out = out || {};
  if (obj === null || typeof obj !== "object") { out[prefix || "value"] = obj; return out; }
  Object.keys(obj).forEach(function (k) {
    var v = obj[k], name = prefix ? prefix + "." + k : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) flatten(v, name, out);
    else out[name] = Array.isArray(v) ? JSON.stringify(v) : v;
  });
  return out;
}
