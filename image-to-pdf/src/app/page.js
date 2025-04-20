"use client"
import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState(null); 

  const handleChange = (e) => { 
    setFiles(e.target.files);
  };

  const handleSubmit = async () => {
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file, file.webkitRelativePath); // preserve folder structure
    });

    try {
      const res = await fetch("http://localhost:4000/api/convert", {
        method: "POST",
        body: formData,
      });
    
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.pdf";
      a.click();
    } catch (error) {
      console.error("Error during PDF conversion:", error);
      alert("Failed to convert images to PDF. Please try again.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Upload Folder of Images to PDF</h1>
      <input type="file" webkitdirectory="true" directory="true" multiple onChange={handleChange} />
      <button onClick={handleSubmit} className="mt-4 p-2 bg-blue-500 text-white">
        Convert to PDF
      </button>
    </div>
  );
}
