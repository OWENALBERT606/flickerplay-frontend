
// // app/actions/auth.ts
// "use server";

// import axios from "axios";
// import { revalidatePath } from "next/cache";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

// /** ========= Axios ========= **/
// const BASE_API_URL = process.env.API_URL || "";
// const api = axios.create({
//   baseURL: BASE_API_URL,
//   timeout: 10000,
//   headers: { "Content-Type": "application/json" },
// });

// /** ========= Types ========= **/
// interface BackendUser {
//   id: string;
//   email: string;
//   role: string;
//   firstName?: string;
//   lastName?: string;
//   phone?: string;
//   imageUrl?: string;
//   status?: string;
// }

// interface LoginSuccessPayload {
//   user: BackendUser;
//   accessToken: string;
//   refreshToken: string;
// }

// interface LoginResponse {
//   success: boolean;
//   data?: LoginSuccessPayload;
//   error?: string;
// }

// /** ========= Cookie Helpers ========= **/
// const setCookies = async (
//   accessToken: string,
//   refreshToken: string,
//   userData: BackendUser
// ) => {
//   const cookieStore = await cookies();

//   cookieStore.set("accessToken", accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     maxAge: 60 * 60 * 24 * 7, // 1 week
//   });

//   cookieStore.set("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     maxAge: 60 * 60 * 24 * 30, // 30 days
//   });

//   // keep userData server-only as well
//   cookieStore.set("userData", JSON.stringify(userData), {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });
// };

// const clearCookies = async () => {
//   const cookieStore = await cookies();
//   cookieStore.delete("accessToken");
//   cookieStore.delete("refreshToken");
//   cookieStore.delete("userData");
// };


// export async function loginUser(data: {
//   identifier: string; // email OR phone
//   password: string;
// }): Promise<LoginResponse> {
//   try {
//     const res = await api.post("/login", data);
//     const { user, accessToken, refreshToken } = res.data.data as LoginSuccessPayload;
//     await setCookies(accessToken, refreshToken, user);
//     return { success: true, data: { user, accessToken, refreshToken } };
//   } catch (error: any) {
//     console.error("Login error:", error?.response?.data || error);
//     return {
//       success: false,
//       error: error?.response?.data?.error || "Login failed. Please try again.",
//     };
//   }
// }

// export async function logoutUser() {
//   try {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("accessToken")?.value;

//     if (accessToken) {
//       await api.post(
//         "/logout",
//         {},
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//     }

//     await clearCookies();
//     return { success: true };
//   } catch (error) {
//     console.error("Logout error:", error);
//     await clearCookies();
//     return { success: false, error: "Logout failed, but session was cleared" };
//   }
// }

// export async function getSession() {
//   const cookieStore = await cookies();
//   const accessToken = cookieStore.get("accessToken");
//   const userData = cookieStore.get("userData");
//   if (!accessToken || !userData) return null;

//   try {
//     return { user: JSON.parse(userData.value), accessToken: accessToken.value };
//   } catch (e) {
//     console.error("Session parse error:", e);
//     return null;
//   }
// }

// export async function refreshAccessToken() {
//   try {
//     const cookieStore = await cookies();
//     const refreshToken = cookieStore.get("refreshToken")?.value;
//     if (!refreshToken) throw new Error("No refresh token found");

//     const res = await api.post("/refresh-token", { refreshToken });
//     const { accessToken: newAccessToken } = res.data;

//     cookieStore.set("accessToken", newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7, // 1 week
//     });

//     return { success: true, accessToken: newAccessToken };
//   } catch (error) {
//     console.error("Token refresh error:", error);
//     await clearCookies();
//     redirect("/login");
//   }
// }


// export async function forgotPassword(email: string) {
//   try {
//     // Your backend returns 200 with a generic message (recommended)
//     await api.post("/auth/forgot-password", { email });
//     return { success: true };
//   } catch (error) {
//     // still return success to avoid user enumeration from UI
//     console.error("forgotPassword error:", (error as any)?.response?.data || error);
//     return { success: true };
//   }
// }

