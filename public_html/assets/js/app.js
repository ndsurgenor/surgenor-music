// Mobile navigation toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
    const menuIcon = menuToggle.querySelector('svg');
    menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== '0px';
        if (isOpen) {
            mobileMenu.style.maxHeight = '0';
            menuToggle.setAttribute('aria-expanded', 'false');
            menuIcon.classList.remove('rotate-90');
        } else {
            mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
            menuToggle.setAttribute('aria-expanded', 'true');
            menuIcon.classList.add('rotate-90');
        }
    });
}

// Auto-dismiss flash messages
const flash = document.getElementById('flash-message');
if (flash) {
    setTimeout(() => {
        flash.style.transition = 'opacity 0.5s ease';
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 500);
    }, 4000);
}

// Song catalogue: live client-side filtering
(function () {
    const searchInput = document.getElementById('q');
    if (!searchInput) return;

    const resetBtn  = document.getElementById('song-reset');
    const rows      = document.querySelectorAll('[data-song-row]');
    const countEl   = document.getElementById('song-count');
    const noResults = document.getElementById('song-no-results');

    function getChecked(id) {
        return Array.from(document.querySelectorAll(`#ms-${id} input[type="checkbox"]:checked`))
                    .map(cb => cb.value);
    }

    function setMultiselectLabel(id) {
        const label = document.querySelector(`#ms-${id} [data-multiselect-label]`);
        if (!label) return;
        const boxes = document.querySelectorAll(`#ms-${id} input[type="checkbox"]:checked`);
        const none  = id === 'key' ? 'All keys' : 'All themes';
        const noun  = id === 'key' ? 'keys' : 'themes';
        if (!boxes.length) {
            label.textContent = none;
        } else if (boxes.length === 1) {
            label.textContent = boxes[0].closest('label').querySelector('span').textContent.trim();
        } else {
            label.textContent = boxes.length + ' ' + noun + ' selected';
        }
    }

    function setActiveStyle(el, active) {
        if (active) {
            el.style.borderColor = 'rgba(20, 121, 114, 0.75)';
            el.style.boxShadow   = '0 0 0 1px rgba(20, 121, 114, 0.3)';
        } else {
            el.style.borderColor = '';
            el.style.boxShadow   = '';
        }
    }

    function filterSongs() {
        const q            = searchInput.value.toLowerCase().trim();
        const selectedKeys = getChecked('key');
        const selectedTags = getChecked('tag');

        let visible = 0;
        rows.forEach(row => {
            const show =
                (!q              || row.dataset.title.includes(q) || row.dataset.ccli.includes(q)) &&
                (!selectedKeys.length || selectedKeys.includes(row.dataset.key)) &&
                (!selectedTags.length || row.dataset.tags.split(' ').some(t => selectedTags.includes(t)));
            row.style.display = show ? '' : 'none';
            if (show) visible++;
        });

        if (countEl) countEl.textContent = visible + ' song' + (visible !== 1 ? 's' : '');
        if (noResults) noResults.style.display = visible === 0 ? '' : 'none';

        const hasFilters = !!(q || selectedKeys.length || selectedTags.length);
        if (resetBtn) {
            resetBtn.classList.toggle('opacity-30', !hasFilters);
            resetBtn.classList.toggle('pointer-events-none', !hasFilters);
        }

        const keyTrigger = document.querySelector('#ms-key [data-multiselect-trigger]');
        const tagTrigger = document.querySelector('#ms-tag [data-multiselect-trigger]');
        if (keyTrigger) setActiveStyle(keyTrigger, selectedKeys.length > 0);
        if (tagTrigger) setActiveStyle(tagTrigger, selectedTags.length > 0);
    }

    // Search input debounce
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(filterSongs, 180);
    });

    // Search input active border (focus/blur)
    searchInput.addEventListener('focus', () => setActiveStyle(searchInput, false));
    searchInput.addEventListener('blur',  () => setActiveStyle(searchInput, !!searchInput.value.trim()));

    // Multiselect open/close and checkbox changes
    document.querySelectorAll('[data-multiselect]').forEach(ms => {
        const trigger = ms.querySelector('[data-multiselect-trigger]');
        const panel   = ms.querySelector('[data-multiselect-panel]');
        if (!trigger || !panel) return;

        trigger.addEventListener('click', () => {
            const isOpen = !panel.classList.contains('hidden');
            document.querySelectorAll('[data-multiselect-panel]').forEach(p => p.classList.add('hidden'));
            if (!isOpen) panel.classList.remove('hidden');
        });

        panel.addEventListener('change', () => {
            setMultiselectLabel(ms.id.replace('ms-', ''));
            filterSongs();
        });
    });

    // Close panels on outside click
    document.addEventListener('click', e => {
        if (!e.target.closest('[data-multiselect]')) {
            document.querySelectorAll('[data-multiselect-panel]').forEach(p => p.classList.add('hidden'));
        }
    });

    // Tag badge click → check that tag in the dropdown
    document.querySelectorAll('[data-tag-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cb = document.querySelector(`#ms-tag input[value="${btn.dataset.tagFilter}"]`);
            if (cb) { cb.checked = true; setMultiselectLabel('tag'); filterSongs(); }
        });
    });

    // Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            searchInput.value = '';
            document.querySelectorAll('[data-multiselect] input[type="checkbox"]').forEach(cb => cb.checked = false);
            setMultiselectLabel('key');
            setMultiselectLabel('tag');
            setActiveStyle(searchInput, false);
            filterSongs();
            resetBtn.blur();
        });
    }

    filterSongs();
}());

