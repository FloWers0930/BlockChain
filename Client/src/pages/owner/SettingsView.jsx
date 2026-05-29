// src/components/dashboard/owner/SettingsView.jsx
import { useEffect, useState, useCallback } from "react";
import api from "@api/axios";
import { getMe } from "@api/authApi";
import {
  User,
  Settings,
  Save,
  Loader,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  DollarSign,
  Bell,
  Camera,
  ChevronRight,
} from "lucide-react";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [error, setError] = useState(null);

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    timezone: "Asia/Manila",
    profileImage: null,
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    businessHours: {
      enabled: true,
      open: "08:00",
      close: "22:00",
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    bookingSettings: {
      maxAdvanceBooking: 30,
      minBookingDuration: 1,
      autoConfirmBookings: true,
      allowPartialHours: true,
    },
    notifications: {
      emailNewBooking: true,
      emailBookingCancel: true,
      smsNewBooking: false,
      pushNotifications: true,
    },
    paymentSettings: {
      currency: "PHP",
      autoInvoice: true,
      paymentReminder: 24,
    },
  });

  const [originalData, setOriginalData] = useState({
    profile: null,
    system: null,
  });

  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use your getMe function from authApi (handles token refresh automatically)
      const userData = await getMe();
      if (!userData) {
        throw new Error("Failed to fetch user data");
      }

      // Fetch system settings using your axios instance (handles CSRF + token refresh)
      const settingsRes = await api.get("/owner/settings");
      const settings = settingsRes.data?.settings || {};

      const profile = {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        timezone: settings.timezone || "Asia/Manila",
        profileImage: userData.profileImage || null,
      };

      const system = {
        businessHours: {
          enabled: settings.businessHours?.enabled ?? true,
          open: settings.businessHours?.open || "08:00",
          close: settings.businessHours?.close || "22:00",
          days: settings.businessHours?.days || [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        bookingSettings: {
          maxAdvanceBooking: settings.bookingSettings?.maxAdvanceBooking || 30,
          minBookingDuration: settings.bookingSettings?.minBookingDuration || 1,
          autoConfirmBookings:
            settings.bookingSettings?.autoConfirmBookings ?? true,
          allowPartialHours:
            settings.bookingSettings?.allowPartialHours ?? true,
        },
        notifications: {
          emailNewBooking: settings.notifications?.emailNewBooking ?? true,
          emailBookingCancel:
            settings.notifications?.emailBookingCancel ?? true,
          smsNewBooking: settings.notifications?.smsNewBooking ?? false,
          pushNotifications: settings.notifications?.pushNotifications ?? true,
        },
        paymentSettings: {
          currency: settings.paymentSettings?.currency || "PHP",
          autoInvoice: settings.paymentSettings?.autoInvoice ?? true,
          paymentReminder: settings.paymentSettings?.paymentReminder || 24,
        },
      };

      setProfileData(profile);
      setSystemSettings(system);
      setOriginalData({ profile, system });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[Settings] Failed to fetch settings:", err);
      }
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save profile settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/auth/profile", {
        name: profileData.name,
        phone: profileData.phone,
      });

      setOriginalData((prev) => ({
        ...prev,
        profile: { ...profileData },
      }));

      showNotification("✅ Profile updated successfully!");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[Settings] Failed to save profile:", err);
      }
      showNotification("⚠️ Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save system settings
  const handleSaveSystem = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/owner/settings", systemSettings);

      setOriginalData((prev) => ({
        ...prev,
        system: { ...systemSettings },
      }));

      showNotification("✅ Settings saved successfully!");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[Settings] Failed to save settings:", err);
      }
      showNotification("⚠️ Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 4000);
  };

  // Check if profile has changes
  const hasProfileChanges =
    originalData.profile !== null &&
    JSON.stringify(profileData) !== JSON.stringify(originalData.profile);

  // Check if system settings have changes
  const hasSystemChanges =
    originalData.system !== null &&
    JSON.stringify(systemSettings) !== JSON.stringify(originalData.system);

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDay = (day) => {
    setSystemSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        days: prev.businessHours.days.includes(day)
          ? prev.businessHours.days.filter((d) => d !== day)
          : [...prev.businessHours.days, day],
      },
    }));
  };

  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={40}
            className="animate-spin text-blue-600 mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-md px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 ${
            notification.includes("⚠️")
              ? "bg-red-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {notification.includes("⚠️") ? (
            <AlertTriangle size={24} />
          ) : (
            <CheckCircle size={24} />
          )}
          <p className="font-medium">
            {notification.replace(/[✅⚠️]/g, "").trim()}
          </p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Manage your profile and system preferences
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle size={20} />
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button
            onClick={fetchSettings}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-3xl p-2 shadow-sm border border-slate-100 max-w-md">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all ${
            activeTab === "profile"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <User size={18} />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all ${
            activeTab === "system"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Settings size={18} />
          <span>System</span>
        </button>
      </div>

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Profile Image Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Profile Photo
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {profileData.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profileData.name.charAt(0).toUpperCase()
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                  <Camera size={14} className="text-slate-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">
                  {profileData.name || "Your Name"}
                </h4>
                <p className="text-sm text-slate-500">{profileData.email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Personal Information
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          name: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Timezone
                  </label>
                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={profileData.timezone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">
                        America/New York (GMT-5)
                      </option>
                      <option value="Europe/London">
                        Europe/London (GMT+0)
                      </option>
                    </select>
                    <ChevronRight
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !hasProfileChanges}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-3xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-300"
            >
              {saving ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* System Settings */}
      {activeTab === "system" && (
        <form onSubmit={handleSaveSystem} className="space-y-6">
          {/* Business Hours */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Business Hours
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Set when your parking stations are available
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.businessHours.enabled}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      businessHours: {
                        ...systemSettings.businessHours,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {systemSettings.businessHours.enabled && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={systemSettings.businessHours.open}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          businessHours: {
                            ...systemSettings.businessHours,
                            open: e.target.value,
                          },
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={systemSettings.businessHours.close}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          businessHours: {
                            ...systemSettings.businessHours,
                            close: e.target.value,
                          },
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">
                    Operating Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                          systemSettings.businessHours.days.includes(day)
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Settings */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Booking Configuration
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Max Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={systemSettings.bookingSettings.maxAdvanceBooking}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        bookingSettings: {
                          ...systemSettings.bookingSettings,
                          maxAdvanceBooking: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Min Booking Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={systemSettings.bookingSettings.minBookingDuration}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        bookingSettings: {
                          ...systemSettings.bookingSettings,
                          minBookingDuration: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="font-medium text-slate-800">
                      Auto-confirm Bookings
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Automatically confirm new bookings
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.bookingSettings.autoConfirmBookings}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        bookingSettings: {
                          ...systemSettings.bookingSettings,
                          autoConfirmBookings: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="font-medium text-slate-800">
                      Allow Partial Hours
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Enable bookings for less than full hours
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.bookingSettings.allowPartialHours}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        bookingSettings: {
                          ...systemSettings.bookingSettings,
                          allowPartialHours: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-blue-600"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Notification Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-blue-600" />
                  <div>
                    <div className="font-medium text-slate-800">
                      New Booking Emails
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Receive email for new bookings
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.notifications.emailNewBooking}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {
                        ...systemSettings.notifications,
                        emailNewBooking: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-red-600" />
                  <div>
                    <div className="font-medium text-slate-800">
                      Cancellation Emails
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Receive email when bookings are cancelled
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.notifications.emailBookingCancel}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {
                        ...systemSettings.notifications,
                        emailBookingCancel: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-emerald-600" />
                  <div>
                    <div className="font-medium text-slate-800">
                      SMS Notifications
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Receive SMS for new bookings
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.notifications.smsNewBooking}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {
                        ...systemSettings.notifications,
                        smsNewBooking: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-purple-600" />
                  <div>
                    <div className="font-medium text-slate-800">
                      Push Notifications
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Browser push notifications
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.notifications.pushNotifications}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {
                        ...systemSettings.notifications,
                        pushNotifications: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-blue-600"
                />
              </label>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Payment & Billing
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Currency
                </label>
                <div className="relative max-w-xs">
                  <DollarSign
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={systemSettings.paymentSettings.currency}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        paymentSettings: {
                          ...systemSettings.paymentSettings,
                          currency: e.target.value,
                        },
                      })
                    }
                    className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all appearance-none bg-white"
                  >
                    <option value="PHP">PHP (₱)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                  <ChevronRight
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="font-medium text-slate-800">
                      Auto-generate Invoices
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Automatically create invoices for bookings
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.paymentSettings.autoInvoice}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        paymentSettings: {
                          ...systemSettings.paymentSettings,
                          autoInvoice: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-blue-600"
                  />
                </label>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Payment Reminder (hours before)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={systemSettings.paymentSettings.paymentReminder}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        paymentSettings: {
                          ...systemSettings.paymentSettings,
                          paymentReminder: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full max-w-xs px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !hasSystemChanges}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-3xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-300"
            >
              {saving ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
