"use client";

import { useState, type ReactNode } from "react";

export function NavigationToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="site-menu-toggle" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((current) => !current)}>
      <span>{open ? "Close" : "Menu"}</span><span className="site-menu-toggle__icon" aria-hidden="true">{open ? "×" : "☰"}</span>
    </button>
    <div className={open ? "site-nav-wrap site-nav-wrap--open" : "site-nav-wrap"} id="primary-navigation">{children}</div>
  </>;
}
