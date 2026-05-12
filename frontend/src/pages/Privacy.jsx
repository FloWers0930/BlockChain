// src/pages/Privacy.jsx
import { useNavigate } from "react-router-dom";

export default function Privacy() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-10">Last updated: May 08, 2026</p>

          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
            <p className="mb-8">
              At <strong>Statio Nexus</strong>, we respect your privacy and are
              fully committed to protecting your personal data in accordance
              with the
              <strong>
                {" "}
                Data Privacy Act of 2012 (Republic Act No. 10173)
              </strong>{" "}
              and its Implementing Rules and Regulations.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-6">
              We collect personal information such as your name, email address,
              phone number, vehicle details, payment information, and location
              data when you create an account, make a reservation, or use our
              services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              2. Purpose of Collection and Legal Basis
            </h2>
            <p className="mb-6">
              We process your personal data based on the following legal bases
              under the Data Privacy Act:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Contract</strong> – to provide you with parking
                reservation and payment services
              </li>
              <li>
                <strong>Consent</strong> – for marketing communications and
                optional features
              </li>
              <li>
                <strong>Legitimate Interest</strong> – to improve our platform
                and ensure security
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              3. Your Rights as a Data Subject
            </h2>
            <p className="mb-6">
              Under the Data Privacy Act, you have the following rights:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Right to be informed</li>
              <li>Right to access your personal data</li>
              <li>Right to correct or rectify inaccurate data</li>
              <li>Right to object to processing</li>
              <li>Right to erasure or blocking of data</li>
              <li>Right to data portability</li>
              <li>
                Right to file a complaint with the National Privacy Commission
                (NPC)
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="mb-6">
              We may share your information with trusted third parties such as
              payment processors and parking operators only as necessary to
              deliver our services. We do not sell your personal data to third
              parties.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              5. Data Security
            </h2>
            <p className="mb-6">
              We implement reasonable and appropriate organizational, technical,
              and physical security measures to protect your personal data
              against unauthorized access, alteration, disclosure, or
              destruction.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              6. Data Retention
            </h2>
            <p className="mb-6">
              We retain your personal data only for as long as necessary to
              fulfill the purposes for which it was collected or as required by
              law.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
              7. How to Exercise Your Rights
            </h2>
            <p className="mb-6">
              To exercise any of your rights under the Data Privacy Act, please
              contact us at{" "}
              <a
                href="mailto:support@stationexus.com"
                className="text-blue-600 hover:underline"
              >
                support@stationexus.com
              </a>
              .
            </p>

            <div className="mt-16 pt-8 border-t text-sm text-gray-500">
              This Privacy Policy is governed by Philippine law. For any
              questions or concerns, please contact our Data Protection Officer
              at the email address above.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
