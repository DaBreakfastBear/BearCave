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
// Per-crop tiers are HARVEST-based now (you must harvest the crop, not
// just plant it). "first seed planted" (below) is the only plant-based one.
const ACH_WORDING = {
    potato: {
        1:   { title: 'first potato',                      desc: 'harvest your first potato.' },
        5:   { title: 'potatopotatopotatopotatopotato',     desc: 'harvest 5 potatoes.' },
        20:  { title: 'potato x20',                         desc: 'harvest 20 potatoes.' },
        100: { title: 'potato x100',                        desc: 'harvest 100 potatoes.' }
    },
    carrot: {
        1:   { title: 'first carrot',   desc: 'harvest your first carrot.' },
        5:   { title: 'carrot ^ 5',      desc: 'harvest 5 carrots.' },
        20:  { title: 'carrot x20',     desc: 'harvest 20 carrots.' },
        100: { title: 'carrot x100',    desc: 'harvest 100 carrots.' }
    },
    radish: {
        1:   { title: 'first radish',  desc: 'harvest your first radish.' },
        5:   { title: 'radish x5',     desc: 'harvest 5 radishes.' },
        20:  { title: 'radish x20',    desc: 'harvest 20 radishes.' },
        100: { title: 'radish x100',   desc: 'harvest 100 radishes.' }
    },
    cabbage: {
        1:   { title: 'first cabbage', desc: 'harvest your first cabbage.' },
        5:   { title: 'cabbage x5',    desc: 'harvest 5 cabbages.' },
        20:  { title: 'cabbage x20',   desc: 'harvest 20 cabbages.' },
        100: { title: 'cabbage x100',  desc: 'harvest 100 cabbages.' }
    },
    cauliflower: {
        1:   { title: 'first cauliflower', desc: 'harvest your first cauliflower.' },
        5:   { title: 'cauliflower x5',   desc: 'harvest 5 cauliflowers.' },
        20:  { title: 'cauliflower x20',  desc: 'harvest 20 cauliflowers.' },
        100: { title: 'cauliflower x100', desc: 'harvest 100 cauliflowers.' }
    },
    onion: {
        1:   { title: 'first onion',    desc: 'harvest your first onion.' },
        5:   { title: 'onion x5',       desc: 'harvest 5 onions.' },
        20:  { title: 'onion x20',      desc: 'harvest 20 onions.' },
        100: { title: 'onion x100',    desc: 'harvest 100 onions.' }
    },
    tomato: {
        1:   { title: 'first tomato',   desc: 'harvest your first tomato.' },
        5:   { title: 'tomato x5',      desc: 'harvest 5 tomatoes.' },
        20:  { title: 'tomato x20',     desc: 'harvest 20 tomatoes.' },
        100: { title: 'tomato x100',    desc: 'harvest 100 tomatoes.' }
    },
    greenbean: {
        1:   { title: 'first green bean', desc: 'harvest your first green bean.' },
        5:   { title: 'green bean x5',    desc: 'harvest 5 green beans.' },
        20:  { title: 'green bean x20',  desc: 'harvest 20 green beans.' },
        100: { title: 'green bean x100', desc: 'harvest 100 green beans.' }
    },
    garlic: {
        1:   { title: 'first garlic',  desc: 'harvest your first garlic.' },
        5:   { title: 'garlic x5',     desc: 'harvest 5 garlics.' },
        20:  { title: 'garlic x20',    desc: 'harvest 20 garlics.' },
        100: { title: 'garlic x100',   desc: 'harvest 100 garlics.' }
    },
    cucumber: {
        1:   { title: 'first cucumber', desc: 'harvest your first cucumber.' },
        5:   { title: 'cucumber x5',    desc: 'harvest 5 cucumbers.' },
        20:  { title: 'cucumber x20',  desc: 'harvest 20 cucumbers.' },
        100: { title: 'cucumber x100', desc: 'harvest 100 cucumbers.' }
    },
    corn: {
        1:   { title: 'first corn',  desc: 'harvest your first corn.' },
        5:   { title: 'corn x5',     desc: 'harvest 5 corns.' },
        20:  { title: 'corn x20',    desc: 'harvest 20 corns.' },
        100: { title: 'corn x100',   desc: 'harvest 100 corns.' }
    },
    sugarbeet: {
        1:   { title: 'first sugar beet', desc: 'harvest your first sugar beet.' },
        5:   { title: 'sugar beet x5',    desc: 'harvest 5 sugar beets.' },
        20:  { title: 'sugar beet x20',  desc: 'harvest 20 sugar beets.' },
        100: { title: 'sugar beet x100', desc: 'harvest 100 sugar beets.' }
    },
    sunflower: {
        1:   { title: 'first sunflower', desc: 'harvest your first sunflower.' },
        5:   { title: 'sunflower x5',    desc: 'harvest 5 sunflowers.' },
        20:  { title: 'sunflower x20',  desc: 'harvest 20 sunflowers.' },
        100: { title: 'sunflower x100', desc: 'harvest 100 sunflowers.' }
    },
    shiitake: {
        1:   { title: 'first shiitake mushroom', desc: 'harvest your first shiitake mushroom.' },
        5:   { title: 'shiitake mushroom x5',    desc: 'harvest 5 shiitake mushrooms.' },
        20:  { title: 'shiitake mushroom x20',  desc: 'harvest 20 shiitake mushrooms.' },
        100: { title: 'shiitake mushroom x100', desc: 'harvest 100 shiitake mushrooms.' }
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

// Achievements are STICKY: once you've met the goal, they stay unlocked
// forever (until a reset wipes the map below). This matters for "hold X
// at once" goals like rich bear (1000 coins) or reservoir (100 water) —
// you shouldn't lose them just because you spent the coins back down.
//
// checkAchievements() writes every unlocked achievement's id into the
// ACH_SHOWN_KEY map (so it doesn't re-toast). That same map doubles as our
// persistent "ever earned" record — it's already wiped on reset, so no
// separate key and no migration are needed.
let _achShownCache = null;
function achShownMap() {
    if (_achShownCache === null) _achShownCache = loadJSON(ACH_SHOWN_KEY, {});
    return _achShownCache;
}

// Build one achievement object with a stable id.
function achItem(id, icon, title, desc, current, goal) {
    const earned = current >= goal || !!achShownMap()[id];
    return {
        id, icon, title, desc,
        current: earned ? goal : Math.min(current, goal),   // freeze progress at the goal once earned
        goal,
        done: earned
    };
}

// "first seed planted" — plant any seed once (plant-based, total across crops).
function firstSeedPlanted() {
    return achItem(
        'plant_firstseed',
        '🌱',
        'first seed planted',
        'plant your first seed.',
        totalPlanted(),
        1
    );
}

function plantingAchievements() {
    const out = [];
    SEED_KEYS.forEach(key => {
        const count = harvestedCount(key);   // harvest-based now
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
        { label: '🌱 planting',   items: [firstSeedPlanted(), ...plantingAchievements()] },
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
//  Click it to jump to the achievements page.
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
    // Click the popup to jump straight to the achievements page.
    t.addEventListener('click', () => { window.location.href = 'achievements.html'; });
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
    const shown = achShownMap();   // shared cache so achItem's sticky flag stays in sync
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