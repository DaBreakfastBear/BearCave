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
    return isNaN(n) ? 1 : n;            // start with 1 coin the very first time
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

// --- Helper: refresh every #coin-balance on the page ---
function renderCoinBalance() {
    const el = document.getElementById('coin-balance');
    if (el) el.textContent = getCoins();
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
    Object.keys(localStorage)
        .filter(k => k.indexOf('bearcave_') === 0)
        .forEach(k => localStorage.removeItem(k));
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