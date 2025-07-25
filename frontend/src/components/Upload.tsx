import React, { useState } from "react";
import { uploadVideo } from "../api";

const Upload: React.FC = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!video) return;

    try {
      const data = await uploadVideo(video);
      setResult(data.message || "Upload successful!");
    } catch (err) {
      console.error(err);
      setResult("Upload failed.");
    }
  };

  return (
    <div className="p-4">
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button className="bg-blue-500 text-white p-2 m-2 rounded" onClick={handleUpload}>
        Upload
      </button>
      {result && <p>{result}</p>}
    </div>
  );
};

export default Upload;
