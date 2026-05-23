import { api } from "./client";

export async function uploadNews({ title, text, imageFile, onProgress }) {
  const form = new FormData();
  form.append("title", title);
  form.append("text", text);
  form.append("image", imageFile);

  const res = await api.post("/upload/", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!onProgress) return;
      const total = evt.total || 0;
      const loaded = evt.loaded || 0;
      if (total > 0) onProgress(Math.round((loaded / total) * 100));
    },
  });

  return res.data;
}

export async function getMyUploads() {
  const res = await api.get("/user/uploads/");
  return res.data;
}

export async function getUpload(id) {
  const res = await api.get(`/uploads/${id}/`);
  return res.data;
}