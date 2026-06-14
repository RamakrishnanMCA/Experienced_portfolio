/* 
================================================================
2026 Portfolio Core Script
Ramakrishnan M - Junior Odoo & Python Developer
Interactive Features: Canvas Crystals, Dashboard scroll, Scramble Text
================================================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Dynamic Mouse Coordinate Glow Tracker ---
    const glowOverlay = document.getElementById('glowOverlay');
    document.addEventListener('mousemove', (e) => {
        const xPct = (e.clientX / window.innerWidth) * 100;
        const yPct = (e.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty('--mouse-x', `${xPct}%`);
        document.documentElement.style.setProperty('--mouse-y', `${yPct}%`);
    });

    // --- 2. Interactive Crystal Floating Canvas Background ---
    const canvas = document.getElementById('crystalCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let mouse = { x: null, y: null, targetX: null, targetY: null };
    
    document.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Particle Classes
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            // Translucent glowing colors (Cyan / Pink blends)
            this.color = Math.random() > 0.5 
                ? `hsla(185, 100%, 65%, ${Math.random() * 0.3 + 0.1})`
                : `hsla(315, 100%, 65%, ${Math.random() * 0.3 + 0.1})`;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Parallax mouse drag
            if (mouse.x !== null) {
                const dx = (mouse.x - width/2) * 0.015;
                const dy = (mouse.y - height/2) * 0.015;
                this.x -= dx * 0.1;
                this.y -= dy * 0.1;
            }

            // Boundary wrap
            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = Math.random() > 0.8 ? 8 : 0;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    class Crystal {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 30 + 15;
            this.sides = Math.random() > 0.5 ? 3 : 4; // Triangles or Diamonds
            this.angle = Math.random() * Math.PI * 2;
            this.spin = Math.random() * 0.004 - 0.002;
            this.speedX = Math.random() * 0.2 - 0.1;
            this.speedY = Math.random() * 0.2 - 0.1;
            this.opacity = Math.random() * 0.08 + 0.02;
        }
        update() {
            this.angle += this.spin;
            this.x += this.speedX;
            this.y += this.speedY;

            // Parallax mouse drag
            if (mouse.x !== null) {
                const dx = (mouse.x - width/2) * 0.03;
                const dy = (mouse.y - height/2) * 0.03;
                this.x -= dx * 0.05;
                this.y -= dy * 0.05;
            }

            if (this.x + this.radius < -50 || this.x - this.radius > width + 50 || 
                this.y + this.radius < -50 || this.y - this.radius > height + 50) {
                this.reset();
            }
        }
        draw() {
            ctx.strokeStyle = `hsla(185, 100%, 75%, ${this.opacity})`;
            ctx.fillStyle = `hsla(315, 100%, 75%, ${this.opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            for (let i = 0; i < this.sides; i++) {
                const currentAngle = this.angle + (i * 2 * Math.PI / this.sides);
                const px = this.x + Math.cos(currentAngle) * this.radius;
                const py = this.y + Math.sin(currentAngle) * this.radius;
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    const particlesArray = Array.from({ length: 30 }, () => new Particle());
    const crystalsArray = Array.from({ length: 10 }, () => new Crystal());

    function animate() {
        // Stop computation if page tab is hidden to save battery
        if (document.hidden) {
            requestAnimationFrame(animate);
            return;
        }

        // Smooth mouse target lerping
        if (mouse.targetX !== null) {
            if (mouse.x === null) {
                mouse.x = mouse.targetX;
                mouse.y = mouse.targetY;
            } else {
                mouse.x += (mouse.targetX - mouse.x) * 0.08;
                mouse.y += (mouse.targetY - mouse.y) * 0.08;
            }
        }

        ctx.fillStyle = 'rgba(10, 13, 20, 0.25)'; // constant obsidian trail opacity
        ctx.fillRect(0, 0, width, height);

        particlesArray.forEach(p => { p.update(); p.draw(); });
        crystalsArray.forEach(c => { c.update(); c.draw(); });

        requestAnimationFrame(animate);
    }
    animate();


    // --- 3. Interactive Text Scramble Role Swapper ---
    const scrambleRoles = [
        "Junior Odoo Developer",
        "Python Developer",
        "Odoo ORM & Views",
        "PostgreSQL Developer"
    ];
    let roleIndex = 0;
    const roleTextEl = document.getElementById('roleText');

    class TextScrambler {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameId);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span style="color:var(--accent-cyan)">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameId = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    const scrambler = new TextScrambler(roleTextEl);
    
    function cycleRoles() {
        roleIndex = (roleIndex + 1) % scrambleRoles.length;
        scrambler.setText(scrambleRoles[roleIndex]);
        setTimeout(cycleRoles, 4500); // cycle every 4.5s
    }
    // Start cycle after standard load timeout
    setTimeout(cycleRoles, 3000);


    // --- 4. Dashboard Scroll Speedometer & Dot Progress ---
    const speedometerFill = document.getElementById('speedometerFill');
    const speedometerPct = document.getElementById('speedometerPct');
    const sections = document.querySelectorAll('header.hero, section, footer');
    const navLinks = document.querySelectorAll('.nav-links a, .tracker-dot');

    window.addEventListener('scroll', () => {
        // Speedometer Calculation
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
        
        // svg circle circumference is exactly 100
        const strokeOffset = 100 - scrollPct;
        speedometerFill.style.strokeDashoffset = strokeOffset;
        speedometerPct.innerText = `${scrollPct}%`;

        // Navbar scrolled glass intensity
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        // Scrollspy Active Section highlights
        let activeSectionId = 'home';
        const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 30);
        
        if (atBottom) {
            activeSectionId = 'contact';
        } else {
            sections.forEach(sec => {
                const secTop = sec.offsetTop - 150;
                const secHeight = sec.clientHeight;
                if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
                    activeSectionId = sec.getAttribute('id');
                }
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Check both standard nav links (href="#id") and tracker dots (data-target="#id")
            const hrefVal = link.getAttribute('href');
            const targetVal = link.getAttribute('data-target');
            
            if (hrefVal === `#${activeSectionId}` || targetVal === `#${activeSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    // --- 5. Skill Fill animation on viewport enter ---
    const skillFills = document.querySelectorAll('.skill-fill');
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const widthValue = fill.getAttribute('data-width');
                fill.style.width = widthValue;
                skillsObserver.unobserve(fill);
            }
        });
    }, { threshold: 0.1 });

    skillFills.forEach(fill => skillsObserver.observe(fill));


    // --- 6. Section Reveal on Scroll (IntersectionObserver) ---
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(rev => revealObserver.observe(rev));


    // --- 7. Portfolio Filtering Grid logic ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all filters
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Hide with animations
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    // Trigger reflow to let transform animate
                    void card.offsetWidth;
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    // Delay setting display: none until transitions finish
                    setTimeout(() => {
                        if (card.style.opacity === '0') {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });


    // --- 8. Mobile Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinksMenu = document.getElementById('navLinks');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinksMenu.classList.toggle('active');
            
            // Animation for toggle lines
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = navLinksMenu.classList.contains('active') 
                ? 'rotate(45deg) translate(6px, 6px)' : 'none';
            spans[1].style.opacity = navLinksMenu.classList.contains('active') 
                ? '0' : '1';
            spans[2].style.transform = navLinksMenu.classList.contains('active') 
                ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
        });

        // Close menu on link click
        navLinksMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // --- 9. Tracker Dots click scrolling ---
    const trackerDots = document.querySelectorAll('.tracker-dot');
    trackerDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            const targetSec = document.querySelector(targetId);
            if (targetSec) {
                targetSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- 10. Interactive Mascot Companion (Click to Change Expression) ---
    const supermanPet = document.getElementById('supermanPet');
    const supermanBubble = document.getElementById('supermanBubble');

    if (supermanPet && supermanBubble) {
        const builtHighlights = [
            'I built tailored Inventory delivery flows that follow custom business rules instead of default routing logic. 🚚',
            'I built Sales Order processing steps that keep cashier-driven operations fast and accurate from POS. ⚡',
            'I built vendor pricelist priority overrides so the right price wins based on custom flags. 🎯',
            'I built a custom POS flow that captures the customer\'s name and signature, creates the Sales Order, confirms delivery, and prints the quotation inside POS. ✍️',
            'I built signature capture only for the customized POS flow to create the Sales order from POS and show that sales order report to be downloaded from the same POS screen. 🛡️',
            'I built a POS discount setup that applies tier discount on top of the default POS discount. 💳',
            'I built Magento API syncing for scheduled batch price updates and tier discount mapping. 🔄',
            'I built an external API import flow that brings JSON manufacturer data into Odoo, creates review records, and updates products after approval. 🧾',
            'I built a 150-column product importer that handles 1,000 rows per minute while keeping Odoo usable during the import. 📊',
            'I built PDF checks that compare unit prices against purchase order lines to catch mismatches early. 📄',
            'I built secure deployment and logging setups for on-premise systems and AWS monitoring. ☁️',
            'I built product search helpers that use vendor pricelist codes to surface the right items faster in POS. 🔍'
        ];

        const mascotStates = [
            'happy',
            'thinking',
            'wow',
            'wink'
        ];

        let currentStateIndex = 0;
        let currentHighlightIndex = 0;
        let highlightTimer = null;

        function showHighlight(index) {
            supermanBubble.innerText = builtHighlights[index];
            supermanBubble.classList.add('active');

            clearTimeout(window.bubbleHideTimeout);
            window.bubbleHideTimeout = setTimeout(() => {
                supermanBubble.classList.remove('active');
            }, 4500);
        }

        function showExpression(index) {
            supermanPet.dataset.expression = mascotStates[index];
        }

        function advanceHighlight() {
            currentStateIndex = (currentStateIndex + 1) % mascotStates.length;
            currentHighlightIndex = (currentHighlightIndex + 1) % builtHighlights.length;
            showExpression(currentStateIndex);
            showHighlight(currentHighlightIndex);
        }

        supermanPet.dataset.expression = mascotStates[0];

        setTimeout(() => showHighlight(0), 1200);

        highlightTimer = setInterval(advanceHighlight, 9000);

        supermanPet.addEventListener('click', (e) => {
            e.stopPropagation();
            clearInterval(highlightTimer);
            highlightTimer = setInterval(advanceHighlight, 9000);
            supermanPet.classList.add('pop');
            advanceHighlight();
            setTimeout(() => supermanPet.classList.remove('pop'), 220);
        });
    }

});
