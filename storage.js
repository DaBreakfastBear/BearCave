// ====================================================================
//  storage.js  — website-wide persistent state (localStorage)
//  Coins & water are shared across every page and survive closing the
//  site. Plots, inventory & harvested crops are also persisted so plants
//  keep growing in the background even when you leave the nursery.
// ====================================================================

const COIN_KEY  = 'bearcave_coins';
const WATER_KEY = 'bearcave_water';
const BOOK_KEY  = 'bearcave_book_unlocked';

// --- Coins ---
function getCoins() {
    const n = parseInt(localStorage.getItem(COIN_KEY), 10);
    return isNaN(n) ? 0 : n;            // start with 0 coins the very first time
}
function setCoins(n) {
    localStorage.setItem(COIN_KEY, String(Math.max(0, Math.floor(n))));
}
function addCoins(n) { setCoins(getCoins() + n); }
function spendCoins(n) { setCoins(getCoins() - n); }

// --- Water (gallons) ---
// Water is stored as gallons. Floating-point math (0.2 - 0.2) can leave
// dust like 5.55e-17, so we always clamp at >= 0 and round to 2 decimals.
function getWater() {
    const n = parseFloat(localStorage.getItem(WATER_KEY));
    if (isNaN(n)) return 0;              // start with 0 water
    return Math.max(0, Math.round(n * 100) / 100);
}
function setWater(n) {
    const v = Math.max(0, Math.round((parseFloat(n) || 0) * 100) / 100);
    localStorage.setItem(WATER_KEY, String(v));
}
function addWater(n) { setWater(getWater() + n); }

// --- Pest control (units) ---
const PEST_KEY = 'bearcave_pest';
function getPestControl() {
    const n = parseInt(localStorage.getItem(PEST_KEY), 10);
    return isNaN(n) ? 0 : n;
}
function setPestControl(n) {
    localStorage.setItem(PEST_KEY, String(Math.max(0, Math.floor(n))));
}
function addPestControl(n) { setPestControl(getPestControl() + n); }

// --- Book of Knowledge unlock ---
function isBookUnlocked() { return localStorage.getItem(BOOK_KEY) === '1'; }
function unlockBook() { localStorage.setItem(BOOK_KEY, '1'); }

// --- Higher Book of Knowledge tiers (Book 2, 3, ALL) ---
// Book 1 is the basic 10-coin unlock above. These tiers are cosmetic cover
// upgrades bought on the book page; the highest unlocked tier decides which
// cover art is shown. All wiped by the reset sparkle (bearcave_ prefix).
const BOOK2_KEY   = 'bearcave_book2_unlocked';
const BOOK3_KEY   = 'bearcave_book3_unlocked';
const BOOKALL_KEY = 'bearcave_bookall_unlocked';
function isBook2Unlocked()   { return localStorage.getItem(BOOK2_KEY) === '1'; }
function unlockBook2()       { localStorage.setItem(BOOK2_KEY, '1'); }
function isBook3Unlocked()    { return localStorage.getItem(BOOK3_KEY) === '1'; }
function unlockBook3()        { localStorage.setItem(BOOK3_KEY, '1'); }
function isBookAllUnlocked()  { return localStorage.getItem(BOOKALL_KEY) === '1'; }
function unlockBookAll()      { localStorage.setItem(BOOKALL_KEY, '1'); }

// Highest book tier unlocked: 0 = none, 1 = Book 1, 2 = Book 2, 3 = Book 3, 4 = Book ALL.
function highestBookTier() {
    if (isBookAllUnlocked()) return 4;
    if (isBook3Unlocked())  return 3;
    if (isBook2Unlocked())  return 2;
    if (isBookUnlocked())  return 1;
    return 0;
}

// --- Generic JSON persistence (plots, inventory, harvested) ---
function loadJSON(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ? v : fallback; }
    catch (e) { return fallback; }
}
function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// --- Lifetime planting counts (used by the Achievements page) ---
const PLANTED_KEY = 'bearcave_planted';
function getPlanted() { return loadJSON(PLANTED_KEY, {}); }
function plantedCount(type) { return getPlanted()[type] || 0; }
function addPlanted(type, n = 1) {
    const o = getPlanted();
    o[type] = (o[type] || 0) + n;
    saveJSON(PLANTED_KEY, o);
    return o[type];
}
// Total seeds planted across every crop (for the "first seed planted" achievement).
function totalPlanted() {
    return Object.values(getPlanted()).reduce((s, n) => s + n, 0);
}

// --- Lifetime harvest counts (per crop) ---
const HARVEST_KEY = 'bearcave_harvest_lifetime';
function getHarvested() { return loadJSON(HARVEST_KEY, {}); }
function harvestedCount(type) { return getHarvested()[type] || 0; }
function addHarvested(type, n = 1) {
    const o = getHarvested();
    o[type] = (o[type] || 0) + n;
    saveJSON(HARVEST_KEY, o);
    return o[type];
}

// --- Watering actions (lifetime, wiped on reset) ---
const WATERED_KEY = 'bearcave_watered';
function getWateredCount() { return loadJSON(WATERED_KEY, 0) || 0; }
function addWatered(n = 1) { saveJSON(WATERED_KEY, getWateredCount() + n); }

// --- Fertilizer (owned units + lifetime uses) ---
const FERT_KEY = 'bearcave_fert';
const FERT_USED_KEY = 'bearcave_fert_used';
function getFertilizer() {
    const n = parseInt(localStorage.getItem(FERT_KEY), 10);
    return isNaN(n) ? 0 : n;
}
function setFertilizer(n) { localStorage.setItem(FERT_KEY, String(Math.max(0, Math.floor(n)))); }
function addFertilizer(n = 1) { setFertilizer(getFertilizer() + n); }
function getFertUsed() { return loadJSON(FERT_USED_KEY, 0) || 0; }
function addFertUsed(n = 1) { saveJSON(FERT_USED_KEY, getFertUsed() + n); }

