const fs = require("fs");
const { PDFDocument, rgb } = require("pdf-lib");
const sharp = require("sharp");

async function addImageToPage(pdfDoc, imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const image = await pdfDoc.embedJpg(imageBuffer).catch(() => pdfDoc.embedPng(imageBuffer));

    const page = pdfDoc.addPage([595, 842]); // A4 Size in points (8.27 x 11.69 inches)
    const { width, height } = image.scaleToFit(page.getWidth(), page.getHeight());
    
    page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
    });

    return page;
}

async function createPDF(imagePaths, firstPagePath, lastPagePath, outputPath) {
    const pdfDoc = await PDFDocument.create();

    // Add First Page (Custom Design)
    await addImageToPage(pdfDoc, firstPagePath);

    // Add all images in the middle pages
    for (const imagePath of imagePaths) {
        await addImageToPage(pdfDoc, imagePath);
    }

    // Add Last Page (Custom Design)
    await addImageToPage(pdfDoc, lastPagePath);

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`✅ PDF saved to: ${outputPath}`);
}

// Example Usage
const images = ["./image.png","./image.png","./image.png","./image.png","./image.png"]; // List of images
const firstPage = "./front-image.png"; // Custom first page
const lastPage = "./front-image.png";   // Custom last page
const outputPDF = "output.pdf";

createPDF(images, firstPage, lastPage, outputPDF)
    .catch(err => console.error("❌ Error:", err));
