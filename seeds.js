// ====================================================================
//  seeds.js  — single source of truth for all seed data
//  (used by plant.html for the shop/game and by the Book of Knowledge
//   page to render its fact cards)
// ====================================================================

const SEEDS = {
    potato: {
        name: 'potato',
        color: 'yellow',
        img: 'seeds yellow.png',
        cost: 1,
        sell: 2,
        type: 'normal',
        growSec: 5,
        water: 0
    },
    carrot: {
        name: 'carrot',
        color: 'orange',
        img: 'seeds orange.png',
        cost: 5,
        sell: 13,
        type: 'normal',
        growSec: 7,
        water: 0.2
    },
    radish: {
        name: 'radish',
        color: 'red',
        img: 'seeds red.png',
        cost: 30,
        sell: 72,
        type: 'normal',
        growSec: 13,
        water: 0.2
    },
    cabbage: {
        name: 'cabbage',
        color: 'green',
        img: 'seeds green.png',
        cost: 100,
        sell: 150,
        type: 'normal',
        growSec: 17,
        water: 0.2
    },
    cauliflower: {
        name: 'cauliflower',
        color: 'white',
        img: 'seeds white.png',
        cost: 250,
        sell: 400,
        type: 'normal',
        growSec: 22,
        water: 0.3
    }
};
const SEED_KEYS = Object.keys(SEEDS);

// ====================================================================
//  Per-crop art (transparent PNGs), shared by plant.html & achievements.html.
//  Crops without custom art fall back to the generic sprout / grown imgs.
//  Achievement tier icons (per crop):
//    1 plant    -> seed packet (SEEDS[t].img)
//    5 plants   -> sprout (SPROUT_IMG)
//    20 plants  -> the crop's pot (plantedImg)
//    100 plants -> the finished crop (grownImg)
// ====================================================================
const EMPTY_IMG  = 'emptypot.png';
const SPROUT_IMG = 'sprout.png';                  // generic seedling / fallback pot
const GROWN_IMG  = 'Screenshot 2026-08-24 at 5.38.34 PM.png'; // generic grown fallback
const CROP_IMGS  = {
    potato: { planted: 'potatopot.png', grown: 'potatos.png', diseased: 'diseased potato.png' },
    carrot: { planted: 'carrotpot.png', grown: 'carrot.png',  diseased: 'diseased carrot.png' }
};
const plantedImg  = t => { const c = CROP_IMGS[t]; return c && c.planted  ? c.planted  : SPROUT_IMG; };
const grownImg    = t => { const c = CROP_IMGS[t]; return c && c.grown    ? c.grown    : GROWN_IMG;   };
const diseasedImg = t => { const c = CROP_IMGS[t]; return c && c.diseased ? c.diseased : plantedImg(t); };

// helper used by the Book of Knowledge page
function coinText(n) { return n === 1 ? '1 coin' : n + ' coins'; }

function bookCardHTML(key) {
    const s = SEEDS[key];
    const waterLabel = s.water === 0 ? 'none' : (s.water + ' g');
    return `
    <article class="book-card inv-card--${key}">
        <img src="${s.img}" alt="${s.name} seed">
        <h3>${s.name}</h3>
        <ul class="book-facts">
            <li><span>seed color</span><b>${s.color}</b></li>
            <li><span>cost to buy</span><b>${coinText(s.cost)}</b></li>
            <li><span>sells for</span><b>${coinText(s.sell)}</b></li>
            <li><span>type</span><b>${s.type}</b></li>
            <li><span>growth time</span><b>${s.growSec} sec</b></li>
            <li><span>water</span><b>${waterLabel}</b></li>
        </ul>
    </article>`;
}