(function () {
    const API_URL = 'http://localhost:3000'; // change this when you deploy

    // Small styles shared by every page
    const style = document.createElement('style');
    style.textContent = `
        .plan-badge { grid-column: 3; justify-self: end; padding: 6px 14px; border: 1px solid rgb(207,124,55);
            border-radius: 999px; font-size: 14px; font-weight: 600; color: #030303; text-decoration: none;
            background: #f4e9d8; white-space: nowrap; }
        .plan-badge:hover { background: rgb(207,124,55); color: #fff; }
        .usage-line { font-size: 13px; color: #6b5842; margin: 0; }
        .usage-line.full { color: #b3402a; font-weight: 600; }
        @media (max-width: 800px) { .plan-badge { grid-column: 1 / -1; justify-self: start; margin-top: 8px; } }
    `;
    document.head.appendChild(style);

    // Anonymous ID that identifies this browser
    function clientId() {
        try {
            let id = localStorage.getItem('showroomClientId');
            if (!id) {
                id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
                    : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
                localStorage.setItem('showroomClientId', id);
            }
            return id;
        } catch (_) {
            return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
        }
    }

    // Returns { ok, status, data }. Throws only if the server can't be reached.
    async function api(method, path, body) {
        const res = await fetch(API_URL + path, {
            method,
            headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId() },
            body: body ? JSON.stringify(body) : undefined
        });
        let data = {};
        try { data = await res.json(); } catch (_) { /* non-JSON response */ }
        return { ok: res.ok, status: res.status, data };
    }

    let state = null;

    function render() {
        const badge = document.getElementById('planBadge');
        if (!state) {
            if (badge) badge.textContent = 'Offline';
            return;
        }
        const { planName, usage, limits } = state;
        if (badge) {
            badge.textContent = planName + ' plan';
            badge.title = `Price estimates ${usage.estimate}/${limits.estimate} · ` +
                          `Descriptions ${usage.description}/${limits.description} · ` +
                          `Photos ${usage.photo}/${limits.photo}`;
        }
        document.querySelectorAll('[data-usage]').forEach(el => {
            let used, limit, label;
            if (el.dataset.usage === 'photo') {
                used = usage.photo; limit = limits.photo; label = 'Photos';
            } else {
                used = Math.max(usage.estimate, usage.description);
                limit = Math.min(limits.estimate, limits.description);
                label = 'Price & description';
            }
            el.textContent = `${label}: ${used} of ${limit} used this month`;
            el.classList.toggle('full', used >= limit);
        });
    }

    async function refresh() {
        try {
            const { ok, data } = await api('GET', '/me');
            state = ok ? data : null;
        } catch (_) {
            state = null;
        }
        render();
        return state;
    }

    window.Showroom = { api, refresh, API_URL };
    document.addEventListener('DOMContentLoaded', refresh);
})();
