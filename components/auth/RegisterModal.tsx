"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/contexts/auth-context";
import { Modal } from "@/components/shared";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const CATEGORIES = [
  "New Traveller",
  "Frequent Flyer",
  "Family with kids",
  "Business Traveller",
  "Solo Traveller",
];

const COUNTRIES = [
  "UAE",
  "India",
  "UK",
  "USA",
  "France",
  "Germany",
  "Australia",
  "Canada",
  "Singapore",
  "Other",
];

export function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const t = useTranslations();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    citizenship: "",
    uaeResident: false,
    details: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        name: formData.name,
        category: formData.category,
        citizenship: formData.citizenship,
        uaeResident: formData.uaeResident,
        details: formData.details || undefined,
      });
      onClose();
      setFormData({
        name: "",
        category: "",
        citizenship: "",
        uaeResident: false,
        details: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      citizenship: "",
      uaeResident: false,
      details: "",
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

        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            id="register-name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
            placeholder="Enter your full name"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label
            htmlFor="register-category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Traveller Category
          </label>
          <select
            id="register-category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
            required
          >
            <option value="">-- Select category --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="register-citizenship"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Citizenship
          </label>
          <select
            id="register-citizenship"
            value={formData.citizenship}
            onChange={(e) =>
              setFormData({ ...formData, citizenship: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
            required
          >
            <option value="">-- Select country --</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="register-uaeResident"
            type="checkbox"
            checked={formData.uaeResident}
            onChange={(e) =>
              setFormData({ ...formData, uaeResident: e.target.checked })
            }
            className="h-4 w-4 text-[#7F5539] focus:ring-[#7F5539] border-gray-300 rounded"
          />
          <label
            htmlFor="register-uaeResident"
            className="ml-2 block text-sm text-gray-700"
          >
            UAE Resident
          </label>
        </div>

        <div>
          <label
            htmlFor="register-details"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Additional Details (Optional)
          </label>
          <textarea
            id="register-details"
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F5539]"
            placeholder="E.g., Family of four, Business traveller, etc."
            rows={3}
          />
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
