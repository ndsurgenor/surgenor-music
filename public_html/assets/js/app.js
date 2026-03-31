// Mobile navigation toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== '0px';
        if (isOpen) {
            mobileMenu.style.maxHeight = '0';
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('rotate-90');
        } else {
            mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.classList.add('rotate-90');
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
