let cycleTimeout = null;
let currentImgIndex = 0;
let counterTween = null;

const MAX_DELAY = 450;
const MIN_DELAY = 110;
const DURATION_MS = 2600;

function getCurveDelay(elapsed) {
    const progress = Math.min(elapsed / DURATION_MS, 1);
    return MIN_DELAY + (MAX_DELAY - MIN_DELAY) * (1 - Math.sin(progress * Math.PI));
}

document.addEventListener('DOMContentLoaded', () => {
    initLoader();
});

function initLoader() {
    const loader = document.getElementById('site-loader');
    const emptyPage = document.getElementById('main-content');
    if (!loader) return;

    const pageText = document.querySelectorAll('.page-header, .empty-page__inner');
    if (typeof gsap !== 'undefined') gsap.killTweensOf([...pageText]);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        loader.style.display = 'none';
        if (emptyPage) emptyPage.classList.add('visible');
        setTimeout(showFinalTitleWithoutAnimation, 5000);
        return;
    }

    loader.style.display = 'flex';
    if (emptyPage) emptyPage.classList.remove('visible');

    if (cycleTimeout) {
        clearTimeout(cycleTimeout);
        cycleTimeout = null;
    }
    if (counterTween) {
        counterTween.kill();
        counterTween = null;
    }
    currentImgIndex = 0;

    if (typeof gsap === 'undefined') {
        setTimeout(() => {
            loader.style.display = 'none';
            if (emptyPage) emptyPage.classList.add('visible');
            startTubesBackground();
            setTimeout(showFinalTitleWithoutAnimation, 5000);
        }, 1500);
        return;
    }

    const cLoad = document.getElementById('c-load');
    const devLoad = document.getElementById('dev-load');
    const portal = document.getElementById('loader-portal');
    const images = Array.from(portal.querySelectorAll('.loader-img'));
    const counter = document.getElementById('loader-num');

    gsap.killTweensOf([loader, cLoad, devLoad, portal, counter, ...images]);

    gsap.set(loader, { yPercent: 0, opacity: 1, height: '100%' });
    gsap.set(portal, { width: '1rem' });
    images.forEach(img => gsap.set(img, { opacity: 0, scale: 0.6, rotation: 0 }));
    if (counter) {
        gsap.set(counter, { autoAlpha: 1 });
        counter.textContent = '100';
    }

    function wrapElem(el, className) {
        if (!el) return;
        let wrap = el.parentElement;
        if (!wrap.classList.contains(className)) {
            wrap = document.createElement('div');
            wrap.className = className;
            el.parentNode.insertBefore(wrap, el);
            wrap.appendChild(el);
        }
    }
    wrapElem(cLoad, 'c-load-wrap');
    wrapElem(devLoad, 'dev-load-wrap');

    gsap.set([cLoad, devLoad], { yPercent: 105, opacity: 0 });

    const entranceDuration = 0.85;
    gsap.to(cLoad, {
        opacity: 1,
        yPercent: 0,
        duration: entranceDuration,
        ease: 'power4.inOut',
        onComplete: () => {
            openPortalAndStart(images, portal, counter, loader, emptyPage);
        }
    });

    if (devLoad) {
        gsap.to(devLoad, {
            opacity: 1,
            yPercent: 0,
            duration: entranceDuration,
            ease: 'power4.inOut'
        });
    }
}

function openPortalAndStart(images, portal, counter, loader, emptyPage) {
    const isMobile = window.matchMedia('(max-width: 991px)').matches;
    const targetWidth = isMobile ? '10rem' : '20rem';

    gsap.fromTo(portal,
        { width: '1rem' },
        { width: targetWidth, duration: 0.9, ease: 'power4.inOut' }
    );

    const firstImg = images[0];
    if (!firstImg) return;

    gsap.set(firstImg, { opacity: 1, scale: 0 });
    gsap.to(firstImg, {
        scale: 1,
        rotate: 15,
        duration: 0.7,
        ease: 'back.out(0.9)',
        delay: 0.35,
        onComplete: () => {
            startCountdown(counter);
            cycleImages(images, performance.now(), portal, counter, loader, emptyPage);
        }
    });
}

function startCountdown(counter) {
    if (!counter) return;
    const obj = { val: 100 };
    counter.textContent = '100';

    counterTween = gsap.to(obj, {
        val: 0,
        duration: DURATION_MS / 1000,
        ease: 'power2.inOut',
        onUpdate: () => {
            counter.textContent = Math.round(obj.val).toString().padStart(3, '0');
        },
        onComplete: () => {
            counter.textContent = '000';
        }
    });
}

