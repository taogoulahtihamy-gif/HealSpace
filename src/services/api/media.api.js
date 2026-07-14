import { apiRequest } from "./httpClient.js";

export function uploadMedia(file, metadata = {}) {
  const formData = new FormData();

  formData.append("file", file);

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  return apiRequest("/media/upload", {
    method: "POST",
    body: formData,
  });
}

export function getMediaList() {
  return apiRequest("/media");
}

export function getMediaById(mediaId) {
  return apiRequest(`/media/${mediaId}`);
}

export function deleteMedia(mediaId) {
  return apiRequest(`/media/${mediaId}`, {
    method: "DELETE",
  });
}
