import { useEffect, useRef } from "react";

export function Dialog({ title, onClose, children, footer = null, className = "" }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])") ?? [])];
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previousFocus?.focus?.(); };
  }, []);
  return (
    <div className="dialog_backdrop" role="presentation" onClick={onClose}>
      <section ref={dialogRef} className={`dialog ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby="dialog_title" onClick={(event) => event.stopPropagation()}>
        <header className="dialog_header">
          <h2 id="dialog_title">{title}</h2>
          <button className="dialog_close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        </header>
        <div className="dialog_body">{children}</div>
        {footer && <footer className="dialog_footer">{footer}</footer>}
      </section>
    </div>
  );
}
