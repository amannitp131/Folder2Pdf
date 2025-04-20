import express from "express";
import formidable from "formidable";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import cors from "cors"; 

const app = express();
const PORT = 10000;


app.use(cors());

app.post("/api/convert", (req, res) => {
  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "File parsing error" });
    }

    const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images];

    uploadedFiles.sort((a, b) => {
      return a.originalFilename.localeCompare(b.originalFilename);
    });

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of uploadedFiles) {
        const buffer = fs.readFileSync(file.filepath);

  
        const mimeType = file.mimetype;
        if (!["image/jpeg", "image/png"].includes(mimeType)) {
          console.error(`Unsupported file type: ${mimeType}`);
          return res.status(400).json({ error: `Unsupported file type: ${mimeType}` });
        }

        // Convert PNG to JPEG if necessary
        const sharpImage = mimeType === "image/png"
          ? await sharp(buffer).jpeg().resize({ width: 595 }).toBuffer()
          : await sharp(buffer).resize({ width: 595 }).toBuffer();

        const image = await pdfDoc.embedJpg(sharpImage);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="output.pdf"');
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error during PDF creation:", error);
      res.status(500).json({ error: "Failed to create PDF" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});