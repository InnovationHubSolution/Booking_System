# Background Pattern Setup

## How to Use Your Custom Background Image

### Step 1: Save the Image
1. Save your decorative pattern image to: `frontend/public/images/pattern.jpg`

### Step 2: Update CSS (Already Done)
The CSS has been updated with two options:

**Option A (Current):** Using an SVG-based decorative pattern
- Lightweight and loads instantly
- Similar style to traditional kolam/rangoli patterns

**Option B (Your Custom Image):** Use the actual image you provided
1. Save your image as `frontend/public/images/pattern.jpg`
2. Uncomment these lines in `frontend/src/index.css`:

```css
body::before {
    background-image: url('/images/pattern.jpg');
    background-size: 400px 300px;
    background-repeat: repeat;
    opacity: 0.08; /* Adjust for visibility */
}
```

### Customization Options

**Adjust Pattern Opacity:**
```css
body::before {
    opacity: 0.05; /* Lighter */
    opacity: 0.08; /* Default */
    opacity: 0.12; /* Stronger */
}
```

**Change Background Color:**
```css
body {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); /* Blue-grey */
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); /* Warm */
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); /* Purple-blue */
}
```

**Pattern Size:**
```css
body::before {
    background-size: 200px 150px; /* Smaller tiles */
    background-size: 600px 450px; /* Larger tiles */
}
```

### Current Result
✅ Subtle gradient background (blue-grey)
✅ Decorative SVG pattern overlay (8% opacity)
✅ Fixed position - pattern doesn't scroll
✅ Works on all pages

The white background has been replaced with an elegant pattern! 🎨
