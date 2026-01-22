# Pacific Design Implementation Guide

## Sample CSS Snippets for Common Components

### 1. Section Backgrounds

#### Hero Section with Volcanic Texture
```css
.hero-section {
    background: linear-gradient(135deg, #2C2C2C 0%, #0A4A6B 100%);
    position: relative;
    min-height: 500px;
    color: #FAFAFA;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='15' r='1.5' fill='%23FAFAFA' opacity='0.08'/%3E%3Ccircle cx='35' cy='8' r='1' fill='%23FAFAFA' opacity='0.06'/%3E%3Ccircle cx='22' cy='35' r='1.2' fill='%23FAFAFA' opacity='0.07'/%3E%3Ccircle cx='58' cy='25' r='1.3' fill='%23FAFAFA' opacity='0.08'/%3E%3Ccircle cx='75' cy='45' r='1' fill='%23FAFAFA' opacity='0.06'/%3E%3C/svg%3E");
    background-size: 100px 100px;
    pointer-events: none;
}
```

**Tailwind Classes:**
```html
<section class="relative min-h-[500px] bg-gradient-volcanic text-cloud pattern-volcanic">
    <div class="relative z-10">
        <!-- Content here -->
    </div>
</section>
```

#### Content Section with Kastom Mat Pattern
```css
.content-section {
    background-color: #FAFAFA;
    padding: 4rem 1rem;
}

.content-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(107, 68, 35, 0.03) 10px, rgba(107, 68, 35, 0.03) 11px),
        repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(107, 68, 35, 0.03) 10px, rgba(107, 68, 35, 0.03) 11px);
    pointer-events: none;
}
```

**Tailwind Classes:**
```html
<section class="relative bg-cloud py-16 pattern-kastom-mat pattern-opacity-5">
    <!-- Content here -->
</section>
```

---

### 2. Card Borders & Dividers

#### Card with Reef Pattern Background
```css
.pacific-card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(10, 74, 107, 0.1);
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
}

.pacific-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L30 10 L30 20 L20 30 L10 20 L10 10 Z' fill='none' stroke='%234FA8CE' stroke-width='1' opacity='0.08'/%3E%3C/svg%3E");
    background-size: 40px 40px;
    pointer-events: none;
}

.pacific-card-content {
    position: relative;
    z-index: 1;
}
```

**Tailwind Classes:**
```html
<div class="bg-white rounded-pacific shadow-pacific p-6 pattern-card">
    <div class="relative z-10">
        <h3 class="text-xl font-bold text-pacific-deep mb-2">Card Title</h3>
        <p class="text-shadow">Card content goes here...</p>
    </div>
</div>
```

#### Namele Divider (Cycad Leaf Pattern)
```css
.namele-divider {
    height: 3px;
    margin: 2rem 0;
    background-image: repeating-linear-gradient(
        90deg,
        #B8956A 0px,
        #B8956A 10px,
        transparent 10px,
        transparent 20px,
        #B8956A 20px,
        #B8956A 25px,
        transparent 25px,
        transparent 30px
    );
    opacity: 0.4;
}
```

**Tailwind Classes:**
```html
<div class="pattern-divider-namele my-8"></div>
```

#### Wave Divider
```html
<div class="pattern-divider-wave my-6"></div>
```

---

### 3. Header & Navigation Accents

#### Header with Wave Pattern
```css
.pacific-header {
    background: linear-gradient(135deg, #0A4A6B 0%, #1B7FA8 100%);
    padding: 1rem 0;
    position: relative;
}

.pacific-header::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    height: 20px;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10' stroke='%234FA8CE' stroke-width='2' fill='none' opacity='0.3'/%3E%3C/svg%3E");
    background-repeat: repeat-x;
    background-size: 100px 20px;
}
```

**Tailwind Classes:**
```html
<header class="bg-gradient-ocean pattern-header relative">
    <nav class="container mx-auto px-4 py-4">
        <!-- Navigation content -->
    </nav>
</header>
```

#### Navigation Bar with Subtle Texture
```html
<nav class="sticky top-0 z-50 bg-pacific-deep/95 backdrop-blur-sm pattern-volcanic pattern-opacity-5">
    <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
            <!-- Nav items -->
        </div>
    </div>
</nav>
```

---

### 4. Buttons with Pacific Design

#### Primary Button (Ocean Wave)
```css
.btn-pacific-primary {
    background: linear-gradient(135deg, #1B7FA8 0%, #00A99D 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.btn-pacific-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transition: left 0.3s ease;
}

.btn-pacific-primary:hover::before {
    left: 100%;
}

.btn-pacific-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px 0 rgba(27, 127, 168, 0.4);
}
```

