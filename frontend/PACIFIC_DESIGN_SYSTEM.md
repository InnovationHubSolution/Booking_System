# Pacific Design System - Vanuatu Booking System

## Cultural Philosophy

This design system draws inspiration from the rich visual heritage of Melanesian and Polynesian cultures, particularly Vanuatu's artistic traditions. The patterns honor ancestral knowledge systems encoded in textiles, carvings, and tattoos while maintaining modern usability.

---

## Pattern Inspirations

### 1. **Namele (Cycad Leaf) Pattern**
**Cultural Meaning:** The cycad palm represents resilience, longevity, and prosperity in Vanuatu. Its symmetrical fronds symbolize balance and community.

**Usage:** Card borders, section dividers
**Pattern Type:** Geometric V-shapes and chevrons

### 2. **Kastom Mat (Woven Pandanus) Pattern**
**Cultural Meaning:** Traditional mat weaving represents community collaboration and interconnection. The diagonal weave shows paths crossing and lives intersecting.

**Usage:** Backgrounds, subtle page textures
**Pattern Type:** Diagonal cross-hatch lines

### 3. **Nakamal Circle (Gathering Place)**
**Cultural Meaning:** The circular gathering space represents unity, inclusivity, and shared purpose. Concentric circles show layers of community.

**Usage:** Button accents, loading indicators
**Pattern Type:** Concentric circles and dots

### 4. **Reef Pattern (Coral Formations)**
**Cultural Meaning:** Coral reefs are life-givers, protectors of the shore, and ecosystems of diversity. Geometric coral shapes represent growth and interconnection.

**Usage:** Card backgrounds, section accents
**Pattern Type:** Organic hexagons and triangular clusters

### 5. **Wave Pattern (Pacific Ocean)**
**Cultural Meaning:** Waves represent journey, connection between islands, and the constant rhythm of life. The ocean is both highway and provider.

**Usage:** Headers, footers, navigation bars
**Pattern Type:** Flowing curved lines and ripples

### 6. **Volcanic Stone Pattern**
**Cultural Meaning:** Volcanic rock represents strength, endurance, and the islands' origin story. The rough texture shows raw power and permanence.

**Usage:** Subtle texture overlays, hero sections
**Pattern Type:** Irregular dotted texture

---

## Color Palette

### Primary Colors (Ocean & Sky)

```css
--pacific-blue-deep: #0A4A6B      /* Deep ocean, primary actions */
--pacific-blue: #1B7FA8            /* Lagoon water, interactive elements */
--pacific-blue-light: #4FA8CE     /* Shallow reef water */
--pacific-turquoise: #00A99D      /* Tropical waters, accents */
--sky-blue: #87CEEB               /* Clear sky, backgrounds */
```

**Cultural Connection:** The ocean is life, highway, and provider. Blues represent voyaging, connection, and abundance.

### Earth Tones (Land & Growth)

```css
--volcanic-black: #2C2C2C        /* Volcanic rock, text */
--volcanic-ash: #4A4A4A          /* Ash and soil */
--earth-brown: #6B4423           /* Rich soil, wooden structures */
--sand-beige: #D4B896            /* Beach sand, light backgrounds */
--pandanus-tan: #B8956A          /* Woven materials, borders */
--bamboo-green: #8B9E7D          /* Vegetation, success states */
```

**Cultural Connection:** The land provides shelter, food, and identity. Earth tones represent stability, tradition, and growth.

### Accent Colors (Fire & Sunset)

```css
--coral-orange: #FF6B4A          /* Coral, calls-to-action */
--sunset-gold: #F4A842           /* Golden hour, highlights */
--flame-red: #D64545             /* Fire, urgent actions */
--hibiscus-pink: #E85D75         /* Tropical flowers, alerts */
```

**Cultural Connection:** Fire brings warmth, cooking, and gathering. Sunset colors represent transitions and celebration.

### Neutral Tones (Clouds & Mist)

```css
--cloud-white: #FAFAFA           /* Clouds, backgrounds */
--mist-gray: #E5E5E5             /* Morning mist, dividers */
--stone-gray: #9E9E9E            /* Weathered stone, secondary text */
--shadow-gray: #616161           /* Shadows, disabled states */
```

---

## Typography Principles