function cycleImages(images, startTime, portal, counter, loader, emptyPage) {
    const elapsed = performance.now() - startTime;

    if (elapsed >= DURATION_MS) {
        finishAndExit(images, portal, counter, loader, emptyPage);
        return;
    }

    cycleTimeout = setTimeout(() => {
        const prev = images[currentImgIndex];
        gsap.killTweensOf(prev);
        gsap.set(prev, { clearProps: 'all' });
        gsap.set(prev, { opacity: 0 });

        currentImgIndex = (currentImgIndex + 1) % images.length;
        const current = images[currentImgIndex];

        gsap.killTweensOf(current);
        const randomRot = (Math.random() * 26) - 13;

        gsap.fromTo(current,
            { opacity: 0, scale: 0.75, rotation: -randomRot },
            { opacity: 1, scale: 1, rotation: randomRot, duration: 0.28, ease: 'back.out(1.2)' }
        );

        cycleImages(images, startTime, portal, counter, loader, emptyPage);
    }, getCurveDelay(elapsed));
}

function finishAndExit(images, portal, counter, loader, emptyPage) {
    const current = images[currentImgIndex];
    if (current) {
        gsap.to(current, {
            scale: 0,
            duration: 0.5,
            ease: 'power4.inOut',
            delay: 0.2
        });
    }

    if (counter) {
        gsap.to(counter, {
            autoAlpha: 0,
            duration: 0.4,
            ease: 'power4.inOut'
        });
    }

    const cLoad = document.getElementById('c-load');
    const devLoad = document.getElementById('dev-load');
    if (cLoad) gsap.to(cLoad, { yPercent: -110, duration: 0.6, ease: 'power4.inOut', delay: 0.25 });
    if (devLoad) gsap.to(devLoad, { yPercent: -110, duration: 0.6, ease: 'power4.inOut', delay: 0.25 });

    gsap.to(portal, {
        width: '1rem',
        duration: 0.6,
        ease: 'power4.inOut',
        delay: 0.3,
        onComplete: () => {
            if (emptyPage) emptyPage.classList.add('visible');
            startTubesBackground();
            gsap.set(emptyPage, { yPercent: 12, scale: 1.03, transformOrigin: 'center center' });
            gsap.timeline()
                .to(loader, {
                    yPercent: -100,
                    duration: .95,
                    ease: 'power3.inOut',
                    onComplete: () => {
                        loader.style.display = 'none';
                        gsap.delayedCall(5, changeFooterTitle);
                    }
                }, 0)
                .to(emptyPage, {
                    yPercent: 0,
                    scale: 1,
                    duration: 1.15,
                    ease: 'power3.out'
                }, 0);
        }
    });
}

function splitTitleLetters(copy) {
    const letters = [];
    copy.querySelectorAll('.title-line').forEach(line => {
        const content = line.textContent;
        line.replaceChildren();
        [...content].forEach(character => {
            const span = document.createElement('span');
            span.className = 'title-char';
            span.textContent = character;
            line.appendChild(span);
            letters.push(span);
        });
    });
    return letters;
}

function changeFooterTitle() {
    const title = document.getElementById('page-title');
    const initial = title.querySelector('.title-copy--initial');
    const next = title.querySelector('.title-copy--next');
    const oldLetters = splitTitleLetters(initial);
    const newLetters = splitTitleLetters(next);
    gsap.set(next, { visibility: 'visible' });
    gsap.set(newLetters, { opacity: 0, yPercent: 45, scale: .96 });
    gsap.timeline()
        .to(oldLetters, { scale: 1.07, y: -4, duration: .18, stagger: .025, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 0)
        .to(oldLetters, { opacity: 0, yPercent: -45, duration: .34, stagger: .025, ease: 'power2.inOut' }, .28)
        .to(newLetters, { opacity: 1, yPercent: 0, scale: 1, duration: .48, stagger: .025, ease: 'power3.out' }, .36)
        .call(() => {
            initial.style.visibility = 'hidden';
            title.setAttribute('aria-label', '¿Sigues aquí? Vete.');
            gsap.delayedCall(1.4, transitionToCipherScene);
        });
}

function transitionToCipherScene() {
    const current = document.getElementById('footer-scene');
    const next = document.getElementById('cipher-scene');
    gsap.set(next, { yPercent: 14, scale: 1.025, transformOrigin: 'center center' });
    gsap.timeline()
        .to(current, { yPercent: -100, duration: 1.2, ease: 'power3.inOut' }, 0)
        .to(next, { yPercent: 0, scale: 1, duration: 1.45, ease: 'power3.out' }, 0)
        .call(() => { current.style.display = 'none'; });
}

function showFinalTitleWithoutAnimation() {
    const title = document.getElementById('page-title');
    title.querySelector('.title-copy--initial').style.visibility = 'hidden';
    title.querySelector('.title-copy--next').style.visibility = 'visible';
    title.setAttribute('aria-label', '¿Sigues aquí? Vete.');
    setTimeout(() => {
        document.getElementById('footer-scene').style.display = 'none';
    }, 1400);
}

function startTubesBackground() {
    document.dispatchEvent(new Event('tubes:start'));
}
