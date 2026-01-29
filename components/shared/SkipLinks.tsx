/**
 * SkipLinks Component
 *
 * Provides skip navigation links for keyboard users to quickly jump to main content areas.
 * These links are visually hidden but become visible when focused.
 *
 * Validates Requirements:
 * - 15.2: Provide keyboard navigation for all interactive elements
 * - 15.6: Provide skip navigation links to main content areas
 */

"use client";

import React from "react";

export interface SkipLink {
  /**
   * ID of the target element to skip to
   */
  targetId: string;

  /**
   * Label for the skip link
   */
  label: string;
}

export interface SkipLinksProps {
  /**
   * Array of skip links to render
   */
  links: SkipLink[];

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SkipLinks Component
 *
 * Renders a list of skip navigation links that are hidden until focused.
 * Allows keyboard users to bypass repetitive navigation and jump directly to main content.
 */
export function SkipLinks({ links, className = "" }: SkipLinksProps) {
  const handleSkipClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();

    const target = document.getElementById(targetId);
    if (target) {
      // Set tabindex to make the target focusable if it isn't already
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }

      // Focus the target element
      target.focus();

      // Scroll to the target (with fallback for test environments)
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Remove tabindex after focus if we added it
      if (target.getAttribute("tabindex") === "-1") {
        target.addEventListener(
          "blur",
          () => {
            target.removeAttribute("tabindex");
          },
          { once: true },
        );
      }
    }
  };

  return (
    <nav
      className={`skip-links ${className}`}
      aria-label="Skip navigation links"
    >
      {links.map((link) => (
        <a
          key={link.targetId}
          href={`#${link.targetId}`}
          onClick={(e) => handleSkipClick(e, link.targetId)}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export default SkipLinks;