// export async function resetPassword(args: {
//   uid: string;
//   token: string;
//   newPassword: string;
// }) {
//   const { uid, token, newPassword } = args;
//   try {
//     const res = await api.post("/auth/reset-password", { uid, token, newPassword });
//     return { success: res.status === 200 };
//   } catch (error: any) {
//     const msg = error?.response?.data?.error || "Reset failed. Link may be invalid or expired.";
//     return { success: false, error: msg };
//   }
// }


// async function getAuthHeaderFromCookies() {
//   const cookieStore = await cookies();
//   const accessToken = cookieStore.get("accessToken")?.value;
//   return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
// }

// export async function getAllUsers() {
//   try {
//     const headers = await getAuthHeaderFromCookies();
//     const res = await api.get("/users", { headers });
//     return res.data;
//   } catch (error) {
//     console.error("getAllUsers error:", error);
//     throw error;
//   }
// }

// export async function createUser(data: any) {
//   try {
//     const res = await api.post("/register", data);
//     revalidatePath("/dashboard/users");
//     return res.data;
//   } catch (error: any) {
//     if (axios.isAxiosError(error)) {
//       const message = error.response?.data?.message || "Failed to create user";
//       throw new Error(message);
//     }
//     throw error;
//   }
// }

// // export async function verifyEmailAction(params: { email: string; token: string }) {
// //   try {
// //     await api.post("/auth/verify-email", params);
// //     return { success: true };
// //   } catch (e: any) {
// //     return { success: false, error: e?.response?.data?.error || "Verification failed." };
// //   }
// // }

// // export async function resendVerificationAction(email: string) {
// //   try {
// //     await api.post("/auth/resend-verification", { email });
// //     return { success: true };
// //   } catch {
// //     return { success: true }; // don't leak
// //   }
// // }

// export async function deleteUser(userId: string) {
//   try {
//     const headers = await getAuthHeaderFromCookies();
//     if (!headers.Authorization) throw new Error("Unauthorized: No access token found");
//     await api.delete(`/users/${userId}`, { headers });
//     revalidatePath("/dashboard/users");
//     return { success: true, message: "User deleted successfully" };
//   } catch (error) {
//     console.error("Delete user error:", error);
//     throw error;
//   }
// }

// export async function fetchMe() {
//   try {
//     const headers = await getAuthHeaderFromCookies();
//     const res = await api.get("/me", { headers });
//     return res.data;
//   } catch (error) {
//     console.error("fetchMe error:", error);
//     return null;
//   }
// }


// // app/actions/auth.ts (server)
// // export async function verifyEmailAction(args: { email: string; token: string }) {
// //   try {
// //     // Backend now returns { ok: true, userId, email }
// //     const { data } = await api.post("/auth/verify-email", args);
// //     return { success: true, userId: data.userId as string, email: data.email as string };
// //   } catch (e: any) {
// //     return { success: false, error: e?.response?.data?.error || "Verification failed" };
// //   }
// // }

// // export async function resendVerificationAction(email: string) {
// //   try {
// //     await api.post("/auth/resend-verification", { email });
// //     // Always report success to the UI (avoids email enumeration)
// //     return { success: true };
// //   } catch {
// //     return { success: true };
// //   }
// // }

// // export async function getUserById(userId: string) {
// //   if (!userId) throw new Error("User ID is required");

// //   const doRequest = async () => {
// //     const headers = await getAuthHeaderFromCookies();
// //     if (!("Authorization" in headers)) {
// //       throw new Error("Unauthorized: No access token found");
// //     }
// //     const res = await api.get(`/users/${encodeURIComponent(userId)}`, { headers });
// //     return res.data; // keep same shape as your other actions (res.data)
// //   };

// //   try {
// //     return await doRequest();
// //   } catch (err: any) {
// //     // If token expired, refresh once and retry
// //     if (err?.response?.status === 401) {
// //       const refreshed = await refreshAccessToken(); // this will redirect on failure
// //       if (refreshed?.success) {
// //         return await doRequest();
// //       }
// //     }
// //     console.error("getUserById error:", err?.response?.data || err);
// //     throw err;
// //   }
// // }


// export async function getUserById(userId: string) {
//   if (!userId) throw new Error("User ID is required");

