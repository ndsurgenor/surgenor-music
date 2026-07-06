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

    // Strips any tag/attribute the toolbar doesn't produce itself (headings, spans/divs/fonts
    // carrying inline styles from pasted content, etc.), converting stripped block-level
    // elements to line breaks so paragraph structure survives. Runs on every edit so no
    // foreign markup — however it gets in, paste, drag-and-drop, or already-saved legacy
    // data — can ever reach the database or override the frontend's own lyrics styling.
    const ALLOWED_TAGS = new Set(['B', 'STRONG', 'EM', 'I', 'U', 'BR', 'DIV', 'P']);
    const BLOCK_TAGS    = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TR', 'BLOCKQUOTE']);

    function sanitizeEditor(root) {
        Array.from(root.childNodes).forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                sanitizeEditor(child);
                Array.from(child.attributes).forEach(attr => child.removeAttribute(attr.name));

                if (!ALLOWED_TAGS.has(child.tagName)) {
                    const parent = child.parentNode;
                    while (child.firstChild) parent.insertBefore(child.firstChild, child);
                    if (BLOCK_TAGS.has(child.tagName) && child.nextSibling) {
                        parent.insertBefore(document.createElement('br'), child.nextSibling);
                    }
                    parent.removeChild(child);
                }
            } else if (child.nodeType !== Node.TEXT_NODE) {
                child.remove();
            }
        });
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
        sanitizeEditor(editor);

        function syncInput() {
            sanitizeEditor(editor);
            hiddenInput.value = toStoredHtml(editor.innerHTML);
        }
        syncInput();

        editor.addEventListener('input', syncInput);

        // Strip any formatting/inline styles carried over from pasted content (e.g. Word,
        // Google Docs, another song's editor) so the frontend's own styling is never
        // overridden by foreign markup. Inserted manually via the Range API rather than
        // execCommand('insertText'), which some browsers silently fall back to a
        // formatted paste for.
        editor.addEventListener('paste', e => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');

            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            range.deleteContents();

            const fragment = document.createDocumentFragment();
            const lines = text.split(/\r\n|\r|\n/);
            lines.forEach((line, i) => {
                fragment.appendChild(document.createTextNode(line));
                if (i < lines.length - 1) fragment.appendChild(document.createElement('br'));
            });

            const lastNode = fragment.lastChild;
            range.insertNode(fragment);

            if (lastNode) {
                range.setStartAfter(lastNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            syncInput();
        });

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
