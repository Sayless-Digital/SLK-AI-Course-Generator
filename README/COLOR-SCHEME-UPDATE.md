# Royal Purple Color Scheme Update

## Overview
The AiCourse application has been updated to use a royal purple color scheme throughout all global styles, replacing the previous blue-based theme.

## Color Changes

### **Primary Colors**
- **Primary**: Changed from blue (`211 100% 50%`) to **royal purple** (`270 100% 50%`)
- **Background**: Changed from light blue-gray to **very light purple** (`270 20% 99%`)
- **Foreground**: Updated to dark purple (`270 50% 8%`)

### **Light Theme Colors**
```css
:root {
  --background: 270 20% 99%;        /* Very light purple (almost white) */
  --foreground: 270 50% 8%;         /* Dark purple text */
  --primary: 270 100% 50%;          /* Royal purple */
  --card: 270 15% 99.5%;            /* Very light purple cards */
  --border: 270 15% 92%;            /* Light purple borders */
  --ring: 270 100% 50%;             /* Royal purple focus rings */
}
```

### **Dark Theme Colors**
```css
.dark {
  --background: 270 50% 8%;         /* Dark purple background */
  --foreground: 270 20% 99%;        /* Very light purple text */
  --primary: 270 100% 50%;          /* Royal purple (same as light) */
  --card: 270 45% 10%;              /* Dark purple cards */
  --border: 270 40% 15%;            /* Dark purple borders */
  --ring: 270 100% 50%;             /* Royal purple focus rings */
}
```

### **Sidebar Colors**
- **Background**: Light purple (`270 15% 99%`)
- **Foreground**: Dark purple (`270 30% 25%`)
- **Primary**: Royal purple (`270 100% 50%`)
- **Borders**: Light purple (`270 15% 92%`)

### **TipTap Editor Colors**
- **Overlay**: Very light purple (`rgba(253, 252, 254, 0.75)`)
- **Code Background**: Purple tint (`#8b5cf61f`)
- **Pre Background**: Light purple (`#f8f7ff`)
- **Borders**: Light purple (`#e9e5ff`)
- **Accent Colors**: Updated to use royal purple (`#8b5cf6`)

## Visual Impact

### **Light Mode**
- **Backgrounds**: Very light purple (almost white) for clean, elegant appearance
- **Text**: Dark purple for excellent readability
- **Accents**: Royal purple for buttons, links, and interactive elements
- **Borders**: Subtle light purple for definition

### **Dark Mode**
- **Backgrounds**: Rich dark purple for sophisticated appearance
- **Text**: Very light purple for contrast
- **Accents**: Royal purple for consistency
- **Cards**: Dark purple with subtle variations

## Benefits

1. **Elegant Appearance**: Royal purple conveys sophistication and creativity
2. **Excellent Contrast**: Maintains accessibility standards
3. **Consistent Branding**: Unified color scheme across all components
4. **Modern Design**: Contemporary purple theme
5. **Professional Look**: Suitable for educational/course platform

## Files Updated

- `src/index.css` - Main color variables
- `src/minimal-tiptap/styles/index.css` - Editor color scheme
- All components automatically inherit the new colors through CSS custom properties

## Color Palette Summary

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | Very Light Purple | Dark Purple |
| Text | Dark Purple | Very Light Purple |
| Primary | Royal Purple | Royal Purple |
| Borders | Light Purple | Dark Purple |
| Cards | Very Light Purple | Dark Purple |

The new color scheme provides a cohesive, elegant, and professional appearance while maintaining excellent usability and accessibility. 