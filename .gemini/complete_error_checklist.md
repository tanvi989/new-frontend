# Complete Error Fix Checklist

## Error List from Image (22 Total Errors)

### 1. ❌ Blue Background - Image Positioning
**Issue:** Person's top and bottom incorrect; photo shifted left
**File:** `components/HeroSection.tsx`
**Lines:** 50-72 (decorative images)
**Fix:** Adjust `top`, `bottom`, `left`, `right` CSS values for `/q.png`

### 2. ❌ Dark Red Background - Image Positioning  
**Issue:** Person shifted left and upward
**File:** `components/HeroSection.tsx`
**Lines:** 50-72
**Fix:** Adjust positioning for `/q2.png`

### 3. ❌ Dark Pink Background - Image Positioning
**Issue:** Person shifted right and partially downward
**File:** `components/HeroSection.tsx`
**Lines:** 50-72
**Fix:** Adjust positioning for `/q3.png` and `/q4.png`

### 4. ✅ WELCOME TO MULTIFOLKS Text
**Status:** KEEP THIS TEXT (misunderstanding in error list)
**File:** `components/HeroSection.tsx`
**Line:** 17

### 5. ❌ Upward Arrow Symbol
**Issue:** Remove ↑ symbol
**File:** `components/FeaturesSection.tsx` or similar
**Fix:** Search for arrow character and remove

### 6. ✅ Bold Text Size
**Status:** FIXED - Changed to font-semibold
**File:** `components/HeroSection.tsx`
**Lines:** 16, 20

### 7. ❌ SPECS FROM THE SPECIALISTS
**Issue:** Should be bold, decrease box size
**File:** `components/FeaturesSection.tsx`
**Lines:** 10-13
**Fix:** Already bold, adjust padding in grid items (lines 17-46)

### 8. ❌ "Our Frames" Text
**Issue:** Too bold, shift to top
**File:** Product/Frames section component
**Fix:** Reduce font-weight, adjust margin-top

### 9. ❌ Border Lines and Text Alignment
**Issue:** Add borders, align frames text left, fix paragraph colors
**File:** Multiple components
**Fix:** Add border classes, text-left, update text colors

### 10. ❌ "Explore Frames" Button Color
**Issue:** Green on click, should match design
**File:** Frame collection component
**Fix:** Change active/click state color

### 11. ❌ Clear Button Missing
**Issue:** Not displayed after filter selection
**File:** `pages/MenCollection.tsx`, `pages/WomenCollection.tsx`
**Fix:** Add clear button with reset functionality

### 12. ❌ "Shop For" Page Buttons
**Issue:** Buttons inside page not working
**File:** `components/GenderFilter.tsx` or navigation
**Fix:** Verify onClick handlers

### 13. ❌ Shape Section Buttons
**Issue:** Buttons not working
**File:** `components/ShapeFilter.tsx`, `pages/MenCollection.tsx` (line 288-293)
**Fix:** Verify toggleFilterOption function

### 14. ❌ Frame Colors Sorting
**Issue:** Unresponsive, should sort alphabetically with checkboxes
**File:** `pages/MenCollection.tsx` (line 294-302)
**Fix:** Sort FRAME_COLORS array, ensure onChange works

### 15. ❌ Material Buttons
**Issue:** Not working
**File:** Material filter section in Collection pages
**Fix:** Verify toggleFilterOption for Material category

### 16. ❌ Collections Checkboxes
**Issue:** Buttons unresponsive, remove 2 checkboxes
**File:** Collections filter section
**Fix:** Remove 2 items from COLLECTIONS array, fix onChange

### 17. ❌ Comfort Checkboxes
**Issue:** Buttons unresponsive, remove 3 checkboxes
**File:** Comfort filter section
**Fix:** Remove 3 items from COMFORT array, fix onChange

### 18. ❌ GET MY FIT Heading
**Issue:** Not styled correctly
**File:** `components/GetMyFitModal.tsx`
**Fix:** Update heading className

### 19. ❌ Start Button Display
**Issue:** Not displayed properly
**File:** Modal or form component
**Fix:** Check button visibility and styling

### 20. ❌ Brand and Style Buttons
**Issue:** Not displayed properly
**File:** Filter or navigation component
**Fix:** Check button display properties

### 21. ❌ SEARCH MULTIFOLKS Image
**Issue:** Wrong image inside
**File:** Search component
**Fix:** Update image src path

### 22. ❌ WHY CHOOSE - Explore Our Collection
**Issue:** Wrong image displayed
**File:** Collection/Why Choose section
**Fix:** Update image src path

## Priority Implementation Order

### Phase 1: Critical Functionality (Errors 11-17)
- Add clear button
- Fix all filter button handlers
- Remove extra checkboxes

### Phase 2: Styling (Errors 5-10)
- Remove arrow symbol
- Adjust box sizing
- Fix text alignment and colors
- Update button colors

### Phase 3: Images (Errors 1-3, 21-22)
- Adjust Hero Section image positions
- Replace incorrect images

### Phase 4: Modal & Buttons (Errors 18-20)
- Fix GET MY FIT modal styling
- Fix button displays

## Files Requiring Changes

1. `components/HeroSection.tsx` - Image positioning
2. `components/FeaturesSection.tsx` - Text styling, box sizing
3. `components/GetMyFitModal.tsx` - Heading styling
4. `components/ShapeFilter.tsx` - Verify functionality
5. `pages/MenCollection.tsx` - Filters, clear button
6. `pages/WomenCollection.tsx` - Filters, clear button
7. Search component (TBD) - Image replacement
8. Why Choose section (TBD) - Image replacement
