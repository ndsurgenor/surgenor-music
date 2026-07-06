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