// --- Crops sold (lifetime) ---
const SOLD_KEY = 'bearcave_sold';
function getSoldCount() { return loadJSON(SOLD_KEY, 0) || 0; }
function addSold(n = 1) { saveJSON(SOLD_KEY, getSoldCount() + n); }

// --- Kitchen (crops sent to the kitchen page counter) ---
// Stored per-crop so future kitchen features can use the breakdown; the
// counter on kitchen.html is the sum. Wiped by the reset sparkle.
const KITCHEN_KEY = 'bearcave_kitchen';
function getKitchen()   { return loadJSON(KITCHEN_KEY, {}); }
function setKitchen(o)  { saveJSON(KITCHEN_KEY, o); }
function addToKitchen(type, n = 1) {
    const o = getKitchen();
    o[type] = (o[type] || 0) + n;
    setKitchen(o);
    return o[type];
}
function kitchenTotal() {
    return Object.values(getKitchen()).reduce((s, n) => s + n, 0);
}

// --- Ants cleared (lifetime) ---
const ANTS_CLEARED_KEY = 'bearcave_ants_cleared';
function getAntsCleared() { return loadJSON(ANTS_CLEARED_KEY, 0) || 0; }
function addAntsCleared(n = 1) { saveJSON(ANTS_CLEARED_KEY, getAntsCleared() + n); }

// --- Lifetime meta-stats (SURVIVE a reset, e.g. total reset count) ---
// Kept under a non-bearcave_ key so the reset sparkle doesn't wipe them.
const LIFETIME_KEY = 'bc_lifetime';
function getLifetime() { return loadJSON(LIFETIME_KEY, {}); }
function saveLifetime(o) { saveJSON(LIFETIME_KEY, o); }
function getResets() { return getLifetime().resets || 0; }
function addReset() {
    const o = getLifetime();
    o.resets = (o.resets || 0) + 1;
    saveLifetime(o);
}

// --- Visited the nursery / claimed the free starting coin ---
// A hidden yellow coin appears on the home page only after the player
// has visited plant.html. Clicking it grants 1 coin, once, then it's
// gone forever (until a reset wipes the flags).
const VISITED_PLANT_KEY    = 'bearcave_visited_plant';
const START_COIN_CLAIM_KEY = 'bearcave_start_coin_claimed';
function hasVisitedPlant()    { return localStorage.getItem(VISITED_PLANT_KEY) === '1'; }
function markVisitedPlant()   { localStorage.setItem(VISITED_PLANT_KEY, '1'); }
function isStartCoinClaimed() { return localStorage.getItem(START_COIN_CLAIM_KEY) === '1'; }
function claimStartCoin() {
    if (isStartCoinClaimed()) return false;   // already claimed — useless now
    localStorage.setItem(START_COIN_CLAIM_KEY, '1');
    addCoins(1);                              // grants the 1 starting coin
    return true;
}

// --- Helper: refresh every #coin-balance on the page ---
// When the player is broke (0 coins) and hasn't found the free starting
// coin yet, the bar shows a hint nudging them to look for it.
// The "0 coins? try looking somewhere else!" nudge now lives in its own
// banner under each page's welcome text (see #broke-hint), NOT in the coin
// count area. The bar always just shows the current number.
function renderCoinBalance() {
    const el = document.getElementById('coin-balance');
    if (!el) return;
    el.textContent = getCoins();
    const bar = el.closest('.coins-bar');
    if (bar) bar.classList.remove('coins-bar--hint');
}

// Show/hide the broke-hint banner on any page that has one.
function renderBrokeHint() {
    const hint = document.getElementById('broke-hint');
    if (!hint) return;
    hint.hidden = !(getCoins() === 0 && !isStartCoinClaimed());
}

// --- Helper: refresh water displays (only present on the nursery page) ---
// Always show at most 2 decimals, never negative.
function renderWater() {
    const gal = getWater();
    const txt = (Math.round(gal * 100) / 100).toString();
    document.querySelectorAll('[data-water-display]').forEach(el => {
        el.textContent = txt;
    });
}

// --- Helper: refresh pest-control displays (only present on the nursery page) ---
function renderPestControl() {
    const n = getPestControl();
    document.querySelectorAll('[data-pest-display]').forEach(el => {
        el.textContent = n;
    });
}

// ====================================================================
//  RESET — a tiny yellow sparkle (✨) fixed in the bottom-right corner of
//  every page. No label, no markings — just the sparkle. One tap wipes
//  coins, water, pest control, plots, inventory, harvest, book unlock...
//  everything, then reloads.
// ====================================================================
function resetEverything() {
    addReset();  // lifetime meta: count this reset (survives the wipe below)
    Object.keys(localStorage)
        .filter(k => k.indexOf('bearcave_') === 0 && k !== VISITED_PLANT_KEY)
        .forEach(k => localStorage.removeItem(k));
    // Keep "visited the nursery" so the home page's free 1-time starting
    // coin reappears on the clean-slate start (coins back to 0, unclaimed).
    try { location.reload(); } catch (e) {}
}

function setupResetSparkle() {
    if (document.getElementById('reset-sparkle')) return;
    if (!document.body) return;
    const btn = document.createElement('button');
    btn.id = 'reset-sparkle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Reset game');
    btn.textContent = '✨';
    btn.addEventListener('click', () => {
        if (confirm('Reset EVERYTHING? This wipes coins, water, plants, seeds, the Book of Knowledge, ants... all of it.')) {
            resetEverything();
        }
    });
    document.body.appendChild(btn);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupResetSparkle);
} else {
    setupResetSparkle();
}