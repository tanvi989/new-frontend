

import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import AccountSidebar from "../components/AccountSidebar";
import { updateProfile, getProfile } from '../api/retailerApis';

interface ProfileData {
  gender: "male" | "female" | null;
  birthDate: string;
  birthMonth: string;
  birthYear: string;
  name: string;
  email: string;
  mobile: string;
}

const MyProfile: React.FC = () => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Load user data from localStorage
  const firstName = localStorage.getItem("firstName") || "User";
  const lastName = localStorage.getItem("lastName") || "";
  const email = localStorage.getItem("email") || "";
  const phone = localStorage.getItem("phone") || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const [profileData, setProfileData] = useState<ProfileData>({
    gender: null,
    birthDate: "",
    birthMonth: "",
    birthYear: "",
    name: fullName,
    email: email,
    mobile: phone,
  });

  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editFormData, setEditFormData] = useState({
    firstName: firstName,
    lastName: lastName,
    address: "",
    contactNumber: phone,
    email: email,
    shopAddress: "",
    storeId: "",
    retailShopName: "",
    bankDetails: "",
    gstNumber: "",
    panNumber: "",
    billingAddress: "",
    shippingAddress: "",
  });

  // ✅ NEW: Fetch profile data from backend on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        if (response && response.data) {
          const data = response.data.data || response.data || {};

          // Update profile data state with backend data
          setProfileData(prev => ({
            ...prev,
            gender: (data.gender as "male" | "female") || prev.gender,
            birthDate: data.birth_date || localStorage.getItem("birthDate") || prev.birthDate,
            birthMonth: data.birth_month || localStorage.getItem("birthMonth") || prev.birthMonth,
            birthYear: data.birth_year || localStorage.getItem("birthYear") || prev.birthYear,
            name: (data.first_name || data.name) ? `${data.first_name || ''} ${data.last_name || ''}`.trim() : prev.name,
            email: data.email || prev.email,
            mobile: data.contact_number || prev.mobile,
          }));

          // Also populate edit form with backend values when available
          setEditFormData(prev => ({
            ...prev,
            firstName: data.first_name || prev.firstName,
            lastName: data.last_name || prev.lastName,
            address: data.address || prev.address,
            contactNumber: data.contact_number || prev.contactNumber,
            email: data.email || prev.email,
            shopAddress: data.shop_address || prev.shopAddress,
            storeId: data.store_id || prev.storeId,
            retailShopName: data.retail_shop_name || prev.retailShopName,
            bankDetails: data.bank_details || prev.bankDetails,
            gstNumber: data.gst_number || prev.gstNumber,
            panNumber: data.pan_number || prev.panNumber,
            billingAddress: data.billing_address || prev.billingAddress,
            shippingAddress: data.shipping_address || prev.shippingAddress,
          }));

          // Also update localStorage
          if (data.gender) localStorage.setItem("gender", data.gender);
          if (data.birth_date) localStorage.setItem("birthDate", data.birth_date);
          if (data.birth_month) localStorage.setItem("birthMonth", data.birth_month);
          if (data.birth_year) localStorage.setItem("birthYear", data.birth_year);
          if (data.first_name) localStorage.setItem("firstName", data.first_name);
          if (data.last_name) localStorage.setItem("lastName", data.last_name);
          if (data.email) localStorage.setItem("email", data.email);
          if (data.contact_number) localStorage.setItem("phone", data.contact_number);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to localStorage if API fails
        setProfileData(prev => ({
          ...prev,
          gender: (localStorage.getItem("gender") as "male" | "female") || prev.gender,
          birthDate: localStorage.getItem("birthDate") || prev.birthDate,
          birthMonth: localStorage.getItem("birthMonth") || prev.birthMonth,
          birthYear: localStorage.getItem("birthYear") || prev.birthYear,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Check if user has completed profile setup
  useEffect(() => {
    const checkProfileSetup = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const hasCompletedSetup = localStorage.getItem('profileSetupComplete');
        if (!hasCompletedSetup) {
          setShowWelcomePopup(true);
        }
      } catch (error) {
        console.error('Error checking profile setup:', error);
      }
    };

    checkProfileSetup();
  }, []);

  const handleSubmitWelcome = async () => {
    if (
      profileData.gender &&
      profileData.birthDate &&
      profileData.birthMonth &&
      profileData.birthYear
    ) {
      try {
        console.log('📤 Submitting profile data:', profileData);

        const response = await updateProfile({
          gender: profileData.gender,
          birth_date: profileData.birthDate,
          birth_month: profileData.birthMonth,
          birth_year: profileData.birthYear
        });

        console.log('✅ Profile update response:', response);

        if (response.data?.success) {
          // Store in localStorage for immediate access
          localStorage.setItem("profileSetupComplete", "true");
          localStorage.setItem("gender", profileData.gender);
          localStorage.setItem("birthDate", profileData.birthDate);
          localStorage.setItem("birthMonth", profileData.birthMonth);
          localStorage.setItem("birthYear", profileData.birthYear);

          // ✅ Close modal AFTER data is saved
          setShowWelcomePopup(false);

          // Show success message
          alert('Profile updated successfully!');
        } else {
          console.error('❌ Update failed:', response.data);
          alert('Failed to save profile data. Please try again.');
        }
      } catch (error: any) {
        console.error('❌ Error saving profile data:', error);
        console.error('Error details:', error?.response?.data);
        alert(`Failed to save profile data: ${error?.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        first_name: editFormData.firstName,
        last_name: editFormData.lastName,
        address: editFormData.address,
        contact_number: editFormData.contactNumber,
        email: editFormData.email,
        shop_address: editFormData.shopAddress,
        store_id: editFormData.storeId,
        retail_shop_name: editFormData.retailShopName,
        bank_details: editFormData.bankDetails,
        gst_number: editFormData.gstNumber,
        pan_number: editFormData.panNumber,
        billing_address: editFormData.billingAddress,
        shipping_address: editFormData.shippingAddress,
      };

      const response = await updateProfile(payload);
      if (response.data?.success) {
        // Update UI and localStorage
        setProfileData(prev => ({
          ...prev,
          name: `${editFormData.firstName} ${editFormData.lastName}`.trim(),
          email: editFormData.email,
          mobile: editFormData.contactNumber,
        }));

        localStorage.setItem('firstName', editFormData.firstName);
        localStorage.setItem('lastName', editFormData.lastName);
        localStorage.setItem('email', editFormData.email);
        localStorage.setItem('phone', editFormData.contactNumber);

        setShowEditModal(false);
        alert('Profile saved successfully');
      } else {
        console.error('Save failed', response.data);
        alert('Failed to save profile.');
      }
    } catch (err: any) {
      console.error('Error saving profile', err);
      alert(err?.response?.data?.detail || 'Failed to save profile');
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <>
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#1F1F1F] font-serif">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">FIRST NAME</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#1F1F1F] focus:outline-none focus:border-[#232320]"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">LAST NAME</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#1F1F1F] focus:outline-none focus:border-[#232320]"
                  />
                </div>

                {/* Address */}
                {/* <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">ADDRESS</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#1F1F1F] focus:outline-none focus:border-[#232320]"
                  />
                </div> */}

                {/* Contact Number */}
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">CONTACT NUMBER</label>
                  <input
                    type="text"
                    value={editFormData.contactNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#1F1F1F] focus:outline-none focus:border-[#232320]"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#1F1F1F] focus:outline-none focus:border-[#232320]"
                  />
                </div>

              
                {/* Billing Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">BILLING ADDRESS</label>
                  <input
                    type="text"
                    value={editFormData.billingAddress}
                    onChange={(e) => setEditFormData({ ...editFormData, billingAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#1F1F1F] focus:outline-none focus:border-[#232320]"
                    placeholder="Enter Billing Address"
                  />
                </div>

                {/* Shipping Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">SHIPPING ADDRESS</label>
                  <input
                    type="text"
                    value={editFormData.shippingAddress}
                    onChange={(e) => setEditFormData({ ...editFormData, shippingAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#1F1F1F] focus:outline-none focus:border-[#232320]"
                    placeholder="Enter Shipping Address"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  className="bg-[#232320] text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-black transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Popup Modal */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-[600px] w-full overflow-hidden">
            {/* Header */}
            <div className="bg-[#232320] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">LET US KNOW YOU BETTER...</h2>
              <button onClick={() => setShowWelcomePopup(false)} className="text-white hover:text-gray-300 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Content Body with Background */}
            <div className="relative p-8 md:p-12 min-h-[400px]">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img src="https://img.freepik.com/free-photo/top-view-birthday-accessories-with-copyspace_23-2148565543.jpg" alt="Birthday Background" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-white/60"></div>
              </div>

              <div className="relative z-10 space-y-10">
                {/* Gender Selection */}
                <div className="flex items-center justify-between">
                  <label className="text-lg font-medium text-[#1F1F1F]">I am</label>
                  <div className="flex gap-12 mr-8">
                    <button onClick={() => setProfileData({ ...profileData, gender: "male" })} className={`relative transition-transform hover:scale-110 ${profileData.gender === "male" ? "scale-110" : ""}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${profileData.gender === "male" ? "border-[#007EA7] bg-white" : "border-transparent bg-[#007EA7]"}`}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={profileData.gender === "male" ? "#007EA7" : "white"} strokeWidth="2"><circle cx="12" cy="8" r="5"></circle><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"></path></svg>
                      </div>
                      {profileData.gender === "male" && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#007EA7] rounded-full" />}
                    </button>

                    <button onClick={() => setProfileData({ ...profileData, gender: "female" })} className={`relative transition-transform hover:scale-110 ${profileData.gender === "female" ? "scale-110" : ""}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${profileData.gender === "female" ? "border-[#FF4D6D] bg-white" : "border-transparent bg-[#FF4D6D]"}`}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={profileData.gender === "female" ? "#FF4D6D" : "white"} strokeWidth="2"><path d="M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"></path><path d="M16 11v1a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-1"></path><path d="M12 16v5"></path><path d="M9 19h6"></path></svg>
                      </div>
                      {profileData.gender === "female" && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FF4D6D] rounded-full" />}
                    </button>
                  </div>
                </div>

                {/* Birthday Selection */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <label className="text-lg font-medium text-[#1F1F1F]">My</label>
                    <label className="text-lg font-medium text-[#1F1F1F]">Birthday</label>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <select value={profileData.birthDate} onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })} className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded bg-white text-sm font-medium text-gray-600 focus:outline-none focus:border-[#232320] min-w-[80px]">
                        <option value="">Date</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </div>

                    <div className="relative">
                      <select value={profileData.birthMonth} onChange={(e) => setProfileData({ ...profileData, birthMonth: e.target.value })} className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded bg-white text-sm font-medium text-gray-600 focus:outline-none focus:border-[#232320] min-w-[100px]">
                        <option value="">Month</option>
                        {months.map((month, idx) => <option key={month} value={idx + 1}>{month}</option>)}
                      </select>
                    </div>

                    <div className="relative">
                      <select value={profileData.birthYear} onChange={(e) => setProfileData({ ...profileData, birthYear: e.target.value })} className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded bg-white text-sm font-medium text-gray-600 focus:outline-none focus:border-[#232320] min-w-[80px]">
                        <option value="">Year</option>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button onClick={handleSubmitWelcome} disabled={!profileData.gender || !profileData.birthDate || !profileData.birthMonth || !profileData.birthYear} className="bg-[#1B4B43] text-white px-12 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#153a34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    SUBMIT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Page */}
      <div className="min-h-screen bg-white">
        {/* Full Width Banner */}
        <div className="w-full h-[300px] bg-[#E8F0FE] relative overflow-hidden">
          {/* Background Pattern/Image */}
          <div className="absolute inset-0 flex items-center justify-center opacity-80">
            <img src="myaccnt_bnr.jpg" alt="Dashboard Banner" className="w-full h-full object-cover opacity-50 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
          </div>

          {/* MY DASHBOARD Text - Centered Right in Banner */}
          <div className="absolute inset-y-0 right-8 md:right-16 flex items-center z-10">
            <div className="bg-white px-8 md:px-12 py-4 md:py-5 shadow-lg">
              <h1 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] uppercase tracking-wide whitespace-nowrap">MY DASHBOARD</h1>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 pb-20">
          <div className="flex flex-col md:flex-row gap-6 relative">
            {/* Sidebar - Overlapping Banner */}
            <div className="w-full md:w-[280px] md:min-w-[280px] md:max-w-[280px] flex-shrink-0 relative z-30 mt-0">
              <AccountSidebar activeItem="MY PROFILE" />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 pt-16">
              {/* Welcome Message */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1F1F1F] mb-2">Hello, {profileData.name.split(" ")[0]}!</h1>
                <p className="text-gray-600 text-sm">Update your personal details here. Select a link below to edit information.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Profile Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-[#1F1F1F] uppercase tracking-wide flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#232320] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      MY PROFILE
                    </h2>
                    <button onClick={() => setShowEditModal(true)} className="text-red-500 text-sm font-semibold hover:text-red-600 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Edit
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">Personal Information</p>

                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="text-sm font-medium text-gray-600">Name :</span>
                      <span className="text-sm font-semibold text-[#1F1F1F]">{profileData.name}</span>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="text-sm font-medium text-gray-600">Email :</span>
                      <span className="text-sm font-semibold text-[#1F1F1F]">{profileData.email}</span>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="text-sm font-medium text-gray-600">Contact :</span>
                      <span className="text-sm font-semibold text-[#1F1F1F]">{profileData.mobile}</span>
                    </div>

                    {/* Address & shop details show from editFormData when available */}
                    {/* {(editFormData.address || editFormData.shopAddress) && (
                      <>
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                          <span className="text-sm font-medium text-gray-600">Address :</span>
                          <span className="text-sm font-semibold text-[#1F1F1F]">{editFormData.address || '-'}</span>
                        </div>
                      </>
                    )} */}

                    {/* ✅ Show DOB if available */}
                    {profileData.birthDate && profileData.birthMonth && profileData.birthYear && (
                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-sm font-medium text-gray-600">DOB :</span>
                        <span className="text-sm font-semibold text-[#1F1F1F]">{profileData.birthDate}/{profileData.birthMonth}/{profileData.birthYear}</span>
                      </div>
                    )}

                    {/* ✅ Show Gender if available */}
                    {profileData.gender && (
                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-sm font-medium text-gray-600">Gender :</span>
                        <span className="text-sm font-semibold text-[#1F1F1F] capitalize">{profileData.gender}</span>
                      </div>
                    )}

                    <button className="text-red-500 text-sm font-medium hover:underline mt-4 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Notification Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-[#1F1F1F] uppercase tracking-wide flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                      </div>
                      NOTIFICATION
                    </h2>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1F1F1F]">Get Notification on Whatsapp</p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      </div>
                    </div>
                    <button onClick={() => setNotificationEnabled(!notificationEnabled)} className={`w-12 h-6 rounded-full transition-colors ${notificationEnabled ? "bg-[#25D366]" : "bg-gray-300"} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notificationEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>

                {/* Billing Address Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-[#1F1F1F] uppercase tracking-wide flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#8B4513] flex items-center justify-center text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
                      BILLING ADDRESS
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-sm font-medium text-gray-600">Address :</span>
                        <span className="text-sm font-semibold text-[#1F1F1F]">{editFormData.billingAddress || "-"}</span>
                      </div>
                      <button onClick={() => setShowEditModal(true)} className="text-red-500 text-sm font-semibold hover:text-red-600 flex items-center gap-1 mt-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-[#1F1F1F] uppercase tracking-wide flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#8B4513] flex items-center justify-center text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
                      SHIPPING ADDRESS
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="text-sm font-medium text-gray-600">Address :</span>
                        <span className="text-sm font-semibold text-[#1F1F1F]">{editFormData.shippingAddress || "-"}</span>
                      </div>
                      <button onClick={() => setShowEditModal(true)} className="text-red-500 text-sm font-semibold hover:text-red-600 flex items-center gap-1 mt-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfile;

