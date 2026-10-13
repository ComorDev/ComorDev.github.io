const canvas = document.getElementById('tubes-canvas');
let started = false;

function blockRealPointer(event) {
    if (event.type === 'click' && event.target.closest('.effect-credit')) return;
    if (!event.autoTubes) event.stopImmediatePropagation();
}

async function start() {
    if (started || !canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    started = true;

    try {
        const { default: TubesCursor } = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        TubesCursor(canvas, {
            tubes: {
                colors: ['#f967fb', '#53bc28', '#6958d5'],
                lights: { intensity: 200, colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'] }
            }
        });

        document.body.addEventListener('pointermove', blockRealPointer, true);
        document.body.addEventListener('pointerleave', blockRealPointer, true);
        document.body.addEventListener('click', blockRealPointer, true);
        document.getElementById('main-content').classList.add('tubes-ready');

        const startTime = performance.now();
        function animate(now) {
            const t = (now - startTime) / 1000;
            const rect = canvas.getBoundingClientRect();
            const x = rect.left + rect.width * (.5 + .42 * Math.sin(t * .52));
            const y = rect.top + rect.height * (.5 + .24 * Math.sin(t * .76 + .8));
            const event = new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y });
            Object.defineProperty(event, 'autoTubes', { value: true });
            document.body.dispatchEvent(event);
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    } catch (error) {
        started = false;
        console.error('Tubes Cursor could not start:', error);
    }
}

document.addEventListener('tubes:start', start);
