"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/contexts/auth-context";
import { Modal } from "@/components/shared";
import { Eye, EyeOff } from "lucide-react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const t = useTranslations();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      onClose();
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
    });
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("auth.register")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="register-firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("auth.firstName")}
            </label>
            <input
              id="register-firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
              placeholder={t("auth.firstNamePlaceholder")}
              required
              autoComplete="given-name"
            />
          </div>

          <div>
            <label
              htmlFor="register-lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("auth.lastName")}
            </label>
            <input
              id="register-lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
              placeholder={t("auth.lastNamePlaceholder")}
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("auth.email")}
          </label>
          <input
            id="register-email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
            placeholder={t("auth.emailPlaceholder")}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label
            htmlFor="register-phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("auth.phone")} {t("auth.optional")}
          </label>
          <input
            id="register-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
            placeholder={t("auth.phonePlaceholder")}
            autoComplete="tel"
          />
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("auth.password")}
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539] pr-10"
              placeholder={t("auth.passwordPlaceholder")}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={
                showPassword ? t("auth.hidePassword") : t("auth.showPassword")
              }
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="register-confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("auth.confirmPassword")}
          </label>
          <div className="relative">
            <input
              id="register-confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539] pr-10"
              placeholder={t("auth.confirmPasswordPlaceholder")}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={
                showConfirmPassword
                  ? t("auth.hidePassword")
                  : t("auth.showPassword")
              }
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7F5539] text-white py-2 px-4 rounded-md hover:bg-[#6A4530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("common.loading") : t("auth.register")}
        </button>

        <div className="text-center text-sm text-gray-600">
          {t("auth.haveAccount")}{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#7F5539] hover:underline font-medium"
          >
            {t("auth.login")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
