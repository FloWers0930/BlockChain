// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#f8f1ff] text-gray-600 py-12 border-t border-gray-200">
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
            <p className="text-sm leading-relaxed max-w-xs">
              Real-time station management platform.
              <br />
              Making urban mobility smarter in Metro Manila.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-base">
              Company
            </h4>
            <div className="space-y-3 text-sm">
              <Link
                to="/about"
                className="hover:text-[#4f46e5] transition block"
              >
                About Us
              </Link>
              <Link to="#" className="hover:text-[#4f46e5] transition block">
                Careers
              </Link>
              <Link
                to="/contact"
                className="hover:text-[#4f46e5] transition block"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-base">
              Product
            </h4>
            <div className="space-y-3 text-sm">
              <Link
                to="/how-it-works"
                className="hover:text-[#4f46e5] transition block"
              >
                How it Works
              </Link>
              <Link to="#" className="hover:text-[#4f46e5] transition block">
                Live Stations
              </Link>
              <Link
                to="/owner"
                className="hover:text-[#4f46e5] transition block"
              >
                For Station Owners
              </Link>
            </div>
          </div>

          {/* Legal */}
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
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2026 Statio Nexus. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Built with ❤️ for smarter urban mobility
          </p>
        </div>
      </div>
    </footer>
  );
}
