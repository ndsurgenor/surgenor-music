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
