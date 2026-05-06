"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";

const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

function msg(e: any, fallback = "Request failed") {
  return e?.response?.data?.error || e?.message || fallback;
}

/* ---------------------------------- Get User By ID ---------------------------------- */

export async function getUserById(userId: string) {
  try {
    console.log("📋 Fetching user:", userId);

    const res = await api.get(`/users/${userId}`);

    return {
      success: true,
      data: res.data?.data,
    };
  } catch (e: any) {
    console.error("❌ Error fetching user:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to fetch user"),
      data: null,
    };
  }
}

/* ---------------------------------- Update User Profile ---------------------------------- */

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export async function updateUserProfile(userId: string, data: UpdateProfileData) {
  try {
    console.log("✏️ Updating user profile:", userId);

    const res = await api.put(`/users/${userId}`, {
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
    });

    revalidatePath("/account");
    revalidatePath("/");

    console.log("✅ Profile updated successfully");

    return {
      success: true,
      data: res.data?.data,
    };
  } catch (e: any) {
    console.error("❌ Error updating profile:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to update profile"),
    };
  }
}

/* ---------------------------------- Change Password ---------------------------------- */

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  try {
    console.log("🔐 Changing password for user:", userId);

    const res = await api.post(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });

    console.log("✅ Password changed successfully");

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (e: any) {
    console.error("❌ Error changing password:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to change password"),
    };
  }
}

/* ---------------------------------- Update Email ---------------------------------- */

export async function updateEmail(userId: string, newEmail: string) {
  try {
    console.log("📧 Updating email for user:", userId);

    const res = await api.post(`/users/${userId}/update-email`, {
      email: newEmail,
    });

    revalidatePath("/account");

    console.log("✅ Email update initiated");

    return {
      success: true,
      message: res.data?.message || "Verification email sent",
    };
  } catch (e: any) {
    console.error("❌ Error updating email:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to update email"),
    };
  }
}

/* ---------------------------------- Delete Account ---------------------------------- */

export async function deleteAccount(userId: string, password: string) {
  try {
    console.log("🗑️ Deleting account:", userId);

    const res = await api.post(`/users/${userId}/delete`, {
      password,
    });

    console.log("✅ Account deleted");

    return {
      success: true,
      message: res.data?.message,
    };
  } catch (e: any) {
    console.error("❌ Error deleting account:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to delete account"),
    };
  }
}

/* ---------------------------------- Upload Profile Picture ---------------------------------- */

export async function uploadProfilePicture(userId: string, formData: FormData) {
  try {
    console.log("📸 Uploading profile picture:", userId);

    const res = await api.post(`/users/${userId}/upload-picture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    revalidatePath("/account");
    revalidatePath("/");

    console.log("✅ Profile picture uploaded");

    return {
      success: true,
      imageUrl: res.data?.data?.imageUrl,
    };
  } catch (e: any) {
    console.error("❌ Error uploading picture:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to upload profile picture"),
    };
  }
}

/* ---------------------------------- Get User Statistics ---------------------------------- */

export async function getUserStatistics(userId: string) {
  try {
    console.log("📊 Fetching user statistics:", userId);

    const res = await api.get(`/users/${userId}/statistics`);

    return {
      success: true,
      data: res.data?.data,
    };
  } catch (e: any) {
    console.error("❌ Error fetching statistics:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to fetch statistics"),
      data: null,
    };
  }
}