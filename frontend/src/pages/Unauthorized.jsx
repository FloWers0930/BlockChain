// src/pages/Unauthorized.jsx
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f1ff] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-5xl mb-8">
            🚫
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            You don't have permission to view this page.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold rounded-2xl transition"
            >
              Go Back to Homepage
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition"
            >
              Go Back to Previous Page
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-8">
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
