"use client"
import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 

  const handleChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async () => {
    if (!files) return;

    setIsLoading(true); 

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file, file.webkitRelativePath); 
    });

    try {
      const res = await fetch("https://folder2pdf.onrender.com/api/convert", {
        method: "POST",
        body: formData,
        mode : "cors",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      
      const filename = prompt("Enter the name for the output PDF file:", "output.pdf");
      if (!filename) {
        alert("File download canceled.");
        return;
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`; 
      a.click();
    } catch (error) {
      console.error("Error during PDF conversion:", error);
      alert("Failed to convert images to PDF. Please try again.");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between bg-gray-900 text-gray-100">
      <div className="flex justify-center items-center flex-grow">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-3xl font-semibold text-center text-gray-100 mb-6">Folder of Images to PDF</h1>
          <input
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={handleChange}
            className="w-full mb-6 py-3 px-4 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            className={`w-full py-3 bg-blue-600 text-white rounded-lg shadow-md transition-transform transform hover:scale-105 focus:ring-4 focus:ring-blue-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Converting..." : "Convert to PDF"}
          </button>
          {isLoading && (
            <div className="mt-4 text-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin mx-auto"></div>
              <p className="text-gray-400 mt-2">Processing...</p>
            </div>
          )}
        </div>
      </div>
      <footer className="text-center py-4 bg-gray-800 text-gray-400">
        Made with ❤️ 
      </footer>
    </div>
  );
}