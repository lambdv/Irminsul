# Theme Implementation Plan

## Assumptions

- Purple theme: dark-based with cool purple palette
- Priority: Replace hardcoded colors with CSS variables (simpler approach)
- Scope: All 7 files with hardcoded colors

## Implementation Steps

1. **Add purple theme to globals.css**
   - Add [data-theme="purple"] with purple color palette
   - Colors: deep purple background (#1a1625), vibrant purple primary (#a855f7)

2. **Add purple option to settings dropdown**
   - Update preferencesSettings.tsx to include purple option

3. **Replace hardcoded colors in components**
   - Characters page: lines 135, 138-139, 163-164
   - Danger zone settings: multiple hardcoded colors
   - API settings: #404040
   - Search palette: #a5a5a5, #787878, #b1b1b1
   - Topnav CSS: #0e0e0e
   - Calculator CSS: #1c1c1c, #161616
   - LiteGraph canvas: #1a1a1a, #333333

4. **Test all themes work correctly**