//   try {
//     const res = await api.get(`/users/${encodeURIComponent(userId)}`);
//     return res.data; // { data, error } per your controller
//   } catch (err: any) {
//     console.error("getUserById error:", err?.response?.data || err);
//     // Surface a cleaner message while preserving throw behavior like your other actions
//     throw new Error(err?.response?.data?.error || "Failed to fetch user");
//   }
// }

// export async function verifyEmailAction(args: { email: string; token: string }) {
//   try {
//     console.log("[verifyEmailAction] Starting verification");
//     console.log("[verifyEmailAction] Email:", args.email);
//     console.log("[verifyEmailAction] Token:", args.token);
//     console.log("[verifyEmailAction] Token type:", typeof args.token);
//     console.log("[verifyEmailAction] Token length:", args.token?.length);
    
//     // Normalize the data
//     const payload = {
//       email: args.email.trim(),
//       token: String(args.token).trim(),
//     };
    
//     console.log("[verifyEmailAction] Normalized payload:", payload);
    
//     // The axios interceptor will log the full URL
//     const { data } = await api.post("/auth/verify-email", payload);
    
//     console.log("[verifyEmailAction] Success! Response data:", data);
    
//     return { 
//       success: true, 
//       userId: data.userId as string, 
//       email: data.email as string 
//     };
//   } catch (e: any) {
//     console.error("[verifyEmailAction] Error occurred");
//     console.error("[verifyEmailAction] Error response:", e?.response?.data);
//     console.error("[verifyEmailAction] Error status:", e?.response?.status);
//     console.error("[verifyEmailAction] Error message:", e?.message);
    
//     return { 
//       success: false, 
//       error: e?.response?.data?.error || "Verification failed" 
//     };
//   }
// }

// export async function resendVerificationAction(email: string) {
//   try {
//     console.log("[resendVerificationAction] Resending code to:", email);
//     await api.post("/auth/resend-verification", { email });
//     console.log("[resendVerificationAction] Success");
//     return { success: true };
//   } catch (error) {
//     console.error("[resendVerificationAction] Error:", error);
//     return { success: true }; // Don't leak user existence
//   }
// }



// export type UserStatus =
//   | "ACTIVE"
//   | "INACTIVE"
//   | "PENDING"
//   | "SUSPENDED"
//   | "DEACTIVATED"
//   | "BANNED";

// export type UpdateUserPayload = {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
//   role?: string;
//   status?: UserStatus;     // ← enum value
//   imageUrl?: string;
//   emailVerified?: boolean; // ← persisted by your controller
//   isApproved?: boolean;    // ← persisted by your controller
//   password?: string;       // optional
// };

// function pruneUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
//   return Object.fromEntries(
//     Object.entries(obj).filter(([, v]) => v !== undefined)
//   ) as Partial<T>;
// }

// export async function updateUserById(userId: string, updates: UpdateUserPayload) {
//   if (!userId) throw new Error("User ID is required");

//   try {
//     const body = pruneUndefined(updates);
//     const res = await api.put(`/users/${encodeURIComponent(userId)}`, body);

//     // keep UI in sync (adjust paths to your routes)
//     revalidatePath(`/dashboard/users/${userId}`);
//     revalidatePath(`/dashboard/users`);

//     return res.data; // { data, error }
//   } catch (err: any) {
//     console.error("updateUserById error:", err?.response?.data || err);
//     throw new Error(err?.response?.data?.error || "Failed to update user");
//   }
// }




// app/actions/auth.ts
"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** ========= Axios ========= **/
const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/** ========= Types ========= **/
interface BackendUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  imageUrl?: string;
  status?: string;
}

