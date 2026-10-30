# Frappe Cloud Marketplace listing draft

Use this copy when completing the Calculator listing. The Marketplace form and release submission are managed in the Frappe Cloud dashboard.

## Listing fields

- **App name:** `calculator_app` (confirm it is available in the Marketplace before creating the listing)
- **Title:** Desk Calculator
- **Category:** Productivity
- **Summary (56 characters):** Open a draggable calculator from every Frappe Desk page.
- **Long description:**

  Keep a calculator close while working in Frappe Desk. Open the floating calculator from any Desk page, then drag its icon out of the way when it covers something you need.

  Use the standard keypad or enter an expression with parentheses, percentages, powers, square roots, trigonometric functions, logarithms, and the constants pi and e. Choose degrees or radians for trigonometric calculations. Keyboard input, backspace, clear-entry, and clear-all are supported.

  Expressions are evaluated in your browser. The app does not send calculations to an external service. The floating icon position is saved in browser local storage.

- **Contact:** amalageorge.work@gmail.com
- **License:** MIT
- **Supported version:** Frappe Framework 16; ERPNext 16 when installed
- **Logo file:** `docs/marketplace/calculator-logo.jpg` (512 × 512; calculator icon, no text)
- **Screenshot:** `docs/marketplace/screenshots/calculator.jpg` (900 × 720; rendered from the current calculator view).
- **Demo video:** record a short walkthrough for the review team.

## Required listing links

The Marketplace listing requires Website, Support, Documentation, Terms of Service, and Privacy Policy URLs. Use these links for the `FaircodeNext/calculator_app` repository:

- **Website:** `https://github.com/FaircodeNext/calculator_app`
- **Support:** `https://github.com/FaircodeNext/calculator_app/issues`
- **Documentation:** `https://github.com/FaircodeNext/calculator_app`
- **Terms of Service:** `https://github.com/FaircodeNext/calculator_app/blob/version-16/docs/marketplace/terms-of-service.md`
- **Privacy Policy:** `https://github.com/FaircodeNext/calculator_app/blob/version-16/docs/marketplace/privacy-policy.md`

These links become usable only after the repository is public. This checkout currently has no Git remote configured.

## Submission checklist

- [x] MIT license and publisher contact are present.
- [x] Listing copy and a square calculator logo are prepared.
- [x] CI runs calculator tests, the frontend build, and pre-commit linters.
- [ ] Confirm `calculator_app` is unique on the Marketplace.
- [ ] Publish this app in a public GitHub repository owned by the publisher.
- [ ] Verify that each listing URL is public and opens the intended page.
- [ ] Upload the screenshot and record a short demo video for the review team.
- [ ] Become a Frappe Cloud Marketplace publisher, add the repository and branch, complete the listing, submit a release, and request review.
