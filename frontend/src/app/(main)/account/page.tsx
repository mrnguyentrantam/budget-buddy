"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountPage() {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    redirect("/auth");
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Account Information</h1>

      {user && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="space-y-2">
            <div className="text-gray-600">Name</div>
            <div className="text-lg font-medium">{user.name}</div>
          </div>

          <div className="space-y-2">
            <div className="text-gray-600">Email</div>
            <div className="text-lg font-medium">{user.email}</div>
          </div>
          {user.isAdmin && (
            <>
              <div className="space-y-2">
                <div className="text-gray-600">Admin</div>
                <div className="text-lg font-medium">Yes</div>
              </div>
              <div>
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Go to Admin Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-8 border-t pt-6">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
