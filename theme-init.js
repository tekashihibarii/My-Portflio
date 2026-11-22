(function () {
    try {
        if (localStorage.getItem('portfolioTheme') === 'light') {
            document.documentElement.classList.add('light-theme');
        }
    } catch (_) {
        // Ignore storage access errors in restricted environments
    }
})();
