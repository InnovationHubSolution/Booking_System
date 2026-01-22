# Quick Reference: Tourism CSS Classes

## Layout & Cards

### Tourism Cards
```css
.tourism-card              /* Premium card with hover lift effect */
.tourism-card:hover        /* Elevated with shadow and accent border */
.featured-card            /* Special card with shine animation */
.glass-card               /* Frosted glass effect */
.glass-card-dark          /* Dark glass effect for overlays */
```

### Payment Components
```css
.payment-method-selector   /* Container for payment options */
.payment-method-card       /* Individual payment method */
.payment-method-card.selected /* Selected state with checkmark */
.payment-icon             /* Payment method icon */
```

## Buttons

### Primary Actions
```css
.btn-primary-tourism      /* Gradient ocean button with ripple */
.btn-secondary-tourism    /* Outline button with fill on hover */
.btn-accent               /* Sunset gradient for special actions */
```

## Typography

### Headers
```css
.section-header           /* Large heading with gradient underline */
.section-subheader        /* Subtitle text below headers */
```

### Prices
```css
.price-display            /* Standard price (2rem) */
.price-display-large      /* Large gradient price (3rem) */
.price-currency           /* Currency symbol styling */
.price-period             /* Per night/person text */
.price-savings            /* Green savings badge */
```

## Visual Effects

### Gradients
```css
.gradient-ocean-overlay   /* Blue-green gradient */
.gradient-sunset-overlay  /* Orange-pink gradient */
.gradient-paradise        /* Multi-blue gradient */
.gradient-tropical        /* Orange-coral gradient */
```

### Hover Effects
```css
.hover-lift               /* Strong lift on hover (-12px) */
.hover-lift-subtle        /* Subtle lift (-4px) */
.zoom-on-hover            /* Container for image zoom */
.shine-effect             /* Shine animation on hover */
```

## Animations

### Floating
```css
.animate-float            /* 3s up-down float */
.animate-float-slow       /* 4s slow float */
```

### Entry Animations
```css
.hero-fade-in             /* Fade in with scale */
.hero-slide-up            /* Slide up with fade */
.hero-slide-up-delay-1    /* Delayed slide (0.2s) */
.hero-slide-up-delay-2    /* Delayed slide (0.4s) */
.hero-slide-up-delay-3    /* Delayed slide (0.6s) */
```

### Stagger Lists
```css
.stagger-item-1           /* First item (0.1s delay) */
.stagger-item-2           /* Second item (0.2s delay) */
.stagger-item-3           /* Third item (0.3s delay) */
/* ... up to .stagger-item-6 */
```

### Loading States
```css
.shimmer-loader           /* Shimmer animation */
.pulse-loader             /* Pulsing scale animation */
.progress-bar             /* Progress container */
.progress-bar-fill        /* Progress fill with shimmer */
```

## Badges & Tags

### Badges
```css
.badge-featured           /* Orange gradient badge */
.badge-rating             /* White rating badge */
.tag-category             /* Blue category tag */
.ribbon                   /* Corner ribbon badge */
```

## Components

### Statistics
```css
.stat-card                /* Stats display card */
.stat-number              /* Large gradient number */
.stat-label               /* Description text */
```

### Testimonials
```css
.testimonial-card         /* Review card with quote */
```

### Images
```css
.image-overlay-gradient   /* Gradient overlay for images */
.image-zoom               /* Image that zooms on parent hover */
```

## Utility Classes

### Decorative
```css
.wave-decoration          /* Wave motion animation */
.cursor-blink             /* Blinking cursor */
.tooltip                  /* Hover tooltip (use data-tooltip) */
.confetti                 /* Confetti falling animation */
```

### Notifications
```css
.notification-enter       /* Slide in from right */
.notification-exit        /* Slide out to right */
```

### Responsive
```css
.mobile-hidden            /* Hidden on mobile (<640px) */
.mobile-only              /* Visible only on mobile */
```

### Accessibility
```css
.focus-ring               /* Accessible focus indicator */
.skip-link                /* Skip to content link */
.no-print                 /* Hide when printing */
```

## Usage Examples

### Property Card
```tsx
<div className="tourism-card hover-lift stagger-item-1">
  <div className="zoom-on-hover">
    <img src="property.jpg" alt="Property" />
  </div>
  <div className="badge-featured animate-float">Featured</div>
  <div className="p-6">
    <h3 className="text-xl font-bold">Beachfront Villa</h3>
    <p className="price-display-large">$299<span className="price-period">/night</span></p>
    <button className="btn-primary-tourism w-full mt-4">Book Now</button>
  </div>
</div>
```

### Payment Selection
```tsx
<div className="payment-method-card selected">
  <div className="payment-icon">💳</div>
  <div>
    <h4>Credit Card</h4>
    <p>Secure payment</p>
  </div>
</div>
```

### Hero Section
```tsx
<div className="hero-fade-in">
  <h1 className="section-header hero-slide-up">Welcome to Paradise</h1>
  <p className="section-subheader hero-slide-up-delay-1">
    Discover Vanuatu's beauty
  </p>
  <button className="btn-accent shine-effect hero-slide-up-delay-2">
    Explore Now
  </button>
</div>
```

### Statistics Display
```tsx
<div className="stat-card stagger-item-1">
  <div className="stat-number count-up">1000+</div>
  <div className="stat-label">Happy Travelers</div>
</div>
```

### Loading State
```tsx
<div className="shimmer-loader h-48 rounded-lg"></div>
```

### Glass Card
```tsx
<div className="glass-card rounded-pacific p-6">
  <h3 className="text-xl font-bold">Special Offer</h3>
  <p>Save up to 30% on bookings</p>
</div>
```

## Color Variables (via Tailwind)

### Ocean & Sky
- `pacific-deep` - #0A4A6B
- `pacific-blue` - #1B7FA8
- `pacific-light` - #4FA8CE
- `pacific-turquoise` - #00A99D
- `pacific-sky` - #87CEEB

### Accents
- `coral` - #FF6B4A
- `sunset` - #F4A842
- `flame` - #D64545
- `hibiscus` - #E85D75

### Neutrals
- `cloud` - #FAFAFA
- `mist` - #E5E5E5
- `stone` - #9E9E9E
- `shadow` - #616161

## Tips

1. **Combine classes** for best effect:
   ```tsx
   className="tourism-card hover-lift shine-effect stagger-item-1"
   ```

2. **Use animations sparingly** - too many can be overwhelming

3. **Test on mobile** - all classes are responsive

4. **Accessibility first** - animations disabled for reduced-motion preference

5. **Layer effects** - combine gradients, patterns, and overlays for depth

6. **Performance** - use transform/opacity for animations (GPU accelerated)

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Glassmorphism | ✅ 76+ | ✅ 103+ | ✅ 9+ | ✅ 79+ |
| Gradients | ✅ All | ✅ All | ✅ All | ✅ All |
| Animations | ✅ All | ✅ All | ✅ All | ✅ All |
| Transforms | ✅ All | ✅ All | ✅ All | ✅ All |

## Need Help?

- Check `TOURISM_CSS_ENHANCEMENTS.md` for detailed documentation
- See `src/styles/tourism-premium.css` for full CSS code
- Review `src/styles/tourism-animations.css` for animation details
- Explore existing components for real-world examples
