// Mobile navigation toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
    const menuIcon = menuToggle.querySelector('svg');
    menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== '0px';
        if (isOpen) {
            mobileMenu.style.maxHeight = '0';
            menuToggle.setAttribute('aria-expanded', 'false');
            menuIcon.classList.remove('rotate-90');
        } else {
            mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
            menuToggle.setAttribute('aria-expanded', 'true');
            menuIcon.classList.add('rotate-90');
        }
    });
}
