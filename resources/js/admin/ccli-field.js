// Admin: CCLI SongSelect URL — auto-fills the CCLI Number field (disabled) from the
// URL, with an Auto/Manual switch to enter an override instead.
(function () {
    const field = document.querySelector('[data-ccli-field]');
    if (!field) return;

    const urlInput    = field.querySelector('[data-ccli-url-input]');
    const numberWrap  = field.querySelector('[data-ccli-number-wrap]');
    const numberInput = field.querySelector('[data-ccli-number-input]');
    const switchBtn   = field.querySelector('[data-ccli-switch]');
    const autoLabel   = field.querySelector('[data-ccli-mode-label="auto"]');
    const manualLabel = field.querySelector('[data-ccli-mode-label="manual"]');

    function extractNumber(url) {
        const match = url.match(/\/songs\/(\d+)/);
        return match ? match[1] : null;
    }

    function updateFromUrl() {
        if (!numberInput.disabled) return;
        const number = extractNumber(urlInput.value.trim());
        numberInput.value = number || '';
        numberWrap.classList.toggle('hidden', !number);
    }

    function setManual(manual) {
        switchBtn.setAttribute('aria-checked', String(!manual));
        switchBtn.classList.toggle('active', !manual);
        autoLabel.classList.toggle('text-gray-700', !manual);
        autoLabel.classList.toggle('text-gray-400', manual);
        manualLabel.classList.toggle('text-gray-700', manual);
        manualLabel.classList.toggle('text-gray-400', !manual);
        numberInput.disabled = !manual;
        numberWrap.classList.remove('hidden');
        if (manual) {
            numberInput.focus();
            numberInput.select();
        } else {
            updateFromUrl();
        }
    }

    urlInput.addEventListener('input', updateFromUrl);

    switchBtn.addEventListener('click', () => {
        setManual(switchBtn.getAttribute('aria-checked') === 'true');
    });
}());
