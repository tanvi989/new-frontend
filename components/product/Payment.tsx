import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useGooglePlacesScript, parsePlaceToAddress } from "../../hooks/useGooglePlacesScript";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { getProductFlow } from "../../utils/productFlowStorage";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  getCart,
  getPaymentModes,
  payPartialAmount,
  placeOrder,
  createPaymentSession,
  getUserAddresses,
  saveUserAddress,
  deleteUserAddress,
  updateUserAddress,
  addPrescription,
} from "../../api/retailerApis";
import WhyMutlifolks from "@/components/WhyMutlifolks";
import { Loader } from "../Loader";
import CustomerCartView from "../CustomerCartView";
import { CartItem } from "../../types";
import { calculateCartSubtotal, getCartLensOverride, getCartLensOverrideBySku } from "../../utils/priceUtils";
import { trackAddShippingInfo } from "../../utils/analytics";

// Stripe **publishable** key only (never commit secret keys).
// Set VITE_STRIPE_PUBLISHABLE_KEY in your .env (e.g. pk_test_... or pk_live_...)
// Only load Stripe over HTTPS to avoid "Stripe.js integrations must use HTTPS" warning (use HTTPS in dev or production).
const publishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim();
const isHttps =
  typeof window === "undefined" || window.location.protocol === "https:";
const stripePromise =
  publishableKey && isHttps ? loadStripe(publishableKey) : Promise.resolve(null);

interface LocationState {
  order_id?: string;
  address_id?: string;
  is_partial?: boolean;
}

interface SavedAddress {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  address_type: string;
  is_default: boolean;
}

// Enhanced Mock Data for Auto-fill with Coordinates
const MOCK_ADDRESS_SUGGESTIONS = [
  {
    id: 1,
    main: "Bangladesh",
    sub: "Country",
    city: "Dhaka",
    state: "Dhaka",
    country: "Bangladesh",
    zip: "1000",
    lat: 23.685,
    lon: 90.3563,
  },
  {
    id: 2,
    main: "Bali",
    sub: "Indonesia",
    city: "Denpasar",
    state: "Bali",
    country: "Indonesia",
    zip: "80111",
    lat: -8.4095,
    lon: 115.1889,
  },
  {
    id: 3,
    main: "Barbados",
    sub: "Country",
    city: "Bridgetown",
    state: "Saint Michael",
    country: "Barbados",
    zip: "BB11000",
    lat: 13.1939,
    lon: -59.5432,
  },
  {
    id: 4,
    main: "Bahrain",
    sub: "Country",
    city: "Manama",
    state: "Capital Governorate",
    country: "Bahrain",
    zip: "316",
    lat: 26.0667,
    lon: 50.5577,
  },
  {
    id: 5,
    main: "Bahamas",
    sub: "Country",
    city: "Nassau",
    state: "New Providence",
    country: "Bahamas",
    zip: "N-3701",
    lat: 25.0343,
    lon: -77.3963,
  },
  {
    id: 6,
    main: "Bangalore",
    sub: "Karnataka, India",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    zip: "560001",
    lat: 12.9716,
    lon: 77.5946,
  },
  {
    id: 7,
    main: "2 Leman Street",
    sub: "London, UK",
    city: "London",
    state: "England",
    country: "United Kingdom",
    zip: "E1W 9US",
    lat: 51.513,
    lon: -0.0725,
  },
];

