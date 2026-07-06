// Song detail: sheet music / lyrics view switcher
document.querySelectorAll('[data-view-switcher]').forEach(switcher => {
    const tabs   = switcher.querySelectorAll('[data-view-tab]');
    const panels = document.querySelectorAll('[data-view-panel]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.dataset.viewTab;

            tabs.forEach(t => {
                t.classList.toggle('active', t === tab);
                t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
            });

            panels.forEach(panel => {
                panel.classList.toggle('hidden', panel.dataset.viewPanel !== view);
            });
        });
    });
});
