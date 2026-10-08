"use client";

import Link from "next/link";
import { Menu, Scale, X } from "lucide-react";
import { useState } from "react";
import { WalletControl } from "@/components/wallet-control";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/explorer", label: "Court" },
  { href: "/docs", label: "Docs" },
  { href: "/#security", label: "Security" }
];

export function Navigation() {
  const [mobile, setMobile] = useState(false);

  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/" aria-label="SourceJury home">
          <span className="brand-mark"><Scale size={20} /></span>
          <span>
            <strong>SourceJury</strong>
            <small>Evidence court</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>

        <div className="nav-actions">
          <WalletControl />
          <button
            className="mobile-menu-button"
            onClick={() => setMobile((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={mobile}
          >
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobile && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobile(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
