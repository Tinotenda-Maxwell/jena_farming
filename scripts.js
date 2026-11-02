/**
 * Jena Farming Projects - shared site script
 * Loads the shared header/footer, wires up navigation and page animations.
 */
(function () {
    'use strict';

    const ANIMATED_SELECTOR = [
        '.livestock-card', '.benefit-card', '.sdg-item',
        '.product-card', '.feature-card',
        '.value-card', '.team-card', '.mv-card',
        '.blog-card', '.featured-post'
    ].join(', ');

    /** Fetch an HTML partial and inject it into the given placeholder. */
    function loadPartial(url, placeholderId) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return Promise.resolve();

        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then(html => { placeholder.innerHTML = html; })
            .catch(error => console.error(`Error loading ${url}:`, error));
    }

    /** Highlight the nav link that matches the current page. */
    function setActiveNavLink() {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('#mainNav a').forEach(link => {
            const isActive = link.getAttribute('href') === current;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
        });
    }

    /** Mobile menu toggle, outside-click and link-click closing. */
    function initMobileNav() {
        const toggle = document.getElementById('mobileToggle');
        const nav = document.getElementById('mainNav');
        if (!toggle || !nav) return;

        const icon = toggle.querySelector('i');

        const setOpen = open => {
            nav.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', String(open));
            if (icon) {
                icon.classList.toggle('fa-bars', !open);
                icon.classList.toggle('fa-times', open);
            }
        };

        toggle.addEventListener('click', e => {
            e.stopPropagation();
            setOpen(!nav.classList.contains('active'));
        });

        toggle.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(!nav.classList.contains('active'));
            }
        });

        document.addEventListener('click', e => {
            if (nav.classList.contains('active') &&
                !nav.contains(e.target) && !toggle.contains(e.target)) {
                setOpen(false);
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') setOpen(false);
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setOpen(false));
        });
    }

    /** Compact the header once the user scrolls down. */
    function initHeaderScroll() {
        const header = document.querySelector('header');
        if (!header) return;

        const update = () => header.classList.toggle('scrolled', window.scrollY > 100);
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /** Smooth scrolling for in-page anchor links. */
    function initSmoothScroll() {
        document.addEventListener('click', e => {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    /** Fade cards in as they enter the viewport. */
    function initScrollAnimations() {
        const elements = document.querySelectorAll(ANIMATED_SELECTOR);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!elements.length || reduceMotion || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -60px 0px' });

        elements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    /** When arriving via a #hash link (e.g. products.html#cattle), scroll to and highlight it. */
    function highlightHashTarget() {
        const hash = window.location.hash;
        if (!hash || hash === '#') return;
        let target;
        try { target = document.querySelector(hash); } catch (_) { return; }
        if (!target) return;

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('hash-highlight');
        setTimeout(() => target.classList.remove('hash-highlight'), 2000);
    }

    /** Keep the footer copyright year current. */
    function setCopyrightYear() {
        document.querySelectorAll('[data-current-year]').forEach(el => {
            el.textContent = new Date().getFullYear();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initSmoothScroll();
        initScrollAnimations();
        highlightHashTarget();

        loadPartial('header.html', 'header-placeholder').then(() => {
            setActiveNavLink();
            initMobileNav();
            initHeaderScroll();
        });

        loadPartial('footer.html', 'footer-placeholder').then(setCopyrightYear);
    });
})();
