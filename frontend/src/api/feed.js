import { api } from "./client";

export async function getFeed() {
  const res = await api.get("/feed/");
  return res.data;
}