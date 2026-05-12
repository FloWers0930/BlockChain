// src/pages/HowItWorks.jsx
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f1ff]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 mb-12 font-medium text-lg transition"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            How Park&amp;Go Works
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Seamless for drivers. Powerful for parking owners and admins.
          </p>
        </div>

        {/* Step 1 - Drivers on Mobile */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <div className="inline-flex w-12 h-12 bg-blue-600 text-white rounded-3xl items-center justify-center text-4xl font-bold mb-6">
              1
            </div>
            <h3 className="text-4xl font-semibold mb-6">
              Drivers Book Instantly on Mobile
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              A driver opens the Park&amp;Go mobile app, searches for parking
              near their destination, sees real-time availability, chooses a
              spot, and reserves it in seconds with secure payment.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://content.presspage.com/uploads/685/c1920_femaleusingmobiledevice-774181.jpg?45004"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Step 2 - Owner Web Dashboard */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 md:order-1 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://picsum.photos/id/201/800/600"
              alt="Owner managing parking dashboard on computer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-flex w-12 h-12 bg-blue-600 text-white rounded-3xl items-center justify-center text-4xl font-bold mb-6">
              2
            </div>
            <h3 className="text-4xl font-semibold mb-6">
              You Manage Everything from the Web
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              As an owner or admin, you log into this web dashboard to monitor
              all your parking locations in real-time, view live occupancy,
              incoming reservations, revenue, and manage your spots and pricing
              from one place.
            </p>
          </div>
        </div>

        {/* Step 3 - Payments & Revenue */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex w-12 h-12 bg-blue-600 text-white rounded-3xl items-center justify-center text-4xl font-bold mb-6">
              3
            </div>
            <h3 className="text-4xl font-semibold mb-6">
              Automatic Payments &amp; Revenue
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              When a driver parks, the system automatically confirms the session
              and processes payment securely. Revenue flows directly to you with
              full transparency and detailed reports in your dashboard.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://payabl-media.s3.eu-central-1.amazonaws.com/02_img_1_96e69db428.png"
              alt="Secure payment and revenue for parking"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Final Message */}
        <div className="mt-24 bg-white rounded-3xl p-12 text-center shadow-xl">
          <h3 className="text-3xl font-semibold mb-6">
            One System. Two Perfect Experiences.
          </h3>
          <p className="text-xl text-gray-600">
            Drivers get convenience on their phone.
            <br />
            You get complete control and reliable revenue on the web.
          </p>
        </div>
      </div>
    </div>
  );
}
