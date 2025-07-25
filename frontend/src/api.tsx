const API_BASE_URL = "http://127.0.0.1:8000/api/";

export async function uploadVideo(videoFile: File): Promise<any> {
  const formData = new FormData();
  formData.append("video", videoFile);

  const response = await fetch(`${API_BASE_URL}upload-video/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload video");
  }

  return await response.json();
}

// New function for web extension to call frontend API
export async function detectDeepfake(imageFile: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch("/api/detect/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to detect deepfake");
  }

  return await response.json();
}
