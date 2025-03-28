const express = require("express");
const puppeteer = require("puppeteer");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// hello world

// Initialize Firebase Admin SDK
const serviceAccount = require("./keys.json"); // Replace with your service account file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "minarium-83af2.firebasestorage.app", // Replace with your Firebase storage bucket
});
const bucket = admin.storage().bucket();

const app = express();
app.use(bodyParser.json());
const upload = multer();

// HTML Template Function
function generateProductHTML(products) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Catalog</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @page { size: A4; margin: 0; }
            html, body { margin: 0; padding: 0; width: 595px; height: 842px; }
            .page { width: 595px; height: 842px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
            .page-break { page-break-after: always; }
        </style>
    </head>
    <body class="bg-gray-100 text-gray-900">
        ${products
          .map(
            (product) => `
            <div class="page bg-white shadow-lg p-4">               
                <img src="${product.imageUrl}" class="w-[595px] h-[300px] object-contain mt-4 text-gray-500" />
                <h1 class="text-2xl font-bold text-green-700">${product.title}</h1>
                <p class="text-lg font-semibold mt-4">SKU: <span class="font-bold">${product.sku}</span></p>
                <p class="italic text-gray-500">Price: ${product.price}</p>
                <p class="mt-2 font-medium">Dimensions: ${product.description1}</p>
                   <p class="mt-2 font-medium">Dimensions: ${product.description2}</p>             
            </div>
            <div class="page-break"></div>
        `
          )
          .join("")}
    </body>
    </html>
    `;
}

// Function to generate PDF
async function createPDF(products, filePath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const htmlContent = generateProductHTML(products);

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await page.evaluate(
    () => new Promise((resolve) => setTimeout(resolve, 1000))
  ); // Wait for Tailwind styles

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
}

// Function to upload PDF to Firebase Storage
async function uploadToFirebase(filePath, fileName) {
  const storageFile = bucket.file(fileName);
  await storageFile.save(fs.readFileSync(filePath), {
    metadata: { contentType: "application/pdf" },
  });

  await storageFile.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// API Endpoint
app.post("/generate-pdf", async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    const pdfPath = path.join(__dirname, "catalog.pdf");
    await createPDF(products, pdfPath);
    const downloadURL = await uploadToFirebase(
      pdfPath,
      `catalog-${Date.now()}.pdf`
    );

    res.json({ success: true, pdf_url: downloadURL });

    fs.unlinkSync(pdfPath); // Delete local PDF after upload
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