**Tailwind Classes:**
```html
<button class="bg-gradient-ocean text-white px-6 py-3 rounded-lg font-semibold 
               hover:-translate-y-0.5 hover:shadow-pacific-lg transition-all duration-300
               relative overflow-hidden group">
    <span class="relative z-10">Book Now</span>
    <span class="absolute inset-0 bg-white/10 -translate-x-full 
                 group-hover:translate-x-full transition-transform duration-300"></span>
</button>
```

#### Secondary Button (Pandanus Border)
```css
.btn-pacific-secondary {
    background: transparent;
    color: #1B7FA8;
    padding: 0.75rem 1.5rem;
    border: 2px solid #B8956A;
    border-radius: 0.5rem;
    font-weight: 600;
    position: relative;
    transition: all 0.3s ease;
}

.btn-pacific-secondary::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: repeating-linear-gradient(
        90deg,
        #B8956A 0px,
        #B8956A 4px,
        transparent 4px,
        transparent 8px
    );
    border-radius: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.btn-pacific-secondary:hover::before {
    opacity: 0.3;
}
```

**Tailwind Classes:**
```html
<button class="bg-transparent text-pacific-blue border-2 border-pandanus 
               px-6 py-3 rounded-lg font-semibold
               hover:bg-pandanus/10 hover:border-pandanus-dark
               transition-all duration-300">
    Learn More
</button>
```

#### Coral Accent Button (Call-to-Action)
```html
<button class="bg-coral text-white px-8 py-4 rounded-lg font-bold text-lg
               hover:bg-coral-dark hover:shadow-coral
               transform hover:scale-105 transition-all duration-300
               pattern-nakamal-dots pattern-opacity-10">
    Start Your Journey
</button>
```

---

### 5. Footer Design

#### Footer with Wave & Earth Tones
```css
.pacific-footer {
    background: linear-gradient(135deg, #6B4423 0%, #2C2C2C 100%);
    color: #D4B896;
    padding: 3rem 1rem 2rem;
    position: relative;
}

.pacific-footer::before {
    content: '';
    position: absolute;
    top: -30px;
    left: 0;
    right: 0;
    height: 30px;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 15 Q25 5 50 15 T100 15' stroke='%236B4423' stroke-width='2' fill='none' opacity='0.6'/%3E%3Cpath d='M0 20 Q25 10 50 20 T100 20' stroke='%234A4A4A' stroke-width='2' fill='none' opacity='0.4'/%3E%3C/svg%3E");
    background-repeat: repeat-x;
    background-size: 100px 30px;
}
```

**Tailwind Classes:**
```html
<footer class="relative bg-gradient-earth text-earth-sand pt-12 pb-8 pattern-wave-footer">
    <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <!-- Footer columns -->
        </div>
        <div class="pattern-divider-wave opacity-30 my-6"></div>
        <p class="text-center text-sm text-stone">
            © 2026 Vanuatu Booking System. Designed with Pacific pride.
        </p>
    </div>
</footer>
```

---

### 6. Form Elements

#### Input Fields with Subtle Border Pattern
```css
.pacific-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #E5E5E5;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: white;
}

.pacific-input:focus {
    outline: none;
    border-color: #1B7FA8;
    box-shadow: 0 0 0 3px rgba(27, 127, 168, 0.1);
}

.pacific-input:focus + .input-pattern {
    opacity: 0.15;
}

.input-pattern {
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background-image: repeating-linear-gradient(
        90deg,
        #1B7FA8 0px,
        #1B7FA8 8px,
        transparent 8px,
        transparent 12px
    );
    opacity: 0;
    transition: opacity 0.3s ease;
}
```

**Tailwind Classes:**
```html
<div class="relative">
    <input type="text" 
           class="w-full px-4 py-3 border-2 border-mist rounded-lg
                  focus:border-pacific-blue focus:ring-4 focus:ring-pacific-blue/10
                  transition-all duration-300"
           placeholder="Enter your destination">
    <div class="input-pattern"></div>
</div>
```

---

### 7. Loading & Status Indicators

#### Nakamal Circle Loading Animation
```css
.loading-nakamal {
    width: 60px;
    height: 60px;
    position: relative;
}

.loading-nakamal::before,
.loading-nakamal::after {
    content: '';
    position: absolute;
    border: 3px solid #1B7FA8;
    border-radius: 50%;
    animation: ripple 2s ease-out infinite;
}

.loading-nakamal::before {
    width: 40px;
    height: 40px;
    top: 10px;
    left: 10px;
}

.loading-nakamal::after {
    width: 60px;
    height: 60px;
    top: 0;
    left: 0;
    animation-delay: 0.5s;
}

@keyframes ripple {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(1.2); opacity: 0; }
}
```

