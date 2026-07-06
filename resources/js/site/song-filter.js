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
