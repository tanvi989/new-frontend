import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "../api/retailerApis";

interface EditProfileProps {
  open: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  address: string;
  contactNumber: string;
  email: string;
  shopAddress: string;
  storeId: string;
  shopName: string;
  bankDetails: string;
  gstNumber: string;

  billingAddress: string;
  shippingAddress: string;
}

// Mock data for fallback
const MOCK_PROFILE = {
  first_name: "John",
  last_name: "Doe",
  address: "123 Main St, New York, NY",
  phone_number: "+1 (555) 123-4567",
  email: "john.doe@example.com",
  shop_address: "456 Retail Blvd",
  store_id: "STORE-001",
  shop_name: "John's Eyewear",
  bank_details: "ICICI Bank - 1234567890",
  gst_number: "22AAAAA0000A1Z5",
  pan_number: "ABCDE1234F",
};

const EditProfile: React.FC<EditProfileProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    address: "",
    contactNumber: "",
    email: "",
    shopAddress: "",
    storeId: "",
    shopName: "",
    bankDetails: "",
    gstNumber: "",

    billingAddress: "",
    shippingAddress: "",
  });

  const queryClient = useQueryClient();

  // Fetch current profile data to populate form
  const { data: profile } = useQuery({
    queryKey: ["retailerProfile"],
    queryFn: async () => {
      try {
        const response = await getProfile();
        if (response?.data) {
          return response.data;
        }
        return MOCK_PROFILE;
      } catch (error) {
        console.warn("Failed to fetch profile, using mock data", error);
        return MOCK_PROFILE;
      }
    },
    enabled: open, // Only fetch when modal is open
  });

  // Mutation for updating profile
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retailerProfile"] });
      onClose();
    },
    onError: (error) => {
      console.error("Failed to update profile", error);
      // Optionally add toast here
    },
  });

  // Populate form when data is available
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "", // Backend returns combined name or just firstName depending on logic, but we updated backend to return firstName
        lastName: profile.lastName || "",
        address: profile.address_data?.address || "", // Backend returns address_data object
        contactNumber: profile.primaryContact
          ? String(profile.primaryContact)
          : "",
        email: profile.email || "",
        shopAddress: profile.shopAddress || "",
        storeId: profile.storeId || "",
        shopName: profile.shopName || "",
        bankDetails: profile.bankDetails || "",
        gstNumber: profile.gstNumber || "",

        billingAddress: profile.billing_address || "",
        shippingAddress: profile.shipping_address || "",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transform data to match backend expectation (snake_case)
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      address: formData.address,
      contact_number: formData.contactNumber,
      email: formData.email,
      shop_address: formData.shopAddress,
      store_id: formData.storeId,
      retail_shop_name: formData.shopName,
      bank_details: formData.bankDetails,
      gst_number: formData.gstNumber,
      // pan_number: formData.panNumber, // Removed from interface
      billing_address: formData.billingAddress,
      shipping_address: formData.shippingAddress,
    };

    mutation.mutate(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[818px] max-h-[90vh] overflow-y-auto p-6 md:p-8 transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-[#1F1F1F] font-serif">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="firstName"
                className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter First Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="lastName"
                className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter Last Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            {/* Removed Address field to match desktop view */}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="contactNumber"
                className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
              >
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="text"
                placeholder="Enter Contact Number"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Email Address"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                htmlFor="billingAddress"
                className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
              >
                Billing Address
              </label>
              <input
                id="billingAddress"
                name="billingAddress"
                type="text"
                placeholder="Enter Billing Address"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors"
                value={formData.billingAddress}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                htmlFor="shippingAddress"
                className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
              >
                Shipping Address
              </label>
              <input
                id="shippingAddress"
                name="shippingAddress"
                type="text"
                placeholder="Enter Shipping Address"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors"
                value={formData.shippingAddress}
                onChange={handleChange}
              />
            </div>

            {/* Removed Shop Details, Bank Details, GST, and PAN to match desktop view */}
          </div>

          <div className="flex justify-center mt-6 mb-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#232320] text-white px-16 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl transform active:scale-95 min-w-[300px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
