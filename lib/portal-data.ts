import { redirect } from "next/navigation";

/**
 * Runs a page's data loaders. An unauthenticated session goes to sign-in;
 * any other failure is re-thrown so the route's error.tsx can offer a retry
 * (instead of signing the customer out, as some pages used to).
 */
export async function loadOrSignIn<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") redirect("/login");
    throw error;
  }
}
