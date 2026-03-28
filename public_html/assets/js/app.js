// Mobile navigation toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('hidden');
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
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

// Song catalogue: submit filter form on change
document.querySelectorAll('[data-auto-submit]').forEach(el => {
    el.addEventListener('change', () => el.closest('form').submit());
});

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
