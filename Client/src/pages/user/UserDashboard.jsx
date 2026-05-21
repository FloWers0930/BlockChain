import { useAuth } from "@providers/AuthProvider";

export default function UserDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8">User Dashboard</h1>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">
            Welcome, {user?.name || user?.username}!
          </h2>
          <p className="text-slate-400 mb-4">
            This is your personal dashboard.
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Role:</span>{" "}
              <span className="capitalize">{user?.role}</span>
            </p>
            <p>
              <span className="text-slate-500">Email:</span> {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}



