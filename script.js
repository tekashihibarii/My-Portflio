document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const body = document.body;

    // 1. Theme Toggle + Portrait Sync
    const themeToggle = document.getElementById('themeToggle');
    const portraitToggle = document.getElementById('portraitToggle');
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    function syncThemeUI(isLight) {
        if (themeToggle) themeToggle.setAttribute('aria-pressed', String(isLight));
        if (themeMeta) themeMeta.setAttribute('content', isLight ? '#f6f5f2' : '#0a0a0a');
    }

    function applyTheme(isLight) {
        root.classList.toggle('light-theme', isLight);
        body.classList.toggle('light-theme', isLight);
        try {
            localStorage.setItem('portfolioTheme', isLight ? 'light' : 'dark');
        } catch (_) {
            // Ignore storage errors in restricted environments
        }
        syncThemeUI(isLight);
    }

    const initialLight =
        root.classList.contains('light-theme') ||
        body.classList.contains('light-theme');
    if (initialLight) {
        body.classList.add('light-theme');
    }
    syncThemeUI(initialLight);

    function toggleTheme() {
        applyTheme(!root.classList.contains('light-theme'));
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (portraitToggle) {
        portraitToggle.addEventListener('click', toggleTheme);
        portraitToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }

    // 2. Zero-Layout-Read rAF Scroll Progress & IntersectionObserver Active Nav
    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('main > section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    let maxScroll = 0;
    let navScrolled = false;
    let currentActiveId = '';
    let scrollTicking = false;

    function recalcMetrics() {
        maxScroll = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
    }

    function setActiveNav(id) {
        if (!id || id === currentActiveId) return;
        currentActiveId = id;
        const hash = `#${id}`;
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });
        sidebarLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });
    }

    function updateOnScroll() {
        scrollTicking = false;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (scrollProgress) {
            const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
            scrollProgress.style.transform = `scaleX(${ratio})`;
        }

        const isScrolled = scrollTop > 50;
        if (isScrolled !== navScrolled) {
            navScrolled = isScrolled;
            if (navbar) navbar.classList.toggle('scrolled', isScrolled);
        }

        if (maxScroll > 0 && scrollTop + 2 >= maxScroll) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) setActiveNav(lastSection.id);
        } else if (scrollTop < 120 && sections[0]) {
            setActiveNav(sections[0].id);
        }
    }

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveNav(entry.target.id);
                    }
                });
            },
            { root: null, rootMargin: '-35% 0px -55% 0px', threshold: 0 }
        );
        sections.forEach((section) => navObserver.observe(section));
    }

    let resizeTimer = null;
    window.addEventListener(
        'resize',
        () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                recalcMetrics();
                updateOnScroll();
            }, 150);
        },
        { passive: true }
    );

    window.addEventListener(
        'scroll',
        () => {
            if (!scrollTicking) {
                scrollTicking = true;
                requestAnimationFrame(updateOnScroll);
            }
        },
        { passive: true }
    );

    window.addEventListener('load', () => {
        recalcMetrics();
        updateOnScroll();
    });

    recalcMetrics();
    updateOnScroll();

    // 3. Mobile Sidebar Toggle & Escape Support
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.querySelector('.close-btn');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    function setSidebarState(open, restoreFocus = true) {
        if (!sidebar || !sidebarOverlay) return;
        sidebar.classList.toggle('open', open);
        sidebarOverlay.classList.toggle('open', open);
        body.style.overflow = open ? 'hidden' : '';
        if (hamburger) hamburger.setAttribute('aria-expanded', String(open));
        if (open && closeBtn) {
            closeBtn.focus();
        } else if (!open && restoreFocus && hamburger) {
            hamburger.focus();
        }
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = sidebar && sidebar.classList.contains('open');
            setSidebarState(!isOpen);
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', () => setSidebarState(false));
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => setSidebarState(false));

    sidebarLinks.forEach((link) => {
        link.addEventListener('click', () => setSidebarState(false, false));
    });

    // 4. Certificate Category Filtering
    const certCards = Array.from(document.querySelectorAll('.certificate-card'));
    const filterBtns = document.querySelectorAll('.cert-filter-btn');
    const certCount = document.getElementById('certCount');

    function applyCertFilter(filter) {
        let visibleCount = 0;

        certCards.forEach((card) => {
            const match = filter === 'all' || card.dataset.category === filter;
            card.classList.toggle('is-hidden', !match);
            if (match) visibleCount += 1;
        });

        filterBtns.forEach((btn) => {
            const isSelected = btn.dataset.filter === filter;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-pressed', String(isSelected));
        });

        if (certCount) {
            certCount.textContent =
                filter === 'all'
                    ? `${certCards.length} Verified`
                    : `Showing ${visibleCount} of ${certCards.length}`;
        }

        recalcMetrics();
        updateOnScroll();
    }

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            applyCertFilter(btn.dataset.filter || 'all');
        });
    });

    // 5. Certificate Lightbox Modal (Prev/Next + PDF Download + Focus Trap)
    const certModal = document.getElementById('certModal');
    const certModalClose = document.getElementById('certModalClose');
    const certModalBackdrop = document.querySelector('.cert-modal-backdrop');
    const certModalImg = document.getElementById('certModalImg');
    const certModalTitle = document.getElementById('certModalTitle');
    const certModalIssuer = document.getElementById('certModalIssuer');
    const certModalCounter = document.getElementById('certModalCounter');
    const certModalDownload = document.getElementById('certModalDownload');
    const certModalPrev = document.getElementById('certModalPrev');
    const certModalNext = document.getElementById('certModalNext');
    const certModalDialog = document.querySelector('.cert-modal-dialog');

    let currentModalIndex = 0;
    let lastFocusedElement = null;

    function getVisibleCertCards() {
        return certCards.filter((card) => !card.classList.contains('is-hidden'));
    }

    function renderCertModal(card, index, total) {
        const imgSrc = card.dataset.cert || '';
        const pdfSrc = card.dataset.pdf || '';
        const title = card.dataset.title || 'Certificate';
        const issuer = card.dataset.issuer || '';
        const date = card.dataset.date || '';

        if (certModalImg) {
            certModalImg.src = imgSrc;
            certModalImg.alt = `${title} Certificate`;
        }
        if (certModalTitle) certModalTitle.textContent = title;
        if (certModalIssuer) {
            certModalIssuer.textContent = date ? `${issuer} • ${date}` : issuer;
        }
        if (certModalCounter) {
            certModalCounter.textContent = `${index + 1} / ${total}`;
        }
        if (certModalDownload) {
            if (pdfSrc) {
                certModalDownload.href = pdfSrc;
                certModalDownload.setAttribute('download', pdfSrc.split('/').pop() || 'certificate.pdf');
                certModalDownload.style.display = '';
            } else {
                certModalDownload.style.display = 'none';
            }
        }
    }

    function openCertModal(card, triggerEl) {
        const visibleCards = getVisibleCertCards();
        const idx = Math.max(0, visibleCards.indexOf(card));
        currentModalIndex = idx;
        lastFocusedElement = triggerEl || document.activeElement;

        renderCertModal(visibleCards[idx] || card, idx, visibleCards.length || 1);

        if (certModal) {
            certModal.classList.add('active');
            certModal.setAttribute('aria-hidden', 'false');
            body.style.overflow = 'hidden';
        }
        if (certModalClose) certModalClose.focus();
    }

    function navigateCertModal(delta) {
        const visibleCards = getVisibleCertCards();
        if (!visibleCards.length) return;
        currentModalIndex = (currentModalIndex + delta + visibleCards.length) % visibleCards.length;
        renderCertModal(visibleCards[currentModalIndex], currentModalIndex, visibleCards.length);
    }

    function closeCertModal() {
        if (!certModal) return;
        certModal.classList.remove('active');
        certModal.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    certCards.forEach((card) => {
        const previewTrigger = card.querySelector('.cert-img-wrapper');
        const viewBtn = card.querySelector('.view-cert-btn');

        if (previewTrigger) {
            previewTrigger.addEventListener('click', () => openCertModal(card, previewTrigger));
        }
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openCertModal(card, viewBtn);
            });
        }
    });

    if (certModalPrev) certModalPrev.addEventListener('click', () => navigateCertModal(-1));
    if (certModalNext) certModalNext.addEventListener('click', () => navigateCertModal(1));
    if (certModalClose) certModalClose.addEventListener('click', closeCertModal);
    if (certModalBackdrop) certModalBackdrop.addEventListener('click', closeCertModal);

    window.addEventListener('keydown', (e) => {
        const modalOpen = certModal && certModal.classList.contains('active');
        const sidebarOpen = sidebar && sidebar.classList.contains('open');

        if (e.key === 'Escape') {
            if (modalOpen) {
                closeCertModal();
            } else if (sidebarOpen) {
                setSidebarState(false);
            }
            return;
        }

        if (modalOpen) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateCertModal(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateCertModal(1);
            } else if (e.key === 'Tab' && certModalDialog) {
                const focusable = Array.from(
                    certModalDialog.querySelectorAll('a[href], button:not([disabled])')
                ).filter((el) => el.offsetParent !== null);
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    });

    // 6. Copy-to-Clipboard Helper & Contact Form Handler
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textarea);
            }
        });
    }

    const copyEmailBtn = document.getElementById('copyEmailBtn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const emailText = copyEmailBtn.dataset.copy || 'adrianlagura04@gmail.com';
            copyText(emailText)
                .then(() => {
                    copyEmailBtn.textContent = 'Copied!';
                    copyEmailBtn.classList.add('copied');
                    setTimeout(() => {
                        copyEmailBtn.textContent = 'Copy Email';
                        copyEmailBtn.classList.remove('copied');
                    }, 2200);
                })
                .catch(() => {
                    copyEmailBtn.textContent = 'adrianlagura04@gmail.com';
                });
        });
    }

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('formStatus');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameVal = (document.getElementById('name')?.value || '').trim();
            const emailVal = (document.getElementById('email')?.value || '').trim();
            const subjectVal = (document.getElementById('subject')?.value || '').trim() || `Portfolio Inquiry from ${nameVal}`;
            const messageVal = (document.getElementById('message')?.value || '').trim();

            if (!nameVal || !emailVal || !messageVal) return;

            const composedBody = `From: ${nameVal} <${emailVal}>\n\n${messageVal}`;
            const mailtoUrl = `mailto:adrianlagura04@gmail.com?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(composedBody)}`;

            window.location.href = mailtoUrl;

            if (formStatus) {
                formStatus.textContent = '';

                const statusMsg = document.createElement('span');
                statusMsg.textContent = `Draft prepared for adrianlagura04@gmail.com.`;

                const actionsWrap = document.createElement('div');
                actionsWrap.className = 'form-status-actions';

                const mailLink = document.createElement('a');
                mailLink.href = mailtoUrl;
                mailLink.className = 'form-status-link';
                mailLink.textContent = 'Open Email App';

                const copyMsgBtn = document.createElement('button');
                copyMsgBtn.type = 'button';
                copyMsgBtn.className = 'copy-btn';
                copyMsgBtn.textContent = 'Copy Message';
                copyMsgBtn.addEventListener('click', () => {
                    copyText(`Subject: ${subjectVal}\n\n${composedBody}`).then(() => {
                        copyMsgBtn.textContent = 'Copied!';
                        copyMsgBtn.classList.add('copied');
                    });
                });

                actionsWrap.appendChild(mailLink);
                actionsWrap.appendChild(copyMsgBtn);
                formStatus.appendChild(statusMsg);
                formStatus.appendChild(actionsWrap);
                formStatus.hidden = false;
            }
        });
    }

    // 7. Copyable Credential IDs
    document.querySelectorAll('.cred-copy-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const credId = btn.dataset.copyId;
            if (!credId) return;
            copyText(credId)
                .then(() => {
                    btn.textContent = 'Copied';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = 'Copy';
                        btn.classList.remove('copied');
                    }, 1800);
                })
                .catch(() => {
                    btn.textContent = 'Copy';
                });
        });
    });
});
