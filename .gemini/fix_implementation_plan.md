# Systematic Error Fixes - Implementation Plan

## Completed Fixes
1. ✅ Reduced font-weight from `font-bold` to `font-semibold` in HeroSection.tsx

## Remaining Fixes (In Priority Order)

### High Priority - Functionality Issues

#### 1. Filter Buttons Not Working
**Files to check:**
- `pages/MenCollection.tsx`
- `pages/WomenCollection.tsx`
- Components: ShapeFilter, Material filters, Collections, Comfort

**Action:** Verify `toggleFilterOption` function is working correctly

#### 2. Clear Button Not Displayed
**Location:** Filter sections
**Fix:** Add clear/reset button when filters are active

#### 3. Navigation Buttons ("Shop For", "Start", "Brand", "Style")
**Fix:** Ensure all navigation buttons have proper click handlers

### Medium Priority - Styling Issues

#### 4. Text Styling
- "SPECS FROM THE SPECIALISTS" - adjust bold and box sizing
- "Our Frames" - reduce bold weight
- "TOTALLY RISK-FREE" - verify styling

#### 5. Box Sizing and Borders
- Add border lines to boxes
- Align frames text to left
- Fix paragraph colors

#### 6. Button Colors
- "Explore Frames" / "Collector" button - fix green color on click

### Low Priority - Image Issues

#### 7. Hero Section Images
- Adjust positioning for blue, dark red, and dark pink backgrounds
- Fix image alignment issues

#### 8. Wrong Images
- "SEARCH MULTIFOLKS" - replace incorrect image
- "WHY CHOOSE" / "Explore Our Collection" - fix image source

### Component-Specific Fixes

#### 9. GET MY FIT Modal
- Fix heading styling
- Ensure "Start" button displays properly

#### 10. Collections & Comfort Sections
- Remove extra checkboxes (2 from Collections, 3 from Comfort)
- Fix button responsiveness

## Implementation Order
1. Filter functionality (buttons working)
2. Clear button implementation
3. Text styling adjustments
4. Box sizing and borders
5. Button color fixes
6. Image replacements
7. Modal fixes
8. Checkbox removals
