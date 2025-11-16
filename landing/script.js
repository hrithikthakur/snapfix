// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and steps
document.querySelectorAll('.feature-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add stagger effect to feature cards
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

// Add stagger effect to steps
const steps = document.querySelectorAll('.step');
steps.forEach((step, index) => {
    step.style.transitionDelay = `${index * 0.15}s`;
});

// Demo text animation
const demoTexts = document.querySelectorAll('.demo-text');
if (demoTexts.length > 0) {
    setTimeout(() => {
        demoTexts[0].style.opacity = '0';
        demoTexts[0].style.transform = 'translateX(-20px)';
        demoTexts[0].style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            demoTexts[0].style.opacity = '1';
            demoTexts[0].style.transform = 'translateX(0)';
        }, 500);
        
        setTimeout(() => {
            demoTexts[1].style.opacity = '0';
            demoTexts[1].style.transform = 'translateX(20px)';
            demoTexts[1].style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                demoTexts[1].style.opacity = '1';
                demoTexts[1].style.transform = 'translateX(0)';
            }, 500);
        }, 1000);
    }, 1000);
}

// Animate coming soon card
const comingSoonCard = document.querySelector('.coming-soon-card');
if (comingSoonCard) {
    comingSoonCard.style.opacity = '0';
    comingSoonCard.style.transform = 'translateY(20px)';
    comingSoonCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(comingSoonCard);
}

// Console message
console.log('%cSnapFix', 'font-size: 24px; font-weight: bold; color: #6366F1;');
console.log('%cPerfect writing, everywhere you work.', 'font-size: 14px; color: #6B7280;');

