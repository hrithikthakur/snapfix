# Onboarding Style Guide

This guide explains the structure and styling of the onboarding flow in `index.html`.

## HTML Structure

```html
<div id="onboarding">
  <div class="step-indicator">...</div>
  <section class="onboarding-step">...</section>
  <section class="onboarding-step">...</section>
</div>
```

## CSS Classes & What They Control

### 1. Main Container: `#onboarding`
**Location:** Lines 56-67
**Controls:**
- Overall container width, padding, and visibility
- `max-width: 720px` - Maximum width of onboarding
- `padding: clamp(16px, 2vh, 24px)` - Vertical padding (responsive)
- `height: 100vh` - Full viewport height
- `display: none` by default, `display: flex` when `.active`

**To change:**
- Overall width: Change `max-width: 720px`
- Padding: Adjust `padding` values
- Background: Add `background` property

---

### 2. Step Indicator: `.step-indicator`
**Location:** Lines 77-86
**Controls:**
- Progress dots at the top showing current step
- Horizontal line connecting dots
- Spacing between dots

**Key Properties:**
- `gap: 12px` - Space between dots
- `margin-bottom: clamp(12px, 2vh, 20px)` - Space below indicator
- `padding: 8px 0` - Vertical padding

**To change:**
- Dot spacing: Modify `gap`
- Indicator height: Change `padding` or `margin-bottom`

---

### 3. Step Dots: `.step-dot`
**Location:** Lines 105-131
**Controls:**
- Individual progress dots
- States: inactive, active, completed

**Key Properties:**
- `.step-dot` - Default inactive state (14px circle, white/transparent)
- `.step-dot.active` - Current step (48px wide pill, blue gradient)
- `.step-dot.completed` - Completed steps (green gradient)

**To change:**
- Dot size: Modify `width` and `height` in `.step-dot`
- Active dot width: Change `width: 48px` in `.step-dot.active`
- Colors: Adjust `background` gradients

---

### 4. Step Container: `.onboarding-step`
**Location:** Lines 133-145
**Controls:**
- Individual step/screen container
- Layout and animation

**Key Properties:**
- `display: none` by default
- `display: flex` when `.active`
- `gap: 12px` - Space between content and buttons
- `justify-content: space-between` - Pushes content and buttons apart

**To change:**
- Step spacing: Modify `gap`
- Animation: Edit `@keyframes slideInScale`

---

### 5. Content Area: `.onboarding-content`
**Location:** Lines 158-171
**Controls:**
- Main content area for each step
- Centering and layout

**Key Properties:**
- `max-width: 600px` - Content max width
- `gap: 12px` - Space between content elements
- `justify-content: center` - Vertically centers content
- `text-align: center` - Centers text

**To change:**
- Content width: Adjust `max-width`
- Element spacing: Change `gap`
- Alignment: Modify `justify-content` or `text-align`

---

### 6. Logo: `.logo-glow`
**Location:** Lines 242-248
**Controls:**
- Main logo/icon (⚡ emoji)
- Size and animation

**Key Properties:**
- `font-size: clamp(40px, 8vw, 60px)` - Responsive size
- `margin-bottom: 8px` - Space below logo
- `animation: logoGlow` - Pulsing/glowing effect

**To change:**
- Logo size: Adjust `font-size` clamp values
- Animation: Edit `@keyframes logoGlow`
- Spacing: Modify `margin-bottom`

---

### 7. Hero Title: `.hero-title`
**Location:** Lines 261-277
**Controls:**
- Main page title (e.g., "Welcome to SnapFix")
- Large gradient text

**Key Properties:**
- `font-size: clamp(28px, 4vw, 40px)` - Responsive size
- `margin: 0 0 12px 0` - Space below title
- `background: linear-gradient(...)` - Gradient text effect
- `-webkit-background-clip: text` - Makes gradient apply to text

**To change:**
- Title size: Adjust `font-size` clamp
- Colors: Modify gradient in `background`
- Spacing: Change `margin-bottom`

---

### 8. Hero Subtitle: `.hero-subtitle`
**Location:** Lines 279-285
**Controls:**
- Subtitle text below main title
- Smaller, lighter text

**Key Properties:**
- `font-size: clamp(15px, 2.5vw, 18px)` - Responsive size
- `color: rgba(255, 255, 255, 0.65)` - Light white color
- `margin: 0 0 16px 0` - Space below subtitle

**To change:**
- Size: Adjust `font-size`
- Color: Change `color` value
- Spacing: Modify `margin-bottom`

---

### 9. Keyboard Shortcut: `.keyboard-shortcut`
**Location:** Lines 450-461
**Controls:**
- Visual display of keyboard shortcut (⌥ + Space)
- Glassmorphic card style

**Key Properties:**
- `padding: 16px 20px` - Internal spacing
- `margin: 12px 0` - External spacing
- `border-radius: 16px` - Rounded corners
- `background: rgba(255, 255, 255, 0.05)` - Semi-transparent background
- `backdrop-filter: blur(20px)` - Blur effect

**To change:**
- Size: Adjust `padding`
- Spacing: Modify `margin`
- Style: Change `background`, `border-radius`, or `backdrop-filter`

---

### 10. Keyboard Keys: `.keyboard-shortcut kbd`
**Location:** Lines 464-478
**Controls:**
- Individual key buttons (⌥, Space)
- 3D button appearance