// Song catalogue: column sorting
(function () {
    const sortable = document.querySelectorAll('[data-sort-col]');
    if (!sortable.length) return;

    const tbody = document.getElementById('song-tbody');
    let sortCol = 'title';
    let sortDir = 'asc';

    function getValue(row, col) {
        switch (col) {
            case 'title': return [0, row.dataset.title || ''];
            case 'ccli': {
                const v = row.dataset.ccli || '';
                return v ? [0, v.padStart(10, '0')] : [1, ''];
            }
            case 'key': {
                const v = row.dataset.key || '';
                return v ? [0, v] : [1, ''];
            }
            case 'tempo': {
                const v = row.dataset.tempo || '';
                return v ? [0, v.padStart(10, '0')] : [1, ''];
            }
            case 'tags': {
                const v = (row.dataset.tags || '').split(' ')[0] || '';
                return v ? [0, v] : [1, ''];
            }
            default: return [0, ''];
        }
    }

    function sortRows() {
        const rows = Array.from(tbody.querySelectorAll('[data-song-row]'));
        rows.sort((a, b) => {
            const [ap, av] = getValue(a, sortCol);
            const [bp, bv] = getValue(b, sortCol);
            if (ap !== bp) return ap - bp;
            const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
            return sortDir === 'asc' ? cmp : -cmp;
        });
        rows.forEach(row => tbody.appendChild(row));
        updateHeaders();
    }

    function updateHeaders() {
        sortable.forEach(th => {
            const isActive = th.dataset.sortCol === sortCol;
            const label = th.querySelector('.sort-label');
            const ascEl = th.querySelector('.sort-asc');
            const descEl = th.querySelector('.sort-desc');

            if (label) {
                label.classList.toggle('text-primary', isActive);
                label.classList.toggle('text-primary-800', !isActive);
            }
            if (ascEl && descEl) {
                ascEl.classList.toggle('opacity-30', !(isActive && sortDir === 'asc'));
                descEl.classList.toggle('opacity-30', !(isActive && sortDir === 'desc'));
            }
        });
    }

    sortable.forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sortCol;
            if (col === sortCol) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortCol = col;
                sortDir = 'asc';
            }
            sortRows();
        });
    });

    sortRows();
}());

// Admin: confirm before destructive actions
document.querySelectorAll('[data-confirm]').forEach(btn => {
    btn.addEventListener('click', e => {
        if (!confirm(btn.dataset.confirm)) {
            e.preventDefault();
        }
    });
});

// Admin file upload: show selected filenames
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', () => {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('file-label')) {
            const names = Array.from(input.files).map(f => f.name).join(', ');
            label.textContent = names || 'No files chosen';
        }
    });
});

// Admin forms: spinner + "Saving…" on submit buttons while the page is saving
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => {
        const btn = form.querySelector('[type="submit"]');
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML =
            '<svg class="animate-spin inline -mt-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24">' +
                '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>' +
            '</svg>Saving…';
    });
});

// Rich text editor — auto-initialises any [data-rich-editor] contenteditable area.
// Stores Tailwind span classes in the DB; uses native tags internally so execCommand works.
(function () {
    function toEditorHtml(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        div.querySelectorAll('span.font-semibold').forEach(span => {
            const b = document.createElement('b');
            while (span.firstChild) b.appendChild(span.firstChild);
            span.parentNode.replaceChild(b, span);
        });
        div.querySelectorAll('span.italic').forEach(span => {
            const em = document.createElement('em');
            while (span.firstChild) em.appendChild(span.firstChild);
            span.parentNode.replaceChild(em, span);
        });
        div.querySelectorAll('span.underline').forEach(span => {
            const u = document.createElement('u');
            while (span.firstChild) u.appendChild(span.firstChild);
            span.parentNode.replaceChild(u, span);
        });
        return div.innerHTML;
    }

    function toStoredHtml(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        div.querySelectorAll('b, strong').forEach(el => {
            const span = document.createElement('span');
            span.className = 'font-semibold';
            while (el.firstChild) span.appendChild(el.firstChild);
            el.parentNode.replaceChild(span, el);
        });
        div.querySelectorAll('em, i').forEach(el => {
            const span = document.createElement('span');
            span.className = 'italic';
            while (el.firstChild) span.appendChild(el.firstChild);
            el.parentNode.replaceChild(span, el);
        });
        div.querySelectorAll('u').forEach(el => {
            const span = document.createElement('span');
            span.className = 'underline';
            while (el.firstChild) span.appendChild(el.firstChild);
            el.parentNode.replaceChild(span, el);
        });
        return div.innerHTML;
    }

    document.querySelectorAll('[data-rich-editor]').forEach(editor => {
        const hiddenInput = document.getElementById(editor.dataset.richEditor);
        if (!hiddenInput) return;

        editor.innerHTML = toEditorHtml(editor.innerHTML);

        function syncInput() {
            hiddenInput.value = toStoredHtml(editor.innerHTML);
        }
        syncInput();

        editor.addEventListener('input', syncInput);

        const toolbar = editor.closest('[data-rich-toolbar]') ?? editor.parentElement;
        toolbar.querySelectorAll('[data-command]').forEach(btn => {
            btn.addEventListener('mousedown', e => {
                e.preventDefault();
                document.execCommand(btn.dataset.command, false, null);
                syncInput();
                updateToolbarState();
            });
        });

        function updateToolbarState() {
            ['bold', 'italic', 'underline'].forEach(cmd => {
                const btn = toolbar.querySelector(`[data-command="${cmd}"]`);
                if (!btn) return;
                const active = document.queryCommandState(cmd);
                btn.classList.toggle('bg-primary/10', active);
                btn.classList.toggle('text-primary', active);
            });
        }

        editor.addEventListener('keyup', updateToolbarState);
        editor.addEventListener('mouseup', updateToolbarState);
        updateToolbarState();
    });
}());
