"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/contexts/auth-context";
import { Modal } from "@/components/shared";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

interface UserOption {
  id: number;
  name: string;
  category: string;
}

export function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const t = useTranslations();
  const { login } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Fetch available users when modal opens
  useEffect(() => {
    if (isOpen) {
      setFetchingUsers(true);
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          setUsers(
            data.users?.map((u: UserOption) => ({
              id: u.id,
              name: u.name,
              category: u.category,
            })) || []
          );
        })
        .catch((err) => {
          console.error("Failed to fetch users:", err);
          setUsers([]);
        })
        .finally(() => setFetchingUsers(false));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }

    setLoading(true);

    try {
      await login(Number(selectedUserId));
      onClose();
      setSelectedUserId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("auth.login")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="login-user"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select User
          </label>
          {fetchingUsers ? (
            <div className="text-gray-500 text-sm py-2">Loading users...</div>
          ) : (
            <select
              id="login-user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
              required
            >
              <option value="">-- Select a user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.category})
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || fetchingUsers}
          className="w-full bg-[#7F5539] text-white py-2 px-4 rounded-md hover:bg-[#6A4530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("common.loading") : t("auth.login")}
        </button>

        <div className="text-center text-sm text-gray-600">
          {t("auth.noAccount")}{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#7F5539] hover:underline font-medium"
          >
            {t("auth.register")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
