const FALLBACK_URL =
  "https://maathacare-backend-g4duhqasdqfwbteb.centralindia-01.azurewebsites.net";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_URL
).replace(/\/+$/, "");
