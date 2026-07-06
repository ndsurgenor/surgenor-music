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
