"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const getCurrent = async () => {
  try {
    const headersData = await headers();

    const session = await auth.api.getSession({
      headers: headersData,
    });

    if (!session) {
      return null;
    }

    return session.user;
  } catch (error) {
    return null;
  }
};
