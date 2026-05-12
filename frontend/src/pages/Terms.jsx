// src/pages/Terms.jsx
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f1ff] py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 mb-8 font-medium text-lg transition"
        >
          ← Back to Homepage
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-500 mb-10">Last updated: May 08, 2026</p>

          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
            <p className="mb-8">
              These Terms and Conditions govern your access to and use of Statio
              Nexus, including our mobile application, web platform, and related
              services. By using our services, you agree to be bound by these
              terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="mb-6">
              By accessing or using Statio Nexus, you confirm that you have
              read, understood, and agree to these Terms and Conditions, our
              Privacy Policy, and all applicable policies.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              2. Our Services
            </h2>
            <p className="mb-6">
              Statio Nexus provides a digital platform for real-time parking
              reservations, payments, and management. We act as an intermediary
              between drivers and parking operators.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              3. Data Privacy and Protection
            </h2>
            <p className="mb-6">
              We are fully committed to protecting your personal data in
              accordance with the{" "}
              <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>{" "}
              and its Implementing Rules and Regulations. Our Privacy Policy
              details how we collect, use, store, and protect your information.
              By using our services, you consent to the processing of your
              personal data as described therein.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              4. User Accounts and Responsibilities
            </h2>
            <p className="mb-6">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              5. Bookings and Payments
            </h2>
            <p className="mb-6">
              All reservations and payments are subject to availability and our
              published policies. You must review all details before confirming
              any transaction.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              6. Consumer Rights
            </h2>
            <p className="mb-6">
              We fully comply with the{" "}
              <strong>
                Consumer Act of the Philippines (Republic Act No. 7394)
              </strong>
              . You are entitled to clear information, fair treatment, and the
              right to seek redress for any issues with our services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="mb-6">
              To the fullest extent permitted by law, Statio Nexus shall not be
              liable for indirect, incidental, or consequential damages arising
              from your use of the service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              8. Governing Law
            </h2>
            <p className="mb-6">
              These Terms and Conditions are governed by the laws of the
              Republic of the Philippines. Any disputes shall be resolved
              exclusively in the courts of Metro Manila.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              9. Changes to Terms
            </h2>
            <p className="mb-6">
              We may update these Terms from time to time. Your continued use of
              Statio Nexus after such changes constitutes your acceptance of the
              revised terms.
            </p>

            <div className="mt-16 pt-8 border-t text-sm text-gray-500">
              For any questions regarding these Terms and Conditions or your
              data privacy rights, please contact us at{" "}
              <a
                href="mailto:support@stationexus.com"
                className="text-blue-600 hover:underline"
              >
                support@stationexus.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
