"use client";

import type React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    // TODO: Send email to backend API
    alert(`Thank you for subscribing with ${email}!`);
    // Don't clear email immediately - wait for success
    // setEmail("");
  };

  return (
    <footer className="bg-[#E8E5DB] border-t border-[#D0CDC4]">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-12">
            {/* Left: Navigation Links */}
            <div className="flex flex-col space-y-2">
              <div className="space-y-3">
                <Link
                  to="/our-guarantee"
                  className="text-2xl md:text-4xl font-regular hover:text-[#333] block"
                >
                  Our Gaurantee
                </Link>
                <Link
                  to="/glasses"
                  className="text-2xl md:text-4xl font-regular hover:text-[#333] block"
                >
                  Glasses
                </Link>
                <Link
                  to="/about"
                  className="text-2xl md:text-4xl font-regular hover:text-[#333] block"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-2xl md:text-4xl font-regular hover:text-[#333] block"
                >
                  Contact
                </Link>
              </div>

              {/* Secondary links grid */}
              <div className="grid grid-cols-2 gap-6 md:gap-8 text-sm">
                <div className="space-y-2">
                  <Link
                    to="/exchange-policy"
                    className="text-[#1F1F1F] hover:text-[#333] block"
                  >
                    Exchange Policy
                  </Link>
                  <Link
                    to="/return-policy"
                    className="text-[#1F1F1F] hover:text-[#333] block"
                  >
                    Return Policy
                  </Link>
                </div>

                <div className="space-y-2">
                  <Link
                    to="/privacy"
                    className="text-[#1F1F1F] hover:text-[#333] block"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms"
                    className="text-[#1F1F1F] hover:text-[#333] block"
                  >
                    Terms Of Use
                  </Link>
                </div>
              </div>

            </div>



            {/* Right: Newsletter Signup */}
            <div className="flex flex-col md:items-end">
              <div className="flex flex-col items-start">
                <p className="text-sm  mb-4 text-start">
                  Sign up to the newsletter for Folks like you
                </p>

                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-nowrap items-center gap-3 w-full md:w-auto"
                >
                  <input
                    type="email"
                    placeholder="ENTER YOUR EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border-none rounded-xl px-4 py-5 placeholder-black text-sm text-black font-bold flex-1 min-w-0"
                  />
                  <button
                    type="submit"
                    className="bg-[#1F1F1F] text-white rounded-xl px-5 py-2.5 md:px-5 md:py-5 hover:bg-[#333] transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    SUBSCRIBE
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#D0CDC4] my-6 md:my-8"></div>

          {/* Bottom section: Social icons and Logo */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Icons
            <div className="flex gap-4 mb-6 md:mb-0">
              <a
                href="https://www.linkedin.com/company/multifolks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.84v8.37h2.84v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.84M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/multifolks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2m-.3 2c-2.1 0-3.8 1.7-3.8 3.8v8.4c0 2.1 1.7 3.8 3.8 3.8h8.4c2.1 0 3.8-1.7 3.8-3.8V7.8c0-2.1-1.7-3.8-3.8-3.8H7.5m9.6 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-5.1 1.3a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/multifolks"  
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/multifolks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.306l7.644-8.74L2.25 2.25h6.814l4.707 6.225 5.467-6.225zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@multifolks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
                aria-label="YouTube"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div> */}

            {/* Logo/Brand name */}
            <div className="w-full flex justify-end items-end text-2xl font-script font-semibold text-[#1F1F1F]">
              <img
                src="/Multifolks.png"
                alt="Multifolks logo"
                width="120"
                height="30"
                loading="lazy"
                className="h-8 md:h-10"
              />
            </div>

          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block md:hidden">
          {/* Main Navigation Links - Top left */}
          <div className="space-y-3 mb-8">
            <Link
              to="/our-guarantee"
              className="text-2xl font-regular hover:text-[#333] block"
            >
              Lenses
            </Link>
            <Link
              to="/glasses"
              className="text-2xl font-regular hover:text-[#333] block"
            >
              Glasses
            </Link>
            <Link
              to="/about"
              className="text-2xl font-regular hover:text-[#333] block"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-2xl font-regular hover:text-[#333] block"
            >
              Contact
            </Link>
          </div>

          {/* Secondary links - Below main links */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            {/* <div className="space-y-2">
              <Link
                to="/responsibility"
                className="text-[#1F1F1F] hover:text-[#333] block"
              >
                Responsibility
              </Link>
              <Link
                to="/faq"
                className="text-[#1F1F1F] hover:text-[#333] block"
              >
                FAQ's
              </Link>
              <Link
                to="/delivery"
                className="text-[#1F1F1F] hover:text-[#333] block"
              >
                Delivery
              </Link>
            </div> */}

            <div className="space-y-2">
              <Link
                to="/exchange-policy"
                className="text-[#1F1F1F] hover:text-[#333] block"
              >
                Exchange Policy
              </Link>
              <Link
                to="/return-policy"
                className="text-[#1F1F1F] hover:text-[#333] block"
              >
                Return Policy
              </Link>
            </div>
            <div className="space-y-2">
              <Link
                to="/privacy"
                className="text-[#1F1F1F] hover:text-[#333] block"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-[#1F1F1F] hover:text-[#333] block"
              >
                Terms of Use
              </Link>
            </div>
          </div>

          {/* Social Icons - Below secondary links */}
          {/* <div className="flex gap-4 mb-8">
            <a
              href="https://www.linkedin.com/company/multifolks"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.84v8.37h2.84v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.84M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/multifolks"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2m-.3 2c-2.1 0-3.8 1.7-3.8 3.8v8.4c0 2.1 1.7 3.8 3.8 3.8h8.4c2.1 0 3.8-1.7 3.8-3.8V7.8c0-2.1-1.7-3.8-3.8-3.8H7.5m9.6 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-5.1 1.3a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/multifolks"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/multifolks"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.306l7.644-8.74L2.25 2.25h6.814l4.707 6.225 5.467-6.225zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@multifolks"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-[#1F1F1F] hover:text-[#333]"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div> */}

          {/* Newsletter Signup - Below social icons */}
          <div className="mb-8">
            <p className="text-sm text-start text-[#666] mb-4 text-center">
              Sign up to the newsletter for Folks like you
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex sm:flex-row gap-3 w-full"
            >
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white border-none rounded-xl px-2 py-2 text-sm text-[#999] placeholder-[#999]"
              />

              <button
                type="submit"
                className="bg-[#1F1F1F] text-white rounded-xl px-4 py-2 font-semibold hover:bg-[#333] transition-colors whitespace-nowrap"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>


          {/* Divider */}


          {/* Logo - Bottom left with larger size */}
          {/* <div className="max-w-4xl mx-auto">
            <div className="flex justify-end items-end font-script">
              <img
                src="/Multifolks.png"
                alt="Multifolks"
                className="h-[55px] w-[159px]"
              />
            </div>
          </div> */}

        </div>
      </div>
    </footer>
  );
};
