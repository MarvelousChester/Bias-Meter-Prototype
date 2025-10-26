### **Improved Prompt**

**Task:** Create a Front-End UI Component for a Next.js Application

**Core Technologies:**

- **Framework:** Next.js (App Router, using React/TSX)
- **UI Library:** Daisy UI (Must be used for all styling; avoid custom CSS files)

**Page Layout:**
The page should have a simple, modern, top-to-bottom layout, utilizing the full viewport height (`min-h-screen`). The layout consists of three distinct sections:

1.  **Header**
2.  **Main Content**
3.  **Footer**

---

### **Component Specifications**

**1. Header (`<header>`)**

- **Component:** Use the Daisy UI `navbar` component.
- **Content:** It should only contain a single title in the `navbar-start` position.
- **Title Text:** "Bias Detector"

**2. Main Content (`<main>`)**
This section must be centered vertically and horizontally, taking up the primary focus of the page (e.g., using `flex-grow`). It will contain an "Analysis Block" that manages the application's state.

- **Analysis Block:**

  - **Appearance:** A large, rounded rectangle. Use a Daisy UI `card` or a `div` with `rounded-box` and `bg-base-200`.
  - **Sizing:** It should have a significant, fixed width (e.g., `w-full max-w-4xl`) and be centered horizontally (`mx-auto`).
  - **Padding:** Apply internal padding (e.g., `p-8` or `p-12`).

- **State Management:**

  - This block must use the `useState` hook to manage one state: `isSubmitted`.
  - **Initial State (`isSubmitted === false`):** This is the default state on page load.

    - **URL Input Bar:**
      - **Component:** Daisy UI `input`.
      - **Styling:** Must be heavily rounded (`rounded-full`) and bordered (`input-bordered`).
      - **Layout:** Centered horizontally.
      - **Width:** Must occupy 60% of the Analysis Block's width (e.g., `w-3/5`).
      - **Placeholder:** "Enter URL to analyze..."
    - **Submit Button:**
      - **Component:** Daisy UI `btn` (e.g., `btn-primary`).
      - **Layout:** Centered horizontally, located directly under the URL Input Bar (add margin, e.g., `mt-4`).
      - **Text:** "Find Bias"
      - **Action:** Clicking this button should change the state (`setIsSubmitted(true)`).

  - **Results State (`isSubmitted === true`):** This state appears after the user clicks the "Find Bias" button. The URL Bar and Submit Button are no longer visible.
    - **Layout:** Display two new content blocks (sub-rectangles) side-by-side.
    - **Arrangement:** Use a `flex flex-row` container with a `gap` (e.g., `gap-4`) to separate them.
    - **Divider:** Place a Daisy UI `divider divider-horizontal` _between_ the two blocks. This will create the "border between" with a "lighter colour" as requested.
    - **Sub-Blocks (x2):**
      - **Appearance:** Each block should be a rounded rectangle (e.g., `rounded-box`), have a border (`border`), and a background (e.g., `bg-base-100`).
      - **Sizing:** Each block should take up equal space (e.g., `flex-1`).
      - **Content:** Add placeholder text to each block to show they are distinct (e.g., "Block 1: Analysis Results" and "Block 2: Source Information").

**3. Footer (`<footer>`)**

- **Component:** Use the Daisy UI `footer` component.
- **Layout:** It should be at the very bottom of the page.
- **Styling:** Use `footer-center` to center the text.
- **Content:** It should contain only the text: "Prototype"

**Deliverable:**
Provide a single, self-contained Next.js page component (e.g., `app/page.tsx`) that implements this entire design. Ensure all interactivity (the state change) is working correctly.