// Saved Addresses Modal Component
const SavedAddressesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: SavedAddress) => void;
  selectedAddressId?: string;
}> = ({ isOpen, onClose, onSelectAddress, selectedAddressId }) => {
  const queryClient = useQueryClient();

  const { data: addressesResponse = {}, isLoading, refetch } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: getUserAddresses,
  });

  const addresses = addressesResponse?.data?.addresses || [];

  const deleteAddressMutation = useMutation({
    mutationFn: deleteUserAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
  });

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Saved Addresses</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No saved addresses found</p>
              <button
                onClick={onClose}
                className="text-sm font-bold text-[#E94D37] hover:underline"
              >
                Add a new address
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address: SavedAddress) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAddressId === address.id
                      ? "border-[#E94D37] bg-[#FFF5F5]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => onSelectAddress(address)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-[#1F1F1F]">{address.full_name}</span>
                        {address.is_default && (
                          <span className="text-xs bg-[#E94D37] text-white px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{address.address_line}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                      <p className="text-sm text-gray-600 mt-1">{address.mobile}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors ml-4"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              refetch();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-[#E94D37] rounded-md hover:bg-[#d43f2a] transition-colors"
          >
            Add New Address
          </button>
        </div>
      </div>
    </div>
  );
};

const AddressForm = React.forwardRef<
  { submit: () => void },
  { onNext: (data: any) => void; onFormValidityChange?: (isValid: boolean) => void }
>(({ onNext, onFormValidityChange }, ref) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const desktopFormRef = useRef<HTMLFormElement>(null);
  const mobileFormRef = useRef<HTMLFormElement>(null);

  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>();

  React.useImperativeHandle(ref, () => ({
    submit: () => {
      if (desktopFormRef.current && desktopFormRef.current.offsetParent !== null) {
        desktopFormRef.current.requestSubmit();
      } else if (mobileFormRef.current) {
        mobileFormRef.current.requestSubmit();
      }
    },
  }));

  // Form State
  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
    email: user?.email || "",
    mobile: user?.phone || "",
    addressLine: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    addressType: "Home", // Default
    isDefaultAddress: false, // Added this to track default address
  });

  // Save address mutation
  const saveAddressMutation = useMutation({
    mutationFn: saveUserAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
  });

  // Check if form is valid
  const isFormValid = formData.fullName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.mobile.trim() !== '' &&
    formData.addressLine.trim() !== '' &&
    formData.city.trim() !== '' &&
    formData.state.trim() !== '' &&
    formData.country.trim() !== '' &&
    formData.zip.trim() !== '';

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || prev.email,
        mobile: user.phone || prev.mobile
      }));
    }
  }, [user]);


















  
  // Notify parent of form validity changes
  useEffect(() => {
    if (onFormValidityChange) {
      onFormValidityChange(isFormValid);
    }
  }, [isFormValid, onFormValidityChange]);

  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const searchAddressInputRef = useRef<HTMLInputElement>(null);
  const searchAddressInputRefDesktop = useRef<HTMLInputElement>(null);
  const autocompleteAttachedRef = useRef(false);
  const autocompleteAttachedDesktopRef = useRef(false);
  const { isReady: googlePlacesReady } = useGooglePlacesScript();

  // Attach Google Places Autocomplete to Search Address inputs when script is ready
  const attachAutocomplete = (input: HTMLInputElement, attachedRef: React.MutableRefObject<boolean>) => {
    if (attachedRef.current) return;
    const win = window as unknown as { google?: { maps?: { places?: { Autocomplete: new (input: HTMLInputElement, opts?: { types?: string[] }) => { getPlace: () => unknown; addListener: (ev: string, fn: () => void) => void } } } } };
    if (!win.google?.maps?.places?.Autocomplete) return;
    const autocomplete = new win.google.maps.places.Autocomplete(input, { types: ["address"] });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace() as import("../../hooks/useGooglePlacesScript").PlaceResult & { formatted_address?: string };
      if (!place?.address_components?.length && !place?.formatted_address) return;
      const parsed = parsePlaceToAddress(place);
      setFormData((prev) => ({
        ...prev,
        addressLine: parsed.addressLine || prev.addressLine,
        city: parsed.city || prev.city,
        state: parsed.state || prev.state,
        country: parsed.country || prev.country,
        zip: parsed.zip || prev.zip,
      }));
      setSearchValue(place.formatted_address || "");
    });
    attachedRef.current = true;
  };
  useEffect(() => {
    if (!googlePlacesReady) return;
    const timer = setTimeout(() => {
      if (searchAddressInputRef.current) attachAutocomplete(searchAddressInputRef.current, autocompleteAttachedRef);
      if (searchAddressInputRefDesktop.current) attachAutocomplete(searchAddressInputRefDesktop.current, autocompleteAttachedDesktopRef);
    }, 300);
    return () => clearTimeout(timer);
  }, [googlePlacesReady]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (val.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox separately
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectAddress = (item: (typeof MOCK_ADDRESS_SUGGESTIONS)[0]) => {
    setSearchValue(item.main);
    setFormData((prev) => ({
      ...prev,
      city: item.city,
      state: item.state,
      country: item.country,
      zip: item.zip,
      addressLine: item.main,
    }));
    if (item.lat && item.lon) {
      setMapCoordinates({ lat: item.lat, lon: item.lon });
    }
    setShowSuggestions(false);
  };

  const handleSelectSavedAddress = (address: SavedAddress) => {
    setFormData({
      fullName: address.full_name,
      email: address.email,
      mobile: address.mobile,
      addressLine: address.address_line,
      city: address.city,
      state: address.state,
      country: address.country,
      zip: address.zip,
      addressType: address.address_type,
      isDefaultAddress: address.is_default,
    });
    setSelectedSavedAddressId(address.id);
    setShowSavedAddresses(false);
  };

  const handleLocationClick = () => {
    if (searchValue) {
      setSearchValue("");
      setShowSuggestions(false);
      setFormData((prev) => ({
        ...prev,
        city: "",
        state: "",
        country: "",
        zip: "",
        addressLine: "",
      }));
      setMapCoordinates(null);
    } else {
      handleUseMyLocation();
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMapCoordinates({ lat: latitude, lon: longitude });

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setIsLocating(false);

            if (data && data.address) {
              const addr = data.address;
              const formattedAddress = data.display_name;
              const street = addr.road || addr.pedestrian || addr.suburb || "";
              const houseNumber = addr.house_number || "";
              const addressLine1 = [houseNumber, street]
                .filter(Boolean)
                .join(" ");

              const city =
                addr.city || addr.town || addr.village || addr.county || "";
              const state = addr.state || addr.region || "";
              const country = addr.country || "";
              const zip = addr.postcode || "";

              setSearchValue(formattedAddress);
              setFormData((prev) => ({
                ...prev,
                city: city,
                state: state,
                country: country,
                zip: zip,
                addressLine: addressLine1 || formattedAddress.split(",")[0],
              }));
            } else {
              setSearchValue(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (error) {
            console.error("Geocoding failed", error);
            setIsLocating(false);
            alert("Could not fetch address details. Please enter manually.");
          }
        },
        (error) => {
          setIsLocating(false);
          console.error("Geolocation error", error);
          alert(
            "Unable to retrieve your location. Please check browser permissions."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always save the address to localStorage
    try {
      await saveAddressMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Failed to save address:", error);
      // Continue with form submission even if saving fails
    }
    
    onNext(formData);
  };

  return (
    <div className="w-full">
      {/* Desktop Layout - Unchanged */}
      <div className="hidden md:block">
        <h2 className="text-base font-bold text-[#1F1F1F] mb-4 font-sans">
          Shipping Details
        </h2>

        <div className="bg-white p-8 rounded-sm border border-gray-300 shadow-sm relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-[#1F1F1F]">
              Where should we send your glasses?
            </h3>
            <button 
              onClick={() => setShowSavedAddresses(true)}
              className="text-xs font-bold text-[#1F1F1F] border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              View Saved Addresses
            </button>
          </div>

          <form
            ref={desktopFormRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* Search Address - Google Places autofill; fields below remain editable */}
            <div className="relative border border-gray-300 rounded-sm bg-white p-1 focus-within:border-[#1F1F1F] transition-colors">
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">
                Search Address
              </label>
              <div className="flex items-center gap-2 px-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchAddressInputRefDesktop}
                  type="text"
                  placeholder="Start typing to search with Google"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full px-2 pb-1 text-sm font-bold text-[#1F1F1F] outline-none placeholder:text-gray-300 bg-transparent border-none focus:ring-0 p-0 h-6"
                  autoComplete="off"
                />
              </div>
              <p className="text-[10px] text-gray-400 ml-2 mt-0.5 flex items-center gap-1">Powered by Google Maps</p>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative border border-gray-300 rounded-sm bg-white p-1 focus-within:border-[#1F1F1F] transition-colors">
                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">
                  FULL NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-2 pb-1 text-sm font-bold text-[#1F1F1F] outline-none placeholder:text-gray-300 bg-transparent border-none focus:ring-0 p-0 h-6"
                  placeholder="Enter Name"
                  required
                />
              </div>
              <div className="relative border border-gray-300 rounded-sm bg-white p-1 focus-within:border-[#1F1F1F] transition-colors">
                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">
                  ENTER MOBILE <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-2 pb-1 text-sm font-bold text-[#1F1F1F] outline-none placeholder:text-gray-300 bg-transparent border-none focus:ring-0 p-0 h-6"
                  placeholder="Enter Mobile"
                  required
                />
              </div>
            </div>

            {/* Row 3: Zip Code */}
            <div className="relative border border-gray-300 rounded-sm bg-white p-1 focus-within:border-[#1F1F1F] transition-colors">
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">
                ENTER ZIP CODE
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full px-2 pb-1 text-sm font-bold text-[#1F1F1F] outline-none placeholder:text-gray-300 bg-transparent border-none focus:ring-0 p-0 h-6"
                placeholder=""
              />
            </div>

            {/* Row 4: Address & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative border border-gray-300 rounded-sm bg-white p-1 focus-within:border-[#1F1F1F] transition-colors">
                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">
                  ENTER ADDRESS (HOUSE NO. STREET) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleInputChange}
                  className="w-full px-2 pb-1 text-sm font-bold text-[#1F1F1F] outline-none placeholder:text-gray-300 bg-transparent border-none focus:ring-0 p-0 h-6"
                  placeholder=""
                />
              </div>
              <div className="relative border border-gray-300 rounded-sm bg-white p-1 focus-within:border-[#1F1F1F] transition-colors">
                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">
                  ENTER CITY <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-2 pb-1 text-sm font-bold text-[#1F1F1F] outline-none placeholder:text-gray-300 bg-transparent border-none focus:ring-0 p-0 h-6"
                  placeholder=""
                />
              </div>
            </div>

            {/* Row 5: State & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative border border-gray-300 rounded-sm bg-white p-1 focus-within:border-[#1F1F1F] transition-colors">
                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">
                  ENTER STATE/COUNTY <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-2 pb-1 text-sm font-bold text-[#1F1F1F] outline-none placeholder:text-gray-300 bg-transparent border-none focus:ring-0 p-0 h-6"
                  placeholder=""
                />
              </div>
              <div className="relative border border-gray-300 rounded-sm bg-white p-1 focus-within:border-[#1F1F1F] transition-colors">
                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1">
                  COUNTRY <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-2 pb-1 text-sm font-bold text-[#1F1F1F] outline-none placeholder:text-gray-300 bg-transparent border-none focus:ring-0 p-0 h-6"
                  placeholder=""
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                id="default-address"
                name="isDefaultAddress"
                checked={formData.isDefaultAddress}
                onChange={handleInputChange}
                className="w-4 h-4 cursor-pointer rounded border-gray-300 text-[#1F1F1F] focus:ring-[#1F1F1F] accent-[#1F1F1F]"
              />
              <label
                htmlFor="default-address"
                className="text-sm font-medium text-[#1F1F1F] cursor-pointer"
              >
                Save as Default Address
              </label>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={saveAddressMutation.isLoading}
                className="bg-[#E94D37] text-white px-16 py-3 rounded-md font-bold text-sm hover:bg-[#d43f2a] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E94D37]"
              >
                {saveAddressMutation.isLoading ? "Saving..." : "Checkout Now"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Layout - Matching Screenshot */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#333]">
            Where Should We Send Your Glasses?
          </h2>
          <button className="text-gray-400" onClick={() => window.history.back()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        </div>

        {/* Mobile Saved Addresses Button */}
        <div className="mb-4">
          <button 
            onClick={() => setShowSavedAddresses(true)}
            className="w-full text-sm font-bold text-[#1F1F1F] border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            View Saved Addresses
          </button>
        </div>

        <form
          id="mobile-address-form"
          ref={mobileFormRef}
          onSubmit={handleSubmit}
          className="space-y-8 pb-32"
        >
          {/* Contact Details Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#333]">Contact details</h3>

            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm font-medium outline-none border-none bg-transparent"
                required
              />
            </div>

            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm font-medium outline-none border-none bg-transparent"
                required
              />
            </div>

            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                Phone Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm font-medium outline-none border-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Search Address Section - Google Places autofill; fields below remain editable */}
          <div className="space-y-4">
            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3" ref={suggestionRef}>
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                Search Address
              </label>
              <div className="flex items-center gap-2 px-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchAddressInputRef}
                  type="text"
                  placeholder="Start typing to search with Google"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    if (e.target.value.length > 0) setShowSuggestions(false);
                  }}
                  className="w-full py-1 text-sm font-medium outline-none border-none bg-transparent"
                  autoComplete="off"
                />
              </div>
              <p className="px-2 pt-1 text-[10px] text-gray-400 flex items-center gap-1">
                <span>Powered by Google Maps</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              </p>
            </div>
          </div>

          {/* Address Details Section - Editable after autofill */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#333]">Address Details</h3>

            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                House No, Building Name.
              </label>
              <input
                type="text"
                name="addressLine"
                value={formData.addressLine}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm font-medium outline-none border-none bg-transparent"
                required
              />
            </div>

            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                ZIP Code
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm font-medium outline-none border-none bg-transparent"
                required
              />
            </div>

            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm font-medium outline-none border-none bg-transparent"
                required
              />
            </div>

            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3 bg-gray-100">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm font-medium outline-none border-none bg-transparent"
                required
              />
            </div>

            <div className="relative border border-gray-300 rounded-md p-1.5 pt-3">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-[#333]">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm font-medium outline-none border-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Address Type Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#333]">Address Type <span className="text-gray-400 font-normal">(Optional)</span></h3>
            <div className="flex gap-3">
              {['Home', 'Office', 'Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, addressType: type }))}
                  className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-colors ${formData.addressType === type
                    ? 'bg-[#d2d6d9] text-[#333]'
                    : 'bg-[#f1f4f6] text-[#333]'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Added Save as Default Address checkbox for mobile */}
          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              id="mobile-default-address"
              name="isDefaultAddress"
              checked={formData.isDefaultAddress}
              onChange={handleInputChange}
              className="w-4 h-4 cursor-pointer rounded border-gray-300 text-[#1F1F1F] focus:ring-[#1F1F1F] accent-[#1F1F1F]"
            />
            <label
              htmlFor="mobile-default-address"
              className="text-sm font-medium text-[#1F1F1F] cursor-pointer"
            >
              Save as Default Address
            </label>
          </div>
        </form>
      </div>

      {/* Saved Addresses Modal */}
      <SavedAddressesModal
        isOpen={showSavedAddresses}
        onClose={() => setShowSavedAddresses(false)}
        onSelectAddress={handleSelectSavedAddress}
        selectedAddressId={selectedSavedAddressId}
      />
    </div>
  );
});

const CheckoutSummary = ({
  cartItems,
  subtotal,
  discountAmount,
  total,
  couponCode,
  taxAmount,
  shippingCost,
  onOpenCart,
  onCheckout,
  isFormDisabled,
  buttonText,
  enrichedCarts,
}: {
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode?: string;
  taxAmount?: number;
  shippingCost?: number;
  onOpenCart: () => void;
  onCheckout?: () => void;
  isFormDisabled?: boolean;
  buttonText?: string;
  enrichedCarts?: any[];
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary Block */}
      <div>
        <h3 className="text-sm font-bold text-[#1F1F1F] mb-4 font-sans">
          Summary
        </h3>
        <div className="bg-white border border-gray-300 p-4 flex justify-between items-center rounded-sm shadow-sm">
          <span className="text-sm font-bold text-[#1F1F1F]">
            Your Cart ( {cartItems.length} Item )
          </span>
          <button
            onClick={onOpenCart}
            className="!bg-transparent !border-none !p-0 text-xs font-bold text-[#FF9900] underline hover:text-[#e68a00] hover:bg-transparent transition-colors focus:ring-0 focus:outline-none"
            style={{
              backgroundColor: "transparent",
              padding: 0,
              border: "none",
            }}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Price Summary Block */}
      <div>
        <h3 className="text-sm font-bold text-[#1F1F1F] mb-4 font-sans">
          Price Summary
        </h3>
        <div className="bg-white p-6 border border-gray-300 rounded-sm space-y-4 shadow-sm">
          <div className="flex justify-between text-sm font-bold text-[#1F1F1F]">
            <span>Price</span>
            <span>£{subtotal.toFixed(0)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm font-bold text-[#00C853]">
              <span>Discount {couponCode ? `(${couponCode})` : ""}</span>
              <span>- £{discountAmount.toFixed(0)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-[#00C853]">
            <span>Taxes</span>
            <span>£{taxAmount?.toFixed(0) || "0"}</span>
          </div>

          <div className="flex justify-between text-sm font-bold text-[#1F1F1F]">
            <span>Shipping</span>
            <span>£{shippingCost?.toFixed(0) || "0"}</span>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between text-sm font-bold text-[#1F1F1F]">
            <span>Total Payable</span>
            <span>£{total.toFixed(0)}</span>
          </div>

          <button
            onClick={onCheckout}
            disabled={isFormDisabled}
            className="w-full bg-[#E94D37] text-white py-3 rounded-md font-bold text-sm mt-4 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E94D37]"
          >
            {buttonText || "Checkout"}
          </button>
        </div>
      </div>



{/* Prescription Details per cart item */}
{enrichedCarts && enrichedCarts.length > 0 && (
  <div>
    <h3 className="text-sm font-bold text-[#1F1F1F] mb-4 font-sans">
      Prescriptions
    </h3>
    <div className="bg-white border border-gray-300 rounded-sm shadow-sm divide-y divide-gray-100">
      {enrichedCarts.map((item: any, idx: number) => {
        const productName =
          item.product?.products?.naming_system ||
          item.product?.products?.brand ||
          item.name ||
          `Item ${idx + 1}`;
        const pres = item.prescription;
        const details = pres?.prescriptionDetails || pres?.data || pres;

        return (
          <div key={idx} className="p-4">
            <p className="text-sm font-bold text-[#1F1F1F] mb-2">{productName}</p>

            {!pres ? (
              <span className="text-xs text-red-500 font-semibold">
                ⚠ No prescription added
              </span>
            ) : (
              <>
          
                {/* OD / OS table */}
                {details && (details.rightSph || details.leftSph || details.rightCyl || details.leftCyl) && (
                  <div className="w-full text-xs border border-gray-100 rounded overflow-hidden mb-2">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500">
                          <th className="p-1.5 text-left font-semibold"></th>
                          <th className="p-1.5 text-center font-semibold">Right (OD)</th>
                          <th className="p-1.5 text-center font-semibold">Left (OS)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(details.rightSph || details.leftSph) && (
                          <tr className="border-t border-gray-100">
                            <td className="p-1.5 font-semibold text-[#1F1F1F]">SPH</td>
                            <td className="p-1.5 text-center text-[#525252]">{details.rightSph || "—"}</td>
                            <td className="p-1.5 text-center text-[#525252]">{details.leftSph || "—"}</td>
                          </tr>
                        )}
                        {(details.rightCyl || details.leftCyl) && (
                          <tr className="border-t border-gray-100">
                            <td className="p-1.5 font-semibold text-[#1F1F1F]">CYL</td>
                            <td className="p-1.5 text-center text-[#525252]">{details.rightCyl || "—"}</td>
                            <td className="p-1.5 text-center text-[#525252]">{details.leftCyl || "—"}</td>
                          </tr>
                        )}
                        {(details.rightAxis || details.leftAxis) && (
                          <tr className="border-t border-gray-100">
                            <td className="p-1.5 font-semibold text-[#1F1F1F]">AXIS</td>
                            <td className="p-1.5 text-center text-[#525252]">{details.rightAxis || "—"}</td>
                            <td className="p-1.5 text-center text-[#525252]">{details.leftAxis || "—"}</td>
                          </tr>
                        )}
                        {(details.rightAdd || details.leftAdd) && (
                          <tr className="border-t border-gray-100">
                            <td className="p-1.5 font-semibold text-[#1F1F1F]">ADD</td>
                            <td className="p-1.5 text-center text-[#525252]">{details.rightAdd || "—"}</td>
                            <td className="p-1.5 text-center text-[#525252]">{details.leftAdd || "—"}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* PD */}
                {(details?.pdSingle || details?.pdRight || details?.pdLeft) && (
                  <p className="text-xs text-[#525252]">
                    <span className="font-semibold text-[#1F1F1F]">PD: </span>
                    {details.pdType === "dual" || details.pdType === "Dual"
                      ? `R: ${details.pdRight || "—"} / L: ${details.pdLeft || "—"}`
                      : `${details.pdSingle || "—"} mm`}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}



      {/* Why Multifolks? Trust Section - Mobile Only */}
      <div className="md:hidden">
        <WhyMutlifolks />
      </div>

      {/* Desktop Trust Badges */}
      <div className="bg-white p-4 md:p-6 rounded border border-gray-200 flex flex-col items-center text-center">
        <div className="w-12 h-12 md:w-16 md:h-16 mb-4">
          {/* Seal SVG Placeholder */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-black"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M50 15 L55 35 L75 35 L60 50 L65 70 L50 60 L35 70 L40 50 L25 35 L45 35 Z"
              fill="currentColor"
              opacity="0.1"
            />
            <text
              x="50"
              y="55"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="currentColor"
            >
              100%
            </text>
            <text
              x="50"
              y="65"
              textAnchor="middle"
              fontSize="8"
              fill="currentColor"
            >
              GUARANTEE
            </text>
          </svg>
        </div>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          If you're not 100% satisfied with your purchase within 30
          days, our Customer Happiness team is ready to assist with a
          hassle-free refund, 24/7. Just email us.
        </p>

        <div className="flex flex-col md:flex-row md:justify-center md:gap-8 text-xs text-gray-500 font-bold mb-6 w-full border-t border-gray-100 pt-4">
          <span className="flex items-center gap-2 justify-center mb-2 md:mb-0">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
            Secure Payment
          </span>
          <span className="flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
            30 Days Easy Refund
          </span>
        </div>
        <div className="flex justify-center gap-2 md:gap-3 opacity-60">
          {/* Payment Icons */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
            className="h-3 md:h-4"
            alt="Visa"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
            className="h-3 md:h-4"
            alt="Mastercard"
          />
          <div className="flex items-center gap-1 text-[6px] md:text-[8px] font-bold border border-gray-300 px-1 rounded">
            <svg
              width="8"
              height="8"
              className="md:w-2 md:h-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
              ></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            256 BIT SSL
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentModes: React.FC<{
  selectedValue: number | string;
  payments: any[];
  handlePaymentModeChange: (code: number | string) => void;
  handlePlaceOrder: (e?: any) => void;
  loading: boolean;
  onBack: () => void;
  addressData?: any;
}> = ({
  selectedValue,
  payments,
  handlePaymentModeChange,
  handlePlaceOrder,
  loading,
  onBack,
  addressData
}) => {
    const { user } = useAuth();
    const [cardError, setCardError] = useState<string | null>(null);

    return (
      <div className="flex flex-col gap-6">
        {/* Page Title */}
        <h1 className="text-xl font-bold text-[#1F1F1F] font-serif">
          Payment Options
        </h1>

   
<div className="w-full rounded-lg overflow-hidden hidden md:block">
  <img
    src="/payment-banner-new.jpg"
    alt="Complete Your Order Upgrade Your Style"
    className="w-full h-auto object-cover"
  />
</div>
        {/* Satisfaction Guarantee Banner */}
        <div className="bg-[#E8F5E9] text-[#2E7D32] py-3 px-4 text-center font-bold text-sm rounded-md border border-[#C8E6C9]">
          30-Day Zero-Questions Return. Guaranteed.
        </div>

        {/* Payment Options Section */}
        <div className="bg-white rounded-sm shadow-sm p-6 md:p-8 border border-gray-300">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#1F1F1F]">
              Select your preferred method of payment:
            </h2>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            {/* Credit/Debit Card Option */}
            <div className="border border-gray-300 rounded-sm overflow-hidden">
              <label
                className={`flex items-center p-5 cursor-pointer transition-all ${selectedValue == 200 ? "bg-white" : "bg-white"
                  }`}
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-full border mr-4 shrink-0 ${selectedValue == 200 ? "border-[#00C853]" : "border-gray-300"
                    }`}
                >
                  {selectedValue == 200 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00C853]"></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="paymentmode"
                  value="200"
                  checked={selectedValue == 200}
                  onChange={() => handlePaymentModeChange(200)}
                  className="hidden"
                />
                <span className="font-bold text-[#1F1F1F] text-sm">
                  Enter Credit/Debit Card
                </span>
              </label>

              {selectedValue == 200 && (
                <div className="mt-4 p-6 bg-white rounded-sm border border-gray-300 animate-in fade-in slide-in-from-top-2 ml-4 border-l-4 border-l-[#232320]">
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-4">
                      You will be redirected to a secure Stripe payment page to complete your purchase.
                    </p>
                    <button
                      onClick={() => handlePlaceOrder()}
                      className="w-full bg-[#0074D4] text-white py-3 rounded-md font-bold text-sm hover:bg-[#0064B6] transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Payment</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
                    <span>
                      Powered by{" "}
                      <span className="font-bold text-gray-500">stripe</span>
                    </span>
                    <span>Terms</span>
                    <span>Privacy</span>
                  </div>

                  {cardError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm mt-3 font-bold bg-red-50 p-2 rounded">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {cardError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* HSA/FSA Insurance Option */}
            {/* <div className="border border-gray-300 rounded-sm">
              <label className="flex items-center p-5 cursor-pointer">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 mr-4 shrink-0"></div>
                <input
                  type="radio"
                  name="paymentmode"
                  disabled
                  className="hidden"
                />
                <span className="font-bold text-[#1F1F1F] text-sm mr-2">
                  Pay With Your HSA/FSA Insurance
                </span>
                <span className="text-xs text-[#FF9800] font-medium">
                  Only for US customers{" "}
                  <span className="underline cursor-pointer">T&C Apply</span>
                </span>
              </label>
            </div> */}

            {/* Buy Now Pay Later Option - same Stripe redirect as Credit/Debit */}
            <div className="border border-gray-300 rounded-sm overflow-hidden">
              <label
                className={`flex items-center p-5 cursor-pointer transition-all ${selectedValue == 201 ? "bg-white" : "bg-white"}`}
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-full border mr-4 shrink-0 ${selectedValue == 201 ? "border-[#00C853]" : "border-gray-300"}`}
                >
                  {selectedValue == 201 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00C853]"></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="paymentmode"
                  value="201"
                  checked={selectedValue == 201}
                  onChange={() => handlePaymentModeChange(201)}
                  className="hidden"
                />
                <span className="font-bold text-[#1F1F1F] text-sm">
                  Buy Now Pay Later
                </span>
              </label>

              {selectedValue == 201 && (
                <div className="mt-4 p-6 bg-white rounded-sm border border-gray-300 animate-in fade-in slide-in-from-top-2 ml-4 border-l-4 border-l-[#232320]">
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-4">
                      You will be redirected to a secure Stripe payment page to complete your purchase.
                    </p>
                    <button
                      onClick={() => handlePlaceOrder()}
                      className="w-full bg-[#0074D4] text-white py-3 rounded-md font-bold text-sm hover:bg-[#0064B6] transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Payment</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
                    <span>
                      Powered by{" "}
                      <span className="font-bold text-gray-500">stripe</span>
                    </span>
                    <span>Terms</span>
                    <span>Privacy</span>
                  </div>

                  {cardError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm mt-3 font-bold bg-red-50 p-2 rounded">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {cardError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            By placing the order, I have read and agreed to multifolks.com{" "}
            <Link to="/terms" className="text-red-500 cursor-pointer hover:underline">
              Terms and Conditions
            </Link>
          </div>

          {/* Secure Checkout Footer */}
          <div className="mt-6 border border-gray-300 rounded-md p-3 flex items-center gap-2 bg-white shadow-sm">
            <div className="w-5 h-5 bg-[#00C853] rounded-full flex items-center justify-center text-white text-xs">
              <i className="fas fa-check"></i>
            </div>
            <span className="text-sm font-bold text-[#1F1F1F]">
              Secure Checkout | Your payment information is fully protected.
            </span>
          </div>

          {(selectedValue != 200 && selectedValue != 201) && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => handlePlaceOrder()}
                disabled={loading}
                className="bg-[#EF5350] text-white px-12 py-3 rounded-md font-bold text-sm hover:bg-[#E53935] transition-all shadow-md disabled:opacity-70"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
function buildMergedPrescription(prescription: any, cart?: any, productSku?: string): any {
  if (!prescription) return prescription;

  const base      = prescription?.prescriptionDetails || {};
  const dataLayer = prescription?.data               || {};
  const deepBase  = dataLayer?.prescriptionDetails   || {};
  const pd        = cart?.product_details            || {};
  const flow      = getProductFlow(productSku || "");

  const firstDefined = (...vals: any[]): any =>
    vals.find((v) => v !== undefined && v !== null);

  const pdRight = firstDefined(
    prescription?.pdRight, prescription?.pdOD, prescription?.pd_right, prescription?.pd_right_mm,
    base?.pdRight,  base?.pdOD,  base?.pd_right,  base?.pd_right_mm,
    deepBase?.pdRight, deepBase?.pdOD, deepBase?.pd_right,
    dataLayer?.pdRight, dataLayer?.pdOD, dataLayer?.pd_right, dataLayer?.pd_right_mm,
    pd?.pd_right_mm, pd?.pd_right, pd?.pdRight, pd?.pdOD,
    flow?.pdRight,
  );
  const pdLeft = firstDefined(
    prescription?.pdLeft, prescription?.pdOS, prescription?.pd_left, prescription?.pd_left_mm,
    base?.pdLeft,  base?.pdOS,  base?.pd_left,  base?.pd_left_mm,
    deepBase?.pdLeft, deepBase?.pdOS, deepBase?.pd_left,
    dataLayer?.pdLeft, dataLayer?.pdOS, dataLayer?.pd_left, dataLayer?.pd_left_mm,
    pd?.pd_left_mm, pd?.pd_left, pd?.pdLeft, pd?.pdOS,
    flow?.pdLeft,
  );
  const pdSingle = firstDefined(
    prescription?.pdSingle, prescription?.pd_single, prescription?.pd_single_mm,
    base?.pdSingle,  base?.pd_single,  base?.pd_single_mm,
    deepBase?.pdSingle, deepBase?.pd_single,
    dataLayer?.pdSingle, dataLayer?.pd_single, dataLayer?.pd_single_mm,
    pd?.pd_single_mm, pd?.pd_single, pd?.pdSingle,
    flow?.pdSingle,
  );

  const rawPdType = firstDefined(
    prescription?.pdType, base?.pdType, deepBase?.pdType, dataLayer?.pdType,
    flow?.pdType,
    pdRight !== undefined && pdLeft !== undefined ? "dual"
      : pdSingle !== undefined ? "single" : undefined,
  ) ?? "single";

  const pdType = typeof rawPdType === "string"
    ? rawPdType.charAt(0).toUpperCase() + rawPdType.slice(1).toLowerCase()
    : "Single";

  const pdPatch: Record<string, any> = { pdType };
  if (pdSingle !== undefined) pdPatch.pdSingle = String(pdSingle);
  if (pdRight  !== undefined) pdPatch.pdRight  = String(pdRight);
  if (pdLeft   !== undefined) pdPatch.pdLeft   = String(pdLeft);

  return {
    ...prescription,
    ...pdPatch,
    prescriptionDetails: { ...deepBase, ...base, ...pdPatch },
    data: { ...dataLayer, ...pdPatch },
  };
}
const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationState = state as LocationState;
  const queryClient = useQueryClient();
  const hasRefetchedAfterEmpty = useRef(false);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"address" | "payment">("address");
  const [selectedValue, setSelectedValue] = useState<number | string>(200); // Default Stripe
  const [addressData, setAddressData] = useState<any>(null);
  const [isAddressFormValid, setIsAddressFormValid] = useState(false);
  const addressFormRef = useRef<{ submit: () => void }>(null);

  const [openCustomerCart, setCustomerCart] = useState(false);
  const userName = localStorage.getItem("firstName") || "User";

  const handleOpenCartView = () => setCustomerCart(true);
  const handleCloseCartView = () => setCustomerCart(false);

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      try {
        const response: any = await getPaymentModes();
        if (response?.data?.status) {
          // Filter out Cash on Delivery (Code 100)
          return response.data.pay_modes.filter(
            (mode: any) => mode.code != 100
          );
        }
        return [];
      } catch (error) {
        console.error("Failed to load payment modes", error);
        return [];
      }
    },
    retry: false,
  });

  const {
    data: cartData = {},
    refetch: refetchCart,
    isLoading: cartsLoading,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
  try {
    const response: any = await getCart({
      order_id: locationState?.order_id,
    });
    // Return data regardless of status flag — don't silently drop cart
    return response?.data || { cart: [] };
  } catch (error) {
    console.error("Failed to load cart", error);
    return { cart: [] };
  }
},
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const [waitingForMergedCart, setWaitingForMergedCart] = useState(false);

  // Refetch cart when it was merged after login (cart-updated) or when auth changed (login/logout)
  useEffect(() => {
    const onCartUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      refetchCart();
    };
    const onAuthChange = () => {
      setWaitingForMergedCart(true);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      refetchCart().finally(() => setWaitingForMergedCart(false));
    };
    window.addEventListener("cart-updated", onCartUpdated);
    window.addEventListener("auth-change", onAuthChange);
    return () => {
      window.removeEventListener("cart-updated", onCartUpdated);
      window.removeEventListener("auth-change", onAuthChange);
    };
  }, [queryClient, refetchCart]);

  // After login, if cart still empty refetch once (merge may complete just after auth-change)
  useEffect(() => {
    const cartItems = (cartData?.cart as CartItem[]) || [];
    const isAuthenticated = !!localStorage.getItem("token");
    if (
      cartItems.length === 0 &&
      isAuthenticated &&
      !cartsLoading &&
      !hasRefetchedAfterEmpty.current
    ) {
      hasRefetchedAfterEmpty.current = true;
      setWaitingForMergedCart(true);
      const t = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        refetchCart().finally(() => setWaitingForMergedCart(false));
      }, 600);
      return () => clearTimeout(t);
    }
    if (cartItems.length > 0) setWaitingForMergedCart(false);
  }, [cartData?.cart, cartsLoading, queryClient, refetchCart]);

  if (loading || paymentsLoading || cartsLoading) {
    return <Loader />;
  }

  const carts = (cartData?.cart as CartItem[]) || [];

  // Show loader while we refetch cart after login (so user never sees "0 products")
  if (carts.length === 0 && waitingForMergedCart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader />
        <p className="mt-4 text-sm font-medium text-[#1F1F1F]">Loading your cart...</p>
      </div>
    );
  }
const shippingCost = Number(
  cartData?.shipping_cost ??
  cartData?.shipping_method?.cost ??
  0
);

  // Build prescription from product_details (PD from SelectPrescriptionSource: Single or Dual)
  const buildPdPrescription = (pd: any) => {
    if (!pd) return null;
    const pdRight = pd.pd_right_mm ?? pd.pd_right;
    const pdLeft = pd.pd_left_mm ?? pd.pd_left;
    const pdSingle = pd.pd_single_mm ?? pd.pd_single;
    const pdType = pd.pd_type ?? (pdRight != null && pdLeft != null ? "dual" : "single");
    if (pdType === "dual" && pdRight != null && pdLeft != null) {
      return { pdType: "Dual", pdRight: String(pdRight), pdLeft: String(pdLeft) };
    }
    if (pdSingle != null) {
      return { pdType: "Single", pdSingle: String(pdSingle) };
    }
    return null;
  };

  const enrichedCarts = carts.map((item: any) => {
    if (item.prescription && Object.keys(item.prescription).length > 0) return item;

    try {
      const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
      
      let match = savedPrescriptions.find((p: any) => {
        const pCartId = p?.associatedProduct?.cartId || p?.data?.associatedProduct?.cartId;
        return pCartId && String(pCartId) === String(item.cart_id);
      });

      if (!match) {
        const skuid = item.product?.products?.skuid || item.product?.skuid;
        if (skuid && sessionPrescriptions[skuid]) {
          match = sessionPrescriptions[skuid];
        }
      }

 // AFTER — mirrors CustomerCartView buildMergedPrescription logic
if (match) {
  const sku = String(item.product?.products?.skuid || item.product_id || "");
  const merged = buildMergedPrescription(match, item, sku);
  return { ...item, prescription: merged };
}
      const pdPrescription = buildPdPrescription(item.product_details || {});
      if (pdPrescription) {
        return { ...item, prescription: pdPrescription };
      }
    } catch (err) {
      console.warn("Failed to enrich cart item with prescription:", err);
    }
    return item;
  }); // ← enrichedCarts ends here

  // ============================================================
  // 🔍 DEBUG — paste starts on THIS line, right after }); above
  // ============================================================
  console.group("📦 PAYMENT PAGE — PRESCRIPTION DEBUG");

  console.group("🛒 enrichedCarts");
  enrichedCarts.forEach((item: any, i: number) => {
    const pres = item.prescription;
    console.group(`[${i}] ${item.name || item.cart_id}`);
    console.log("cart_id   :", item.cart_id);
    console.log("pdType    :", pres?.pdType   ?? "❌ MISSING");
    console.log("pdSingle  :", pres?.pdSingle ?? "—");
    console.log("pdRight   :", pres?.pdRight  ?? "❌ MISSING");
    console.log("pdLeft    :", pres?.pdLeft   ?? "❌ MISSING");
    console.log("type      :", pres?.type     ?? "—");
    console.log("image_url :", pres?.image_url ?? "—");
    console.log("FULL obj  :", pres);
    console.groupEnd();
  });
  console.groupEnd();

  console.group("💾 localStorage 'prescriptions'");
  try {
    const raw = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    if (raw.length === 0) {
      console.warn("⚠️ EMPTY — nothing saved in localStorage");
    } else {
      raw.forEach((p: any, i: number) => {
        const d = p?.prescriptionDetails || p?.data || p;
        console.group(`[${i}] assoc: ${JSON.stringify(p?.associatedProduct)}`);
        console.log("pdType   :", d?.pdType   ?? "❌ MISSING");
        console.log("pdSingle :", d?.pdSingle ?? "—");
        console.log("pdRight  :", d?.pdRight  ?? "❌ MISSING");
        console.log("pdLeft   :", d?.pdLeft   ?? "❌ MISSING");
        console.log("FULL     :", d);
        console.groupEnd();
      });
    }
  } catch(e) { console.warn("parse error localStorage", e); }
  console.groupEnd();

  console.group("💾 sessionStorage 'productPrescriptions'");
  try {
    const sess = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
    const keys = Object.keys(sess);
    if (keys.length === 0) {
      console.warn("⚠️ EMPTY — nothing saved in sessionStorage");
    } else {
      keys.forEach((sku) => {
        const p = sess[sku];
        const d = p?.prescriptionDetails || p?.data || p;
        console.group(`sku: ${sku}`);
        console.log("pdType   :", d?.pdType   ?? "❌ MISSING");
        console.log("pdSingle :", d?.pdSingle ?? "—");
        console.log("pdRight  :", d?.pdRight  ?? "❌ MISSING");
        console.log("pdLeft   :", d?.pdLeft   ?? "❌ MISSING");
        console.log("FULL     :", d);
        console.groupEnd();
      });
    }
  } catch(e) { console.warn("parse error sessionStorage", e); }
  console.groupEnd();

 

  
  const products =
    enrichedCarts?.map((cart) => {
      return {
        lens: cart.lens,
        product: cart.product?.products,
        prescription: cart.prescription,
        retailer_lens_discount: cart.retailer_lens_discount || 0,
      };
    }) || [];

  // Calculate totals directly from backend response (matches Cart.tsx)
  // LAUNCH50 = always 50% off subtotal (same as cart)
 const listPrice = (() => {
  // calculateCartSubtotal reads localStorage lens overrides — may return 0 on payment page
  const frontend = calculateCartSubtotal(carts);
  if (frontend > 0) return frontend;
  // Fallback: sum directly from backend item prices
  const fromItems = carts.reduce((sum: number, item: any) => {
    const price = Number(item.price ?? item.total_price ?? item.item_total ?? 0);
    const qty = Number(item.quantity ?? 1);
    return sum + price * qty;
  }, 0);
  if (fromItems > 0) return fromItems;
  // Last resort: use backend subtotal
  return Number(cartData?.subtotal ?? 0);
})();
  const isLaunch50 = (cartData?.coupon?.code || "").toUpperCase() === "LAUNCH50";
  const offerAmount = isLaunch50 ? listPrice * 0.5 : (cartData?.discount_amount || 0);
  // Calculate total payable consistent with Cart.tsx
  const totalPayable = listPrice - offerAmount + shippingCost;

  // Backend currently doesn't separate tax in the summary response for Cart.tsx logic
  // So we default to 0 for display unless backend provides it explicitely later
  const taxAmount = 0;

  const offer = cartData?.coupon || null;

  const handlePaymentModeChange = (code: number | string) => {
    setSelectedValue(code);
  };

  const handlePlaceOrder = async (paymentData?: any) => {
    setLoading(true);

    // CRITICAL: Sync prescriptions to backend cart before placing order
    // This ensures that for Stripe/Online payments, the backend-generated order 
    // already has the prescriptions attached to the cart items.
    try {
      console.log("🔄 Syncing local prescriptions to backend cart before payment...");
      
      for (const item of enrichedCarts) {
        const originalItem = carts.find(c => c.cart_id === item.cart_id);
        const hasLocalPrescription = item.prescription && (!originalItem?.prescription || Object.keys(originalItem.prescription).length === 0);

        if (hasLocalPrescription) {
          console.log(`   Syncing local prescription for cart item ${item.cart_id}...`);
          const customerID = localStorage.getItem('customerID') || localStorage.getItem('user_id');
          const prescriptionData = item.prescription;
          
          await addPrescription(
            customerID,
            prescriptionData.type || "manual",
            prescriptionData.type || "manual",
            prescriptionData,
            item.cart_id
          );
          
          // Small delay between calls to prevent server race conditions (Internal Server Error 500)
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      console.log("✅ Prescription sync complete.");
    } catch (syncError) {
      console.warn("⚠️ Prescription sync failed, but proceeding with order:", syncError);
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}`;

    // If Payment Mode is Stripe (200) or Buy Now Pay Later (201), both redirect to same Stripe link
    if (selectedValue == 200 || selectedValue == 201) {
      try {
        // Prepare prescriptions for metadata safely
        // Stripe metadata has a 500-character limit per value. 
        // We split prescriptions into separate keys if there are multiple.
        // Stripe metadata has 500-char limit per value — keep a short summary there
        const prescriptionsMetadata: any = {};
        enrichedCarts.forEach((item, index) => {
          if (item.prescription) {
            const cleanPres = {
              type: item.prescription.type,
              url: item.prescription.image_url,
              name: item.name
            };
            prescriptionsMetadata[`pres_${index}`] = JSON.stringify(cleanPres).substring(0, 490);
          }
        });

        // Full prescription data for backend to store on the order (OD/OS, PD, prism, etc.)
     // Build prescriptionsForOrder from cart_items (already has correct lens data from localStorage overrides)
// 🔍 DEBUG — lens category check
        console.group("🔬 LENS DEBUG — what's in cart items");
        enrichedCarts.forEach((item: any, i: number) => {
          console.group(`  [${i}] ${item.name || item.cart_id}`);
          console.log("  lens raw object      :", item.lens);
          console.log("  lens.lensCategory    :", item.lens?.lensCategory ?? "❌ MISSING");
          console.groupEnd();
        });
        console.groupEnd();

        // ✅ cart_items MUST be defined before prescriptionsForOrder
     // In Payment.tsx inside handlePlaceOrder
const cart_items = enrichedCarts.map((item: any) => {
  const sku = String(item.product?.products?.skuid || item.product_id || "");
  const override = getCartLensOverride(item.cart_id) || (sku ? getCartLensOverrideBySku(sku) : null);

  const lensCategory = override?.lensCategory || item.lens?.lensCategory || item.lens?.lens_category || null;
  const lensIndexPackage = override?.lensPackage || item.lens?.id || null;
  const mainCategory = override?.mainCategory || item.lens?.main_category || null;
  const lensPackagePrice = override?.lensPackagePrice ?? item.lens?.selling_price ?? 0;
  const coatingTitle = override?.coatingTitle || item.lens?.coating || null;

  const lensCategoryDisplay = lensCategory === "blue" ? "Blue Protect"
    : lensCategory === "photo" ? "Photochromic"
    : lensCategory === "sun" ? "Sunglasses"
    : lensCategory === "clear" ? "Clear"
    : lensCategory || null;

  return {
    cart_id: item.cart_id,
    product_id: item.product_id,
    name: item.name,
    quantity: item.quantity ?? 1,
    price: parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0,
    product: {
      skuid: item.product?.products?.skuid,
      name: item.product?.products?.name,
      image: item.product?.products?.image,
    },
    lens: item.lens ? {
      id: item.lens.id,
      main_category: mainCategory,
      selling_price: lensPackagePrice,
      lensCategory: lensCategory,
      lensCategoryDisplay: lensCategoryDisplay,
      lensIndex: lensIndexPackage,
      coating: coatingTitle,
      title: lensIndexPackage ? `${lensIndexPackage} ${lensCategoryDisplay || "High Index"}` : null,
      
      // ✅ CORRECTED: Read from camelCase (override.tintType), map to snake_case key (tint_type)
      tint_color: override?.tintColor || null,
      tint_type: override?.tintType || null,
      tint_price: override?.tintPrice || 0,
    } : null,
    prescription: item.prescription,
    flag: item.flag,
  };
});

        // ✅ prescriptionsForOrder now reads from cart_items (which already has overrides applied)
        const prescriptionsForOrder = cart_items
          .filter((item: any) => item.prescription)
          .map((item: any) => ({
            cart_id: item.cart_id,
            product_id: item.product?.skuid || item.product_id,
            product_name: item.name,
            lens_category: item.lens?.lensCategory || null,
            lens_category_display: item.lens?.lensCategoryDisplay || null,
            lens_type: item.lens?.main_category || null,
            lens_package: item.lens?.lensIndex || item.lens?.id || null,
            lens_index: item.lens?.lensIndex || null,
            coating: item.lens?.coating || null,
            prescription: item.prescription,
          }));

// 🔍 DEBUG — lens category check
console.group("🔬 LENS DEBUG — what's in cart items");
enrichedCarts.forEach((item: any, i: number) => {
  console.group(`  [${i}] ${item.name || item.cart_id}`);
  console.log("  lens raw object      :", item.lens);
  console.log("  lens.id              :", item.lens?.id ?? "❌ MISSING");
  console.log("  lens.main_category   :", item.lens?.main_category ?? "❌ MISSING");
  console.log("  lens.lensCategory    :", item.lens?.lensCategory ?? "❌ MISSING");
  console.log("  lens.lens_category   :", item.lens?.lens_category ?? "❌ MISSING");
  console.log("  lens.title           :", item.lens?.title ?? "—");
  console.log("  lens.selling_price   :", item.lens?.selling_price ?? "—");
  console.groupEnd();
});
console.groupEnd();
   
console.log("💳 Sending to Stripe:", { totalPayable, listPrice, offerAmount, shippingCost });
console.group("📦 FINAL PAYLOAD — PRE-STRIPE CHECK");

console.group("🛒 enrichedCarts (what we built from localStorage)");
enrichedCarts.forEach((item: any, i: number) => {
  const pres = item.prescription;
  console.group(`  [${i}] ${item.name || item.cart_id}`);
  console.log("  cart_id          :", item.cart_id);
  console.log("  pdType           :", pres?.pdType   ?? "❌ MISSING");
  console.log("  pdSingle         :", pres?.pdSingle ?? "—");
  console.log("  pdRight          :", pres?.pdRight  ?? "❌ MISSING");
  console.log("  pdLeft           :", pres?.pdLeft   ?? "❌ MISSING");
  console.log("  type             :", pres?.type     ?? "—");
  console.log("  image_url        :", pres?.image_url ?? "—");
  console.log("  prescription raw :", pres);
  console.groupEnd();
});
console.groupEnd();

console.group("📋 prescriptionsForOrder (sent as prescriptions[])");
prescriptionsForOrder.forEach((p: any, i: number) => {
  const pres = p.prescription;
  console.group(`  [${i}] ${p.product_name}`);
  console.log("  pdType   :", pres?.pdType   ?? "❌ MISSING");
  console.log("  pdSingle :", pres?.pdSingle ?? "—");
  console.log("  pdRight  :", pres?.pdRight  ?? "❌ MISSING");
  console.log("  pdLeft   :", pres?.pdLeft   ?? "❌ MISSING");
  console.log("  full     :", pres);
  console.groupEnd();
});
console.groupEnd();

console.group("🧾 cart_items[].prescription");
cart_items.forEach((item: any, i: number) => {
  const pres = item.prescription;
  console.group(`  [${i}] ${item.name}`);
  console.log("  pdType   :", pres?.pdType   ?? "❌ MISSING");
  console.log("  pdSingle :", pres?.pdSingle ?? "—");
  console.log("  pdRight  :", pres?.pdRight  ?? "❌ MISSING");
  console.log("  pdLeft   :", pres?.pdLeft   ?? "❌ MISSING");
  console.log("  full     :", pres);
  console.groupEnd();
});
console.groupEnd();

console.group("💾 localStorage 'prescriptions' RAW");
try {
  const raw = JSON.parse(localStorage.getItem('prescriptions') || '[]');
  raw.forEach((p: any, i: number) => {
    const d = p?.prescriptionDetails || p?.data || p;
    console.group(`  [${i}]`);
    console.log("  associatedProduct :", p?.associatedProduct);
    console.log("  pdType   :", d?.pdType   ?? "❌ MISSING");
    console.log("  pdSingle :", d?.pdSingle ?? "—");
    console.log("  pdRight  :", d?.pdRight  ?? "❌ MISSING");
    console.log("  pdLeft   :", d?.pdLeft   ?? "❌ MISSING");
    console.groupEnd();
  });
} catch (e) { console.warn("Could not parse prescriptions", e); }
console.groupEnd();

console.groupEnd(); // 📦 end FINAL PAYLOAD
        const sessionRes = await createPaymentSession({
          order_id: orderId,
          amount: totalPayable,
          currency: "GBP",
          prescriptions: prescriptionsForOrder,
          // Backend must persist these on the order so order details show correct totals and line items
          cart_items,
          subtotal: listPrice,
          discount_amount: offerAmount,
          shipping_cost: shippingCost,
          total_payable: totalPayable,
          metadata: {
            customer_id: localStorage.getItem("customerID"),
            address: JSON.stringify(addressData).substring(0, 490),
            ...prescriptionsMetadata,
            cart_summary: JSON.stringify({
              items_count: carts.length,
              subtotal: listPrice,
              discount: offerAmount,
              tax: taxAmount,
              shipping: shippingCost,
            }, null, 2).substring(0, 490)
          }
        });

        if (sessionRes.data.success && sessionRes.data.payment_url) {
          // Store cart + totals so PaymentSuccess can sync order (fix £0 order after payment)
          try {
            sessionStorage.setItem(
              "multifolks_pending_order_sync",
              JSON.stringify({
                order_id: orderId,
                cart_items,
                subtotal: listPrice,
                discount_amount: offerAmount,
                shipping_cost: shippingCost,
                total_payable: totalPayable,
              })
            );
          } catch (_) {}
          // Redirect to Stripe payment page
          window.location.href = sessionRes.data.payment_url;
          return;
        } else {
          const errMsg = sessionRes.data?.error || "Unknown error";
          console.error("Failed to create payment session", sessionRes);
          alert(`Failed to initiate payment: ${errMsg}`);
          setLoading(false);
        }
      } catch (error: any) {
        const errMsg = error?.response?.data?.detail || error?.response?.data?.error || error?.message || "Unknown error";
        console.error("Error creating payment session:", error);
        alert(`Error initiating payment: ${typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg)}`);
        setLoading(false);
      }
    } else {
      // For COD or other payment methods, still use the old flow
      // TODO: Implement real backend order creation for COD
      const finalPayload = {
        customer_id: localStorage.getItem("customerID"),
        address_id: locationState?.address_id,
        pay_mode: selectedValue,
        transaction_id: paymentData?.transaction_id,
        is_partial: locationState?.is_partial,
      };

      placeOrder(finalPayload)
        .then((res: any) => {
          if (res?.data?.status) {
            const orderId = res?.data?.order_id;
            navigate("/thank-you", {
              state: {
                order_id: orderId,
                invoice_number: res?.data?.invoice_no,
              },
            });
          } else {
            alert("Failed to place order. Please try again.");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          alert("Error placing order. Please try again.");
        });
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-white font-sans pb-20 text-[#1F1F1F]">
        {/* Header - Custom Payment Header */}
        <header className="hidden md:flex w-full bg-white h-[80px] items-center justify-center border-b border-gray-100 sticky top-0 z-50 shadow-sm">
          <div className="w-full max-w-[1400px] px-4 md:px-8 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <img
                src="/Multifolks.png"
                alt="Multifolks logo"
                width="160"
                height="40"
                loading="lazy"
                className="h-8 md:h-10 w-auto"
              />
            </a>

            {/* Stepper - Matching Cart.tsx */}
            <div className="hidden md:flex items-center gap-4 text-xs md:text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-[#025048] font-bold text-base cursor-pointer" onClick={() => navigate("/cart")}>My Bag</span>
                <div className="w-12 md:w-24 h-[1px] bg-[#025048]"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base ${step === 'address' ? 'text-[#025048]' : 'text-[#025048]'}`}>Address</span>
                <div className={`w-12 md:w-24 h-[1px] ${step === 'payment' ? 'bg-[#025048]' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-medium text-base ${step === 'payment' ? 'text-[#025048] font-bold' : 'text-gray-300'}`}>Payment</span>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:text-[#1F1F1F] transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="text-[10px] font-bold uppercase mt-1">{userName}</span>
            </div>
          </div>
        </header>

        <div className="w-full py-12 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Forms */}
              <div className="lg:col-span-2">
                
                {/* --- MOBILE ONLY: Delivery Address, Shipping Method, Summary --- */}
                <div className="md:hidden mb-8 space-y-6">
                    
                    {/* Delivery Address Card - Show when addressData exists (typically on Payment step or after filling form) */}
                    {addressData && (
                        <div>
                            <h3 className="text-sm font-bold text-[#1F1F1F] mb-3 font-sans">
                                Delivery Address
                            </h3>
                            <div className="bg-white border border-gray-300 p-4 rounded-sm shadow-sm">
                                <p className="font-bold text-[#1F1F1F] text-sm">
                                    {addressData.fullName}
                                </p>
                                <p className="text-sm text-[#525252] mt-1">
                                    Tel. - {addressData.mobile}
                                </p>
                                <p className="text-sm text-[#525252] mt-2">
                                    {addressData.addressLine}
                                </p>
                                <p className="text-sm text-[#525252]">
                                    {[addressData.city, addressData.zip].filter(Boolean).join(" ")}
                                    {addressData.state && `, ${addressData.state}`}
                                    {addressData.country && `, ${addressData.country}`}
                                </p>
                            </div>
                        </div>
                    )}
{/* Summary Card - Cart item count + View Details */}
<div>
  <h3 className="text-sm font-bold text-[#1F1F1F] mb-3 font-sans">
    Summary
  </h3>
  <div className="bg-white border border-gray-300 p-4 flex justify-between items-center rounded-sm shadow-sm">
    <span className="text-sm font-bold text-[#1F1F1F]">
      Your Cart ( {carts.length} Item{carts.length !== 1 ? "s" : ""} )
    </span>
    <button
      onClick={handleOpenCartView}
      className="text-xs font-bold text-[#FF9900] underline hover:text-[#e68a00] transition-colors bg-transparent border-none p-0 focus:outline-none"
    >
      View Details
    </button>
  </div>
</div>
                    {/* Shipping Method Card - Replicated from desktop logic */}
                    {(() => {
                        const methodId = (locationState as any)?.shippingMethod
                            || sessionStorage.getItem("cartShippingMethod")
                            || cartData?.shipping_method?.id
                            || (shippingCost >= 29 ? "express" : "standard");
                        const isExpress = methodId === "express";
                        return (
                            <div>
                                <h3 className="text-sm font-bold text-[#1F1F1F] mb-3 font-sans">
                                    Shipping method
                                </h3>
                                <div className="bg-white border border-gray-300 p-4 rounded-sm shadow-sm">
                                    <p className="font-bold text-[#1F1F1F] text-sm">
                                        {isExpress ? "Express Shipping" : "Standard Shipping"}
                                    </p>
                                    <p className="text-sm text-[#525252] mt-1">
                                        {isExpress ? "4-6 working days" : "8-12 working days"}
                                    </p>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Price Summary Card - Replicated for mobile */}
                    <div>
                        <h3 className="text-sm font-bold text-[#1F1F1F] mb-3 font-sans">
                            Price Summary
                        </h3>
                        <div className="bg-white p-4 border border-gray-300 rounded-sm space-y-3 shadow-sm">
                            <div className="flex justify-between text-sm font-bold text-[#1F1F1F]">
                                <span>Price</span>
                                <span>£{listPrice.toFixed(0)}</span>
                            </div>

                            {offerAmount > 0 && (
                                <div className="flex justify-between text-sm font-bold text-[#00C853]">
                                    <span>Discount {offer?.code ? `(${offer.code})` : ""}</span>
                                    <span>- £{offerAmount.toFixed(0)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm font-bold text-[#00C853]">
                                <span>Taxes</span>
                                <span>£{taxAmount?.toFixed(0) || "0"}</span>
                            </div>

                            <div className="flex justify-between text-sm font-bold text-[#1F1F1F]">
                                <span>Shipping</span>
                                <span>£{shippingCost?.toFixed(0) || "0"}</span>
                            </div>

                            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold text-[#1F1F1F]">
                                <span>Total Payable</span>
                                <span>£{totalPayable.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* --- END MOBILE ONLY SECTION --- */}

                {step === "address" ? (
                  <AddressForm
                    ref={addressFormRef}
                    onNext={(data) => {
                      setAddressData(data);
                      // GA4: add_shipping_info – user submitted shipping information during checkout
                      trackAddShippingInfo({
                        cartItems: carts,
                        value: totalPayable,
                        currency: "GBP",
                        shippingTier: (locationState as any)?.shippingMethod
                          || sessionStorage.getItem("cartShippingMethod")
                          || (shippingCost >= 29 ? "express" : "standard"),
                      });
                      if (window.innerWidth < 768) {
                        setCustomerCart(true); // Mobile: Show intermediate review
                      } else {
                        setStep("payment"); // Desktop: Proceed directly
                      }
                    }}
                    onFormValidityChange={setIsAddressFormValid}
                  />
                ) : (
                  <PaymentModes
                    selectedValue={selectedValue}
                    payments={payments}
                    handlePaymentModeChange={handlePaymentModeChange}
                    handlePlaceOrder={handlePlaceOrder}
                    loading={loading}
                    onBack={() => setStep("address")}
                    addressData={addressData}
                  />
                )}
              </div>

              {/* Right Column: Delivery Address + Summary / Payment details */}
              <div className="lg:col-span-1 hidden md:block flex flex-col gap-6">
                {/* Delivery Address - shown when address is set */}
                {addressData && (
                  <div>
                    <h3 className="text-sm font-bold text-[#1F1F1F] mb-3 font-sans">
                      Delivery Address
                    </h3>
                    <div className="bg-white border border-gray-300 p-4 rounded-sm shadow-sm">
                      <p className="font-bold text-[#1F1F1F] text-sm">
                        {addressData.fullName}
                      </p>
                      <p className="text-sm text-[#525252] mt-1">
                        Tel. - {addressData.mobile}
                      </p>
                      <p className="text-sm text-[#525252] mt-2">
                        {addressData.addressLine}
                      </p>
                      <p className="text-sm text-[#525252]">
                        {[addressData.city, addressData.zip].filter(Boolean).join(" ")}
                        {addressData.state && `, ${addressData.state}`}
                        {addressData.country && `, ${addressData.country}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Shipping method - from cart or session */}
                {(() => {
                  const methodId = (locationState as any)?.shippingMethod
                    || sessionStorage.getItem("cartShippingMethod")
                    || cartData?.shipping_method?.id
                    || (shippingCost >= 29 ? "express" : "standard");
                  const isExpress = methodId === "express";
                  return (
                    <div className="pt-6">
                      <h3 className="text-sm font-bold text-[#1F1F1F] mb-3 font-sans">
                        Shipping method
                      </h3>
                      <div className="bg-white border border-gray-300 p-4 rounded-sm shadow-sm">
                        <p className="font-bold text-[#1F1F1F] text-sm">
                          {isExpress ? "Express Shipping" : "Standard Shipping"}
                        </p>
                        <p className="text-sm text-[#525252] mt-1">
                          {isExpress ? "4-6 working days" : "8-12 working days"}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-6">
                 <CheckoutSummary
  cartItems={carts}
  subtotal={listPrice}
  discountAmount={offerAmount}
  total={totalPayable}
  couponCode={offer?.code}
  taxAmount={taxAmount}
  shippingCost={shippingCost}
  onOpenCart={handleOpenCartView}
  isFormDisabled={step === "address" && !isAddressFormValid}
  buttonText={step === "address" ? "Checkout Now" : "Pay Now"}
  enrichedCarts={enrichedCarts}
  onCheckout={step === "address" ? () => {
    addressFormRef.current?.submit();
  } : () => handlePlaceOrder()}
  />
                </div>
              </div>

              {/* Mobile Fixed Footer */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] md:hidden px-4 py-4 pt-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col gap-4">
                  {/* Price Display */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      £{totalPayable.toFixed(0)}
                    </p>
                  </div>

                  {/* Submission Button */}
                  <button
                    onClick={step === "address" ? () => {
                      addressFormRef.current?.submit();
                    } : () => handlePlaceOrder()}
                    disabled={step === "address" && !isAddressFormValid}
                    className="w-full bg-[#E94D37] text-white py-4 rounded font-bold text-sm tracking-widest uppercase hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {step === "address" ? "SUBMIT ADDRESS" : "Pay Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CustomerCartView
          open={openCustomerCart}
          close={handleCloseCartView}
          carts={carts}
          refetch={refetchCart}
          shippingCost={shippingCost}
          discountAmount={offerAmount}
          onCheckout={window.innerWidth < 768 ? () => {
            if (openCustomerCart && step === "address") {
              setStep("payment");
            }
            handleCloseCartView();
          } : undefined}
          buttonText={window.innerWidth < 768 ? "SUBMIT" : undefined}
        />
      </div>
    </Elements>
  );
};
  
export default Payment;