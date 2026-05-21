// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 py-12 border-t-2 border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <img
                src="/assets/star-removebg-preview.jpg"
                alt="Statio Nexus"
                className="w-9 h-9 object-contain transition-transform group-hover:rotate-12"
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                Statio Nexus
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-gray-500">
              Smart parking for Crossroad Tandang Sora.
              <br />
              Making urban mobility smoother in Metro Manila.
            </p>
          </div>

          {/* Company (NEW – not in navbar) */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-base">
              Company
            </h4>
            <div className="space-y-3 text-sm">
              <Link
                to="/careers"
                className="hover:text-[#4f46e5] transition block"
              >
                Careers
              </Link>
              <Link
                to="/contact"
                className="hover:text-[#4f46e5] transition block"
              >
                Contact Us
              </Link>
              <Link
                to="/blog"
                className="hover:text-[#4f46e5] transition block"
              >
                Blog
              </Link>
            </div>
          </div>

          {/* Product (NEW – not in navbar) */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-base">
              Product
            </h4>
            <div className="space-y-3 text-sm">
              <Link
                to="/download"
                className="hover:text-[#4f46e5] transition block"
              >
                Download App
              </Link>
              <Link
                to="/stations"
                className="hover:text-[#4f46e5] transition block"
              >
                Live Stations
              </Link>
              <Link
                to="/help"
                className="hover:text-[#4f46e5] transition block"
              >
                Help Center
              </Link>
            </div>
          </div>

          {/* Legal (NEW – not in navbar) */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-base">
              Legal
            </h4>
            <div className="space-y-3 text-sm">
              <Link
                to="/privacy"
                className="hover:text-[#4f46e5] transition block"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-[#4f46e5] transition block"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookie-policy"
                className="hover:text-[#4f46e5] transition block"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>© 2026 Statio Nexus. All rights reserved.</p>
          <p className="mt-2 md:mt-0 flex gap-4">
            <Link to="/social" className="hover:text-[#4f46e5]">
              Social
            </Link>
            <Link to="/press" className="hover:text-[#4f46e5]">
              Press
            </Link>
            <Link to="/sitemap" className="hover:text-[#4f46e5]">
              Sitemap
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
