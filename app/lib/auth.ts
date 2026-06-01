import { cookies } from "next/headers";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
const COOKIE_NAME = "admin_session";

// Session token matches a simple server-side secret hash
const SESSION_TOKEN = `tft_portal_admin_token_${ADMIN_PASSCODE}`;

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME)?.value;
    return session === SESSION_TOKEN;
  } catch (error) {
    console.error("Error verifying admin session:", error);
    return false;
  }
}

export async function loginAdmin(passcode: string): Promise<boolean> {
  try {
    if (passcode === ADMIN_PASSCODE) {
      const cookieStore = await cookies();
      
      // Set secure HttpOnly cookie (compatible with Serverless / Vercel Edge)
      cookieStore.set(COOKIE_NAME, SESSION_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 Week session duration
        path: "/",
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error logging in admin:", error);
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (error) {
    console.error("Error logging out admin:", error);
  }
}