**Key Properties:**
- `padding: 14px 20px` - Button size
- `border-radius: 12px` - Rounded corners
- `background: rgba(255, 255, 255, 0.1)` - Button background
- `box-shadow` - 3D effect

**To change:**
- Button size: Adjust `padding`
- Style: Modify `background`, `border-radius`, or `box-shadow`

---

### 11. Info Box: `.onboarding-info`
**Location:** Lines 203-213
**Controls:**
- Box containing instructions/steps (numbered list)
- Glassmorphic card

**Key Properties:**
- `padding: 20px 24px` - Internal spacing
- `margin: 12px 0` - External spacing
- `border-radius: 16px` - Rounded corners
- `background: rgba(255, 255, 255, 0.05)` - Semi-transparent
- `max-width: 500px` - Maximum width

**To change:**
- Size: Adjust `padding` or `max-width`
- Spacing: Modify `margin`
- Style: Change `background`, `border-radius`

---

### 12. Step Title: `.step-title`
**Location:** Lines 173-183
**Controls:**
- Page titles (e.g., "Enable permissions")
- Used on step 2

**Key Properties:**
- `font-size: clamp(24px, 4vw, 32px)` - Responsive size
- `margin: 0 0 16px 0` - Space below
- Gradient text effect

**To change:**
- Size: Adjust `font-size`
- Spacing: Modify `margin-bottom`

---

### 13. Step Description: `.step-description`
**Location:** Lines 185-190
**Controls:**
- Descriptive text below step title
- Body text style

**Key Properties:**
- `font-size: clamp(15px, 2.5vw, 17px)` - Responsive size
- `color: rgba(255, 255, 255, 0.7)` - Light white
- `margin: 0 0 16px 0` - Space below

**To change:**
- Size/color: Adjust `font-size` or `color`
- Spacing: Modify `margin-bottom`

---

### 14. Permissions Visual: `.permissions-visual`
**Location:** Lines 797-808
**Controls:**
- Settings icon and path display
- Visual guide for permissions

**Key Properties:**
- `padding: 20px` - Internal spacing
- `margin: 16px 0` - External spacing
- `border-radius: 16px` - Rounded corners

**To change:**
- Size: Adjust `padding` or `margin`
- Style: Modify `border-radius` or `background`

---

### 15. Settings Icon: `.settings-icon`
**Location:** Lines 810-815
**Controls:**
- Gear icon (⚙️) size and animation

**Key Properties:**
- `font-size: 48px` - Icon size
- `margin-bottom: 12px` - Space below
- `animation: rotate` - Rotating animation

**To change:**
- Size: Adjust `font-size`
- Animation: Edit `@keyframes rotate`

---

### 16. Action Buttons: `.onboarding-actions`
**Location:** Lines 495-508
**Controls:**
- Container for navigation buttons
- Bottom of each step

**Key Properties:**
- `gap: 14px` - Space between buttons
- `margin-top: auto` - Pushes to bottom
- `max-width: 600px` - Button container width

**To change:**
- Button spacing: Modify `gap`
- Width: Adjust `max-width`

---

### 17. Primary Button: `.onboarding-button.primary`
**Location:** Lines 522-540
**Controls:**
- Main action button (Continue, Complete Setup)
- Blue gradient style

**Key Properties:**
- `padding: 12px 22px` - Button size
- `background: linear-gradient(135deg, #007aff 0%, #5856d6 100%)` - Blue gradient
- `border-radius: 12px` - Rounded corners

**To change:**
- Size: Adjust `padding`
- Colors: Modify gradient in `background`
- Style: Change `border-radius`

---

### 18. Secondary Button: `.onboarding-button.secondary`
**Location:** Lines 555-565
**Controls:**
- Secondary button (Previous)
- Outlined/ghost style

**Key Properties:**
- `background: rgba(255, 255, 255, 0.08)` - Semi-transparent
- `border: 1px solid rgba(255, 255, 255, 0.15)` - Border

**To change:**
- Style: Modify `background` or `border`

---

## Quick Reference: Common Changes

### Change Overall Width
```css
#onboarding {
  max-width: 800px; /* Change from 720px */
}
```

### Reduce Spacing
```css
.onboarding-content {
  gap: 8px; /* Change from 12px */
}
```

### Change Logo Size
```css
.logo-glow {
  font-size: clamp(30px, 6vw, 50px); /* Smaller */
}
```

### Change Title Size
```css
.hero-title {
  font-size: clamp(24px, 3vw, 36px); /* Smaller */
}
```

### Change Button Colors
```css
.onboarding-button.primary {
  background: linear-gradient(135deg, #ff0000 0%, #ff6666 100%); /* Red */
}
```

### Change Background Color
```css
#onboarding {
  background: rgba(20, 20, 40, 0.95); /* Darker background */
}
```

## Responsive Breakpoints

The onboarding uses `clamp()` for responsive sizing:
- `clamp(min, preferred, max)` - Scales between min and max
- Viewport units (`vw`, `vh`) - Responsive to screen size

Example: `font-size: clamp(28px, 4vw, 40px)`
- Minimum: 28px
- Preferred: 4% of viewport width
- Maximum: 40px

## Animation Keyframes

1. **fadeInUp** - Onboarding container entrance
2. **slideInScale** - Step transitions
3. **logoGlow** - Logo pulsing effect
4. **rotate** - Settings icon rotation

Edit these in the CSS to customize animations.