interface LoginSuccessPayload {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse {
  success: boolean;
  data?: LoginSuccessPayload;
  error?: string;
}

/** ========= Cookie Helpers ========= **/
const setCookies = async (
  accessToken: string,
  refreshToken: string,
  userData: BackendUser
) => {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // keep userData server-only as well
  cookieStore.set("userData", JSON.stringify(userData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

const clearCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("userData");
};


export async function loginUser(data: {
  identifier: string; // email OR phone
  password: string;
}): Promise<LoginResponse> {
  try {
    const res = await api.post("/login", data);
    const { user, accessToken, refreshToken } = res.data.data as LoginSuccessPayload;
    await setCookies(accessToken, refreshToken, user);
    return { success: true, data: { user, accessToken, refreshToken } };
  } catch (error: any) {
    console.error("Login error:", error?.response?.data || error);
    return {
      success: false,
      error: error?.response?.data?.error || "Login failed. Please try again.",
    };
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (accessToken) {
      await api.post(
        "/logout",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    await clearCookies();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    await clearCookies();
    return { success: false, error: "Logout failed, but session was cleared" };
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");
  const userData = cookieStore.get("userData");
  if (!accessToken || !userData) return null;

  try {
    return { user: JSON.parse(userData.value), accessToken: accessToken.value };
  } catch (e) {
    console.error("Session parse error:", e);
    return null;
  }
}

export async function refreshAccessToken() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) throw new Error("No refresh token found");

    const res = await api.post("/refresh-token", { refreshToken });
    const { accessToken: newAccessToken } = res.data;

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return { success: true, accessToken: newAccessToken };
  } catch (error) {
    console.error("Token refresh error:", error);
    await clearCookies();
    redirect("/login");
  }
}


export async function forgotPassword(email: string) {
  try {
    // Your backend returns 200 with a generic message (recommended)
    await api.post("/auth/forgot-password", { email });
    return { success: true };
  } catch (error) {
    // still return success to avoid user enumeration from UI
    console.error("forgotPassword error:", (error as any)?.response?.data || error);
    return { success: true };
  }
}

export async function resetPassword(args: {
  uid: string;
  token: string;
  newPassword: string;
}) {
  const { uid, token, newPassword } = args;
  try {
    const res = await api.post("/auth/reset-password", { uid, token, newPassword });
    return { success: res.status === 200 };
  } catch (error: any) {
    const msg = error?.response?.data?.error || "Reset failed. Link may be invalid or expired.";
    return { success: false, error: msg };
  }
}


async function getAuthHeaderFromCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function getAllUsers() {
  try {
    const headers = await getAuthHeaderFromCookies();
    const res = await api.get("/users", { headers });
    return res.data;
  } catch (error) {
    console.error("getAllUsers error:", error);
    throw error;
  }
}

// export async function createUser(data: any) {
//   try {
//     const res = await api.post("/register", data);
//     revalidatePath("/dashboard/users");
//     return res.data;
//   } catch (error: any) {
//     if (axios.isAxiosError(error)) {
//       const message = error.response?.data?.message || "Failed to create user";
//       throw new Error(message);
//     }
//     throw error;
//   }
// }


export async function createUser(data: any) {
  try {
    console.log("📝 Creating user:", data.email);
    
    const res = await api.post("/register", data);
    
    console.log("✅ User created successfully");
    
    revalidatePath("/dashboard/users");
    
    // ✅ Return only serializable data (no Axios response objects)
    return {
      success: true,
      data: res.data?.data, // Extract the actual user data
      error: null,
    };
  } catch (error: any) {
    console.error("❌ Error creating user:", error?.response?.data || error?.message);
    
    // ✅ Don't throw - return serializable error object instead
    return {
      success: false,
      data: null,
      // Check both .error and .message fields from backend
      error: error?.response?.data?.error || error?.response?.data?.message || "Failed to create user",
    };
  }
}


export async function deleteUser(userId: string) {
  try {
    const headers = await getAuthHeaderFromCookies();
    if (!headers.Authorization) throw new Error("Unauthorized: No access token found");
    await api.delete(`/users/${userId}`, { headers });
    revalidatePath("/dashboard/users");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
}




export async function fetchMe() {
  try {
    const headers = await getAuthHeaderFromCookies();
    const res = await api.get("/me", { headers });
    return res.data;
  } catch (error) {
    console.error("fetchMe error:", error);
    return null;
  }
}



// app/actions/auth.ts (server)
// export async function verifyEmailAction(args: { email: string; token: string }) {
//   try {
//     // Backend now returns { ok: true, userId, email }
//     const { data } = await api.post("/auth/verify-email", args);
//     return { success: true, userId: data.userId as string, email: data.email as string };
//   } catch (e: any) {
//     return { success: false, error: e?.response?.data?.error || "Verification failed" };
//   }
// }

// export async function resendVerificationAction(email: string) {
//   try {
//     await api.post("/auth/resend-verification", { email });
//     // Always report success to the UI (avoids email enumeration)
//     return { success: true };
//   } catch {
//     return { success: true };
//   }
// }

// export async function getUserById(userId: string) {
//   if (!userId) throw new Error("User ID is required");

//   const doRequest = async () => {
//     const headers = await getAuthHeaderFromCookies();
//     if (!("Authorization" in headers)) {
//       throw new Error("Unauthorized: No access token found");
//     }
//     const res = await api.get(`/users/${encodeURIComponent(userId)}`, { headers });
//     return res.data; // keep same shape as your other actions (res.data)
//   };

//   try {
//     return await doRequest();
//   } catch (err: any) {
//     // If token expired, refresh once and retry
//     if (err?.response?.status === 401) {
//       const refreshed = await refreshAccessToken(); // this will redirect on failure
//       if (refreshed?.success) {
//         return await doRequest();
//       }
//     }
//     console.error("getUserById error:", err?.response?.data || err);
//     throw err;
//   }
// }


export async function getUserById(userId: string) {
  if (!userId) throw new Error("User ID is required");

  try {
    const res = await api.get(`/users/${encodeURIComponent(userId)}`);
    return res.data; // { data, error } per your controller
  } catch (err: any) {
    console.error("getUserById error:", err?.response?.data || err);
    // Surface a cleaner message while preserving throw behavior like your other actions
    throw new Error(err?.response?.data?.error || "Failed to fetch user");
  }
}

export async function verifyEmailAction(args: { email: string; token: string }) {
  try {
    console.log("[verifyEmailAction] Starting verification");
    console.log("[verifyEmailAction] Email:", args.email);
    console.log("[verifyEmailAction] Token:", args.token);
    console.log("[verifyEmailAction] Token type:", typeof args.token);
    console.log("[verifyEmailAction] Token length:", args.token?.length);
    
    // Normalize the data
    const payload = {
      email: args.email.trim(),
      token: String(args.token).trim(),
    };
    
    console.log("[verifyEmailAction] Normalized payload:", payload);
    
    // The axios interceptor will log the full URL
    const { data } = await api.post("/auth/verify-email", payload);
    
    console.log("[verifyEmailAction] Success! Response data:", data);
    
    return { 
      success: true, 
      userId: data.userId as string, 
      email: data.email as string 
    };
  } catch (e: any) {
    console.error("[verifyEmailAction] Error occurred");
    console.error("[verifyEmailAction] Error response:", e?.response?.data);
    console.error("[verifyEmailAction] Error status:", e?.response?.status);
    console.error("[verifyEmailAction] Error message:", e?.message);
    
    return { 
      success: false, 
      error: e?.response?.data?.error || "Verification failed" 
    };
  }
}

export async function resendVerificationAction(email: string) {
  try {
    console.log("[resendVerificationAction] Resending code to:", email);
    await api.post("/auth/resend-verification", { email });
    console.log("[resendVerificationAction] Success");
    return { success: true };
  } catch (error) {
    console.error("[resendVerificationAction] Error:", error);
    return { success: true }; // Don't leak user existence
  }
}



export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "BANNED";

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: UserStatus;     // ← enum value
  imageUrl?: string;
  emailVerified?: boolean; // ← persisted by your controller
  isApproved?: boolean;    // ← persisted by your controller
  password?: string;       // optional
};

function pruneUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function updateUserById(userId: string, updates: UpdateUserPayload) {
  if (!userId) throw new Error("User ID is required");

  try {
    const body = pruneUndefined(updates);
    const res = await api.put(`/users/${encodeURIComponent(userId)}`, body);

    // keep UI in sync (adjust paths to your routes)
    revalidatePath(`/dashboard/users/${userId}`);
    revalidatePath(`/dashboard/users`);

    return res.data; // { data, error }
  } catch (err: any) {
    console.error("updateUserById error:", err?.response?.data || err);
    throw new Error(err?.response?.data?.error || "Failed to update user");
  }
}

