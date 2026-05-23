import { api } from "./client";

export async function getModerationQueue() {
  const res = await api.get("/moderation/");
  return res.data;
}

export async function moderateItem(id, action) {
  const res = await api.patch(`/moderation/${id}/`, { action });
  return res.data;
}

export async function adminListUsers() {
  const res = await api.get("/users/");
  return res.data;
}

export async function adminUpdateUser(id, payload) {
  const res = await api.patch(`/users/${id}/`, payload);
  return res.data;
}

export async function adminDeleteUser(id) {
  const res = await api.delete(`/users/${id}/`);
  return res.data;
}