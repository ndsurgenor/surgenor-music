// Admin: click an existing theme tag to append it to the Themes field;
// chips already present in the field are highlighted and stay in sync as it's edited.
(function () {
    const tagsInput = document.getElementById('tags');
    if (!tagsInput) return;

    const chips = document.querySelectorAll('[data-tag-add]');

    function currentTags() {
        return tagsInput.value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    function syncChips() {
        const current = currentTags();
        chips.forEach(btn => {
            btn.classList.toggle('tag-badge-selected', current.includes(btn.dataset.tagAdd.toLowerCase()));
        });
    }

    chips.forEach(btn => {
        btn.addEventListener('click', () => {
            const name    = btn.dataset.tagAdd;
            const current = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
            if (current.some(t => t.toLowerCase() === name.toLowerCase())) return;
            current.push(name);
            tagsInput.value = current.join(', ');
            syncChips();
        });
    });

    tagsInput.addEventListener('input', syncChips);
}());