### Font Hierarchy
- **Headers:** Bold, spacious (representing open horizons)
- **Body:** Clean, readable (like clear water)
- **Accents:** Slightly condensed (efficient like traditional navigation)

### Spacing
- Use generous whitespace (representing open ocean and sky)
- Comfortable line height (1.6-1.8 for body text)
- Section spacing: 3rem minimum (breathing room)

---

## Pattern Implementation Guidelines

### Intensity Levels
1. **Subtle (5-10% opacity):** Background textures
2. **Light (15-25% opacity):** Card backgrounds, hover states
3. **Medium (30-50% opacity):** Dividers, borders
4. **Strong (70-90% opacity):** Feature accents, brand elements

### Where to Use Patterns

#### Headers & Navigation
- **Wave Pattern** at 20% opacity in navigation bar
- Accent line using **Namele Pattern** below headers
- Background: `pacific-blue-deep` with subtle **Volcanic Stone** texture

#### Cards & Containers
- Border using **Kastom Mat Pattern** at 30% opacity
- Corner accents with **Nakamal Circle**
- Background: `cloud-white` with 5% **Reef Pattern**

#### Buttons & Interactive Elements
- Primary: `pacific-blue` with **Wave Pattern** on hover
- Secondary: Border with **Namele Pattern**
- Loading states: **Nakamal Circle** animation

#### Dividers & Separators
- **Kastom Mat** diagonal pattern at 40% opacity
- Alternately: **Namele** chevron sequence
- Color: `pandanus-tan` or `mist-gray`

#### Backgrounds
- Hero sections: `volcanic-black` with **Volcanic Stone** at 8%
- Content sections: Alternating `cloud-white` and `sand-beige` with 5% **Kastom Mat**
- Footers: `earth-brown` with **Wave Pattern** at 15%

---

## Accessibility Requirements

### Contrast Ratios (WCAG AAA)
- Body text: 7:1 minimum
- Large text (18pt+): 4.5:1 minimum
- Interactive elements: 4.5:1 minimum

### Pattern Usage for Accessibility
- Patterns are decorative only (not relied upon for information)
- Text always on solid backgrounds with sufficient contrast
- Pattern opacity reduced on focus states
- High contrast mode: patterns removed, colors adjusted

### Mobile-First Considerations
- Patterns scale proportionally on small screens
- Reduce pattern density on mobile (50% of desktop)
- Touch targets: minimum 44x44px
- Simplified patterns for low-bandwidth connections

---

## Performance Guidelines

### SVG Patterns
- Inline SVG for critical patterns (first paint)
- Lazy load decorative patterns below fold
- Use CSS patterns where possible (better performance)
- Maximum pattern size: 200x200px repeated

### Bandwidth Optimization
- Pattern files: <5KB each
- Use CSS gradients for simple patterns
- Progressive enhancement: basic colors first, patterns layer
- Offline mode: cached pattern library

---

## Implementation Strategy

### Phase 1: Foundation
1. Update Tailwind config with Pacific color palette
2. Create CSS pattern utility classes
3. Test contrast and accessibility

### Phase 2: Components
1. Apply patterns to atomic components (buttons, cards)
2. Update container and layout components
3. Implement page-level patterns

### Phase 3: Refinement
1. User testing with local Vanuatu community
2. Performance optimization
3. A/B testing pattern intensity

---

## Cultural Respect & Authentication

### Dos
✓ Use geometric abstractions of traditional patterns
✓ Credit cultural inspiration in documentation
✓ Consult with local artists and cultural experts
✓ Support local artisans through partnerships

### Don'ts
✗ Copy sacred patterns without permission
✗ Use patterns in disrespectful contexts
✗ Claim authenticity without community validation
✗ Appropriate patterns from other Pacific cultures without research

---

## Seasonal & Event Variations

The design system can adapt for cultural events:

### Kastom Season (July-September)
- Increase earth tone prominence
- Use **Namele** pattern more frequently
- Accent color: `bamboo-green`

### Tourism High Season (June-August)
- Bright, welcoming palette
- Prominent **Wave** and **Reef** patterns
- Accent color: `pacific-turquoise`

### Festival Times
- Vibrant **Coral** and **Sunset** accents
- Animated **Nakamal Circle** patterns
- Celebratory messaging themes

---

This design system balances cultural authenticity with modern UX principles, creating a unique digital experience that honors Vanuatu's heritage while serving global tourists effectively.
