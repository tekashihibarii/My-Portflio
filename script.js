document.addEventListener('DOMContentLoaded', () => {
    // 0. Scroll Progress Bar
    const scrollProgress = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const totalScroll = document.documentElement.scrollTop;
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scroll = `${totalScroll / windowHeight * 100}%`;
        if (scrollProgress) {
            scrollProgress.style.width = scroll;
        }
    });

    // 0.5 Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        if (cursorDot) {
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
        }
        if (cursorOutline) {
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        }
    });

    const hoverElements = document.querySelectorAll('a, button, .project-card, .hamburger, .close-btn, input, textarea');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursorOutline) {
                cursorOutline.classList.add('cursor-hover');
            }
        });
        el.addEventListener('mouseleave', () => {
            if (cursorOutline) {
                cursorOutline.classList.remove('cursor-hover');
            }
        });
    });

    // 0.8 Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');

    function enableLightMode() {
        document.body.classList.add('light-theme');
        localStorage.setItem('portfolioTheme', 'light');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    }

    function enableDarkMode() {
        document.body.classList.remove('light-theme');
        localStorage.setItem('portfolioTheme', 'dark');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }

    // Check local storage for saved theme
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme === 'light') {
        enableLightMode();
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('light-theme')) {
                enableDarkMode();
            } else {
                enableLightMode();
            }
        });
    }

    // 1. Scroll styling for navbar
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for fade-in animations
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Optional: only animate once
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // 3. Active state for navigation links based on scroll position
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            // Adjust threshold as needed
            if (scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // 4. Sidebar Toggle Logic
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.querySelector('.close-btn');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    function toggleSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('open');
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        }
    }

    if (hamburger) hamburger.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    sidebarLinks.forEach(link => {
        link.addEventListener('click', toggleSidebar);
    });

    // 5. Handle Contact Form submission (Demo)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'SENDING...';
            submitBtn.style.opacity = '0.7';

            // Simulate API call
            setTimeout(() => {
                submitBtn.textContent = 'MESSAGE SENT!';
                submitBtn.style.backgroundColor = '#4caf50';
                submitBtn.style.color = '#fff';

                contactForm.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.opacity = '1';
                }, 3000);
            }, 1500);
        });
    }
});
