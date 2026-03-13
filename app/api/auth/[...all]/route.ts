import { auth } from "@/lib/auth";

export const GET = async (req: Request) => {
  const res = await auth.handler(req);
  return res;
};

export const POST = async (req: Request) => {
  const res = await auth.handler(req);
  return res;
};
