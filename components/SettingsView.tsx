"use client";

import { useState } from "react";

export function SettingsView() {
  const [email, setEmail] = useState("john.doe@example.com");
  const [username, setUsername] = useState("johndoe");
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSave = () => {
    // Add your save logic here (API call etc.)
    console.log({
      email,
      username,
      darkMode,
      notificationsEnabled,
      twoFactorEnabled,
    });
    alert("Settings saved!");
  };

  const handleCancel = () => {
    // Optionally reset state or navigate away
    alert("Changes cancelled.");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Settings</h1>

      <div className="space-y-8">
        {/* Profile Settings */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Notifications</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Enable Email Notifications</span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`${
                notificationsEnabled ? "bg-blue-600" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
              />
            </button>
          </div>
        </section>

        {/* Theme */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${
                  darkMode ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
              />
            </button>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Security</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Two-Factor Authentication</span>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`${
                twoFactorEnabled ? "bg-blue-600" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${
                  twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
              />
            </button>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
