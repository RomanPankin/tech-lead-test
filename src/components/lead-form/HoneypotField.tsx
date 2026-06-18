/**
 * Honeypot bait field. Visually hidden and removed from the a11y tree + tab
 * order, so real users never see or fill it. Bots that auto-fill every input
 * trip the server-side check (leadRequestSchema requires it empty).
 */
export default function HoneypotField() {
  return (
    <div className="honeypot" aria-hidden="true">
      <label htmlFor="company_website">Company website</label>
      <input id="company_website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