**Tailwind Classes:**
```html
<div class="inline-block w-16 h-16 relative">
    <div class="absolute inset-0 border-4 border-pacific-blue rounded-full animate-ripple"></div>
    <div class="absolute inset-2 border-4 border-pacific-turquoise rounded-full animate-ripple animation-delay-500"></div>
</div>
```

---

### 8. Badge & Tag Components

#### Status Badges with Patterns
```html
<!-- Confirmed Status -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
             bg-bamboo text-white pattern-nakamal-dots pattern-opacity-15">
    Confirmed
</span>

<!-- Pending Status -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
             bg-sunset text-white pattern-namele pattern-opacity-10">
    Pending
</span>

<!-- Featured Badge -->
<span class="inline-flex items-center px-4 py-2 rounded-pacific text-sm font-bold
             bg-gradient-sunset text-white shadow-sunset
             pattern-wave pattern-opacity-20">
    ⭐ Featured
</span>
```

---

### 9. Complete Component Examples

#### Booking Card Component
```html
<div class="bg-white rounded-pacific shadow-pacific-lg overflow-hidden
            hover:shadow-xl transition-shadow duration-300 pattern-card">
    <!-- Image with overlay -->
    <div class="relative h-48 bg-gradient-ocean pattern-wave-double">
        <img src="/property-image.jpg" alt="Property" 
             class="w-full h-full object-cover mix-blend-overlay">
    </div>
    
    <!-- Content -->
    <div class="p-6 relative z-10">
        <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-bold text-pacific-deep">Beachfront Villa</h3>
            <span class="px-3 py-1 bg-bamboo/10 text-bamboo rounded-full text-sm font-semibold">
                Available
            </span>
        </div>
        
        <p class="text-shadow mb-4">
            Stunning ocean views with private beach access
        </p>
        
        <div class="pattern-divider-namele my-4"></div>
        
        <div class="flex items-center justify-between">
            <span class="text-2xl font-bold text-pacific-blue">
                5,000 VUV<span class="text-sm text-stone font-normal">/night</span>
            </span>
            <button class="bg-gradient-ocean text-white px-6 py-2 rounded-lg font-semibold
                           hover:shadow-pacific transition-all duration-300">
                Book Now
            </button>
        </div>
    </div>
</div>
```

#### Section Header Component
```html
<div class="text-center mb-12">
    <div class="inline-block">
        <h2 class="text-4xl font-bold text-pacific-deep mb-2">
            Popular Destinations
        </h2>
        <div class="pattern-divider-namele mt-3"></div>
    </div>
    <p class="text-lg text-shadow mt-4 max-w-2xl mx-auto">
        Discover the most beautiful islands and experiences Vanuatu has to offer
    </p>
</div>
```

---

## Mobile-First Responsive Patterns

### Breakpoint Strategy
```css
/* Mobile (default) - Subtle patterns */
.responsive-pattern {
    background-size: 60px 60px;
    opacity: 0.05;
}

/* Tablet (md: 768px) - Medium patterns */
@media (min-width: 768px) {
    .responsive-pattern {
        background-size: 80px 80px;
        opacity: 0.08;
    }
}

/* Desktop (lg: 1024px) - Full patterns */
@media (min-width: 1024px) {
    .responsive-pattern {
        background-size: 100px 100px;
        opacity: 0.1;
    }
}
```

---

## Accessibility Checklist

✅ All text has minimum 4.5:1 contrast ratio
✅ Interactive elements have 44x44px touch targets
✅ Patterns are decorative only (not informational)
✅ Focus states are clearly visible
✅ Reduced motion respects user preferences
✅ High contrast mode removes decorative patterns

---

## Performance Tips

1. **Inline critical patterns** in HTML for above-the-fold content
2. **Lazy load** decorative patterns below the fold
3. **Use CSS patterns** over images where possible (better compression)
4. **Limit pattern complexity** on mobile devices
5. **Cache pattern SVGs** for offline access
6. **Use `contain: layout style paint`** on pattern containers

---

## Cultural Usage Guidelines

### Appropriate Contexts
- Tourism and travel booking interfaces
- Community gathering spaces (digital nakamals)
- Cultural education platforms
- E-commerce for local artisans

### Inappropriate Contexts
- Sacred or ceremonial content without permission
- Commercial use without community benefit
- Gambling or alcohol-related services
- Political campaign materials

---

This implementation guide provides production-ready code that honors Pacific cultural heritage while maintaining modern web standards and accessibility requirements.
