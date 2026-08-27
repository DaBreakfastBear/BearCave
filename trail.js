// ====================================================================
//  trail.js — sparkle mouse trail, shared across EVERY page.
//  The trail color is saved in localStorage (key: bearcave_trail_color)
//  and is picked on the Fountain page's rainbow palette — so the same
//  color follows you everywhere. 'rainbow' = a random hue per sparkle.
// ====================================================================
(function () {
    const TRAIL_KEY = 'bearcave_trail_color';
    let trailColor = localStorage.getItem(TRAIL_KEY) || '#b18cff';

    // Expose helpers so the Fountain page's rainbow picker can change the
    // color and trigger sparkle bursts without re-implementing the trail.
    window.getTrailColor = function () { return trailColor; };
    window.setTrailColor = function (c) {
        trailColor = c;
        try { localStorage.setItem(TRAIL_KEY, c); } catch (e) { /* ignore */ }
    };

    function colorForSparkle() {
        if (trailColor === 'rainbow') return `hsl(${Math.floor(Math.random() * 360)} 90% 70%)`;
        return trailColor;
    }

    window.spawnSparkle = function (x, y) {
        const s = document.createElement('div');
        s.className = 'sparkle';
        const size = 7 + Math.random() * 13;
        s.style.left = (x + (Math.random() * 18 - 9)) + 'px';
        s.style.top  = (y + (Math.random() * 18 - 9)) + 'px';
        s.style.width = s.style.height = size + 'px';
        const c = colorForSparkle();
        s.style.background = c;
        s.style.setProperty('--sc', c);
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 900);
    };

    // Spawn sparkles as the mouse moves (~one per frame).
    let lastMove = 0;
    document.addEventListener('mousemove', (e) => {
        const now = performance.now();
        if (now - lastMove < 16) return;
        lastMove = now;
        spawnSparkle(e.clientX, e.clientY);
    });
    // Also work for touch drag.
    document.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        if (t) spawnSparkle(t.clientX, t.clientY);
    }, { passive: true });
})();