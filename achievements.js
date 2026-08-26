// ====================================================================
//  achievements.js — shared achievement definitions + unlock toast.
//  Loaded on every page (after storage.js + seeds.js). Provides:
//    • achGroups() / allAchievements()  — the full list (fresh values)
//    • checkAchievements()              — toast any newly-completed ones
//  Achievements.html renders from achGroups(); plant.html calls
//  checkAchievements() after each action so the popup fires the moment
//  you hit a goal.
// ====================================================================

// ---- 🌱 PLANTING wording (per crop, 4 tiers each) ----
const ACH_WORDING = {
    potato: {
        1:   { title: 'first potato',                      desc: 'plant your first potato.' },
        5:   { title: 'potatopotatopotatopotatopotato',     desc: 'plant 5 potatoes.' },
        20:  { title: 'potato x20',                         desc: 'plant 20 potatoes.' },
        100: { title: 'potato x100',                        desc: 'plant 100 potatoes.' }
    },
    carrot: {
        1:   { title: 'first carrot',   desc: 'plant your first carrot.' },
        5:   { title: 'carrot ^ 5',      desc: 'plant 5 carrots.' },
        20:  { title: 'carrot x20',     desc: 'plant 20 carrots.' },
        100: { title: 'carrot x100',    desc: 'plant 100 carrots.' }
    },
    radish: {
        1:   { title: 'first radish',  desc: 'plant your first radish.' },
        5:   { title: 'radish x5',     desc: 'plant 5 radishes.' },
        20:  { title: 'radish x20',    desc: 'plant 20 radishes.' },
        100: { title: 'radish x100',   desc: 'plant 100 radishes.' }
    },
    cabbage: {
        1:   { title: 'first cabbage', desc: 'plant your first cabbage.' },
        5:   { title: 'cabbage x5',    desc: 'plant 5 cabbages.' },
        20:  { title: 'cabbage x20',   desc: 'plant 20 cabbages.' },
        100: { title: 'cabbage x100',  desc: 'plant 100 cabbages.' }
    },
    cauliflower: {
        1:   { title: 'first cauliflower', desc: 'plant your first cauliflower.' },
        5:   { title: 'cauliflower x5',   desc: 'plant 5 cauliflowers.' },
        20:  { title: 'cauliflower x20',  desc: 'plant 20 cauliflowers.' },
        100: { title: 'cauliflower x100', desc: 'plant 100 cauliflowers.' }
    }
};
const ACH_PLANT_TIERS = [1, 5, 20, 100];

// Planting tier icon: 1 -> seed, 5 -> sprout, 20 -> pot, 100 -> finished crop.
const TIER_ICON = {
    1:   key => SEEDS[key].img,
    5:   ()  => SPROUT_IMG,
    20:  key => plantedImg(key),
    100: key => grownImg(key)
};

// Build one achievement object with a stable id.
function achItem(id, icon, title, desc, current, goal) {
    return { id, icon, title, desc, current: Math.min(current, goal), goal, done: current >= goal };
}

function plantingAchievements() {
    const out = [];
    SEED_KEYS.forEach(key => {
        const count = plantedCount(key);
        ACH_PLANT_TIERS.forEach(n => {
            const w = ACH_WORDING[key][n];
            out.push(achItem(
                key + '_' + n,
                '<img src="' + TIER_ICON[n](key) + '" alt="' + SEEDS[key].name + '">',
                w.title, w.desc, count, n
            ));
        });
    });
    return out;
}

function wateringAchievements() {
    return [
        achItem('water_firstdrop', '💧', 'first drop',   'water a plant for the first time.', getWateredCount(),   1),
        achItem('water_rainmaker',  '💧', 'rainmaker',    'water plants 10 times.',            getWateredCount(),  10),
        achItem('water_downpour',   '💧', 'downpour',     'water plants 50 times.',            getWateredCount(),  50),
        achItem('water_wellspring', '💧', 'wellspring',   'water plants 100 times.',           getWateredCount(), 100),
        achItem('water_hydrated',   '💧', 'hydrated',     'own 10 gallons of water at once.',  getWater(),         10),
        achItem('water_reservoir',  '💧', 'reservoir',    'own 100 gallons of water at once.', getWater(),        100)
    ];
}

function fertAchievements() {
    return [
        achItem('fert_firstfeed',  '🪴', 'first feed',  'use fertilizer on a plant.',  getFertUsed(),     1),
        achItem('fert_greenthumb', '🪴', 'green thumb', 'use fertilizer 10 times.',    getFertUsed(),    10),
        achItem('fert_supersoil',  '🪴', 'super soil',  'use fertilizer 50 times.',    getFertUsed(),    50),
        achItem('fert_stockpile',  '🪴', 'stockpile',   'own 10 fertilizer at once.', getFertilizer(),  10)
    ];
}

function marketAchievements() {
    return [
        achItem('market_firstsale', '🌾', 'first sale', 'sell your first crop.',       getSoldCount(),   1),
        achItem('market_merchant',   '🌾', 'merchant',   'sell 50 crops in total.',     getSoldCount(),  50),
        achItem('market_trader',     '🌾', 'trader',     'sell 100 crops in total.',   getSoldCount(), 100),
        achItem('market_tycoon',     '🌾', 'tycoon',     'sell 500 crops in total.',   getSoldCount(), 500)
    ];
}

function pestsAchievements() {
    return [
        achItem('pest_firstclear',   '🐜', 'first clear',   'shoo ants off a plant.',  getAntsCleared(),  1),
        achItem('pest_antslayer',    '🐜', 'ant slayer',     'clear ants 10 times.',    getAntsCleared(), 10),
        achItem('pest_exterminator', '🐜', 'exterminator',  'clear ants 50 times.',    getAntsCleared(), 50),
        achItem('pest_prepared',     '🐜', 'prepared',       'buy pest control.',       getPestControl(), 1)
    ];
}

function wealthAchievements() {
    return [
        achItem('wealth_pocket',  '🪙', 'pocket money', 'hold 100 coins at once.',  getCoins(),  100),
        achItem('wealth_saver',   '🪙', 'saver',         'hold 500 coins at once.',  getCoins(),  500),
        achItem('wealth_rich',    '🪙', 'rich bear',     'hold 1000 coins at once.', getCoins(), 1000),
        achItem('wealth_tycoon',  '🪙', 'tycoon bear',   'hold 5000 coins at once.', getCoins(), 5000)
    ];
}

function resetAchievements() {
    return [
        achItem('reset_fresh',    '✨', 'fresh start', 'reset the game once.',    getResets(),  1),
        achItem('reset_cleanslate','✨','clean slate',  'reset the game 3 times.', getResets(),  3),
        achItem('reset_doover',   '✨', 'do-over',       'reset the game 5 times.', getResets(),  5),
        achItem('reset_groundhog','✨', 'groundhog',     'reset the game 10 times.', getResets(), 10)
    ];
}

// Each group: { label, items }
function achGroups() {
    return [
        { label: '🌱 planting',   items: plantingAchievements() },
        { label: '💧 watering',   items: wateringAchievements() },
        { label: '🪴 fertilizer', items: fertAchievements()      },
        { label: '🌾 market',      items: marketAchievements()    },
        { label: '🐜 pests',       items: pestsAchievements()     },
        { label: '🪙 wealth',      items: wealthAchievements()    },
        { label: '✨ reset',       items: resetAchievements()     }
    ];
}

function allAchievements() {
    const out = [];
    achGroups().forEach(g => g.items.forEach(a => out.push(a)));
    return out;
}

// ====================================================================
//  UNLOCK TOAST — a small card slides in from the top center, stays 3s.
// ====================================================================
const ACH_SHOWN_KEY = 'bearcave_ach_shown';   // wiped on reset (re-earn re-toasts)
const ACH_TOAST_MS  = 3000;

function ensureToastContainer() {
    let c = document.getElementById('ach-toast-container');
    if (!c) {
        c = document.createElement('div');
        c.id = 'ach-toast-container';
        document.body.appendChild(c);
    }
    return c;
}

function toastAchievement(ach) {
    if (!document.body) return;
    const c = ensureToastContainer();
    const t = document.createElement('div');
    t.className = 'ach-toast';
    t.innerHTML =
        '<div class="ach-toast__icon">' + ach.icon + '</div>' +
        '<div class="ach-toast__body">' +
            '<b>achievement unlocked!</b>' +
            '<span>' + ach.title + '</span>' +
        '</div>';
    c.appendChild(t);
    // trigger the enter transition on the next frame
    requestAnimationFrame(() => t.classList.add('ach-toast--show'));
    setTimeout(() => {
        t.classList.remove('ach-toast--show');
        setTimeout(() => { if (t.parentNode) t.remove(); }, 300);
    }, ACH_TOAST_MS);
}

// Toast every achievement that is done but hasn't been shown yet.
function checkAchievements() {
    if (!document.body) return;
    const shown = loadJSON(ACH_SHOWN_KEY, {});
    let changed = false;
    allAchievements().forEach(a => {
        if (a.done && !shown[a.id]) {
            shown[a.id] = true;
            changed = true;
            toastAchievement(a);
        }
    });
    if (changed) saveJSON(ACH_SHOWN_KEY, shown);
}

// On every page load, toast anything that unlocked while away (e.g. a
// reset, which reloads the page — the reset achievement pops here).
function _achAutoCheck() { checkAchievements(); }
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _achAutoCheck);
} else {
    _achAutoCheck();
}