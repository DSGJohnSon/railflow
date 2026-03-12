import { auth } from "@/lib/auth";

async function handleAuthLogging(req: Request, res: Response) {
  try {
    if (!res.ok && res.status !== 302) return;

    const url = new URL(req.url);
    const path = url.pathname;

    // Actions POST (Login/Register classique)
    if (req.method === "POST") {
      if (path.endsWith("/sign-up/email") || path.endsWith("/sign-in/email")) {
        const data = await res.clone().json();
        const user = data?.user;

        if (user?.id) {
          const action = path.endsWith("/sign-up/email") ? "REGISTER" : "LOGIN";
        }
      }
    }

    if (req.method === "GET" && path.includes("/callback/")) {
      const setCookie = res.headers.get("set-cookie");

      const sessionToken = setCookie
        ?.split(",")
        .find((c) => c.trim().startsWith("better-auth.session_token="))
        ?.split(";")[0]
        ?.trim();

      const session = await auth.api.getSession({
        headers: {
          cookie: sessionToken || "",
        },
      });

      if (session?.user?.id) {
        const provider = path.split("/").pop() || "oauth";
      }
    }
  } catch (error) {
    console.error("[AUTH_HANDLER_WRAPPER_ERROR]", error);
  }
}

export const GET = async (req: Request) => {
  const res = await auth.handler(req);
  handleAuthLogging(req, res);
  return res;
};

export const POST = async (req: Request) => {
  const res = await auth.handler(req);
  handleAuthLogging(req, res);
  return res;
};
