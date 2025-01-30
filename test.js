// https://chatgpt.com/c/679be180-565c-8003-83b6-7fe4bb67ffcc

const puppeteer = require("puppeteer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

// Convert local image to Base64
function getBase64Image(filePath) {
    const image = fs.readFileSync(filePath);
    return `data:image/png;base64,${image.toString("base64")}`;
}

// Define paths to local images
const localLogoPath = path.resolve(__dirname, "front-image.png"); // Logo for first page
const localFooterImagePath = path.resolve(__dirname, "image.png"); // Image for last page
const base64Logo = getBase64Image(localLogoPath);
const base64FooterImage = getBase64Image(localFooterImagePath);

// First Page (Cover Page)
const firstPageHTML = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; background: linear-gradient(to bottom, #3498db, #6dd5fa); color: white; margin: 0; padding: 0; }
            .cover { display: flex; align-items: center; justify-content: center; flex-direction: column; height: 100vh; font-size: 28px; font-weight: bold; }
            .cover img { width: 200px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="cover">
            Welcome to My Custom PDF Report
            <img src="${base64Logo}" alt="Logo">
        </div>
    </body>
    </html>
`;

// Middle Pages (Repeating Content)
const contentPageHTML = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; text-align: left; padding: 40px; }
            h1 { color: #007bff; }
            p { font-size: 14px; line-height: 1.6; }
            .content-img { width: 300px; display: block; margin: 20px auto; }
        </style>
    </head>
    <body>
        <h1>Content Page</h1>
        <p>This is an example of a full-page A4 HTML-rendered PDF.</p>
        <p>Custom styles, fonts, colors, and layouts can be applied.</p>
        <img class="content-img" src="https://dallas.goupdated.com/Image/LoadImage?image_name=171.jpg&width=1200&height=1200" alt="Placeholder Image">
    </body>
    </html>
`;

// Last Page (Closing Message)
const lastPageHTML = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; background: #222; color: white; margin: 0; padding: 0; }
            .footer { display: flex; align-items: center; justify-content: center; flex-direction: column; height: 100vh; font-size: 22px; font-weight: bold; }
            .footer img { width: 150px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="footer">
            Thank You for Reading!
            <img src="${base64FooterImage}" alt="Footer Image">
        </div>
    </body>
    </html>
`;

async function generateSinglePagePDF(htmlContent, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 595, height: 842 });

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();
    console.log(`✅ Generated PDF: ${outputPath}`);
}

async function mergePDFs(pdfPaths, outputPath) {
    const mergedPdf = await PDFDocument.create();

    for (const pdfPath of pdfPaths) {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, finalPdfBytes);
    console.log(`✅ Merged PDF saved to: ${outputPath}`);
}

async function createCompletePDF() {
    const firstPagePDF = "first_page.pdf";
    const contentPagePDF1 = "content_page1.pdf";
    const contentPagePDF2 = "content_page2.pdf"; // More pages can be added
    const lastPagePDF = "last_page.pdf";
    const finalPDF = "output.pdf";

    // Generate each page separately
    await generateSinglePagePDF(firstPageHTML, firstPagePDF);
    await generateSinglePagePDF(contentPageHTML, contentPagePDF1);
    await generateSinglePagePDF(contentPageHTML, contentPagePDF2);
    await generateSinglePagePDF(lastPageHTML, lastPagePDF);

    // Merge into final document
    await mergePDFs([firstPagePDF, contentPagePDF1, contentPagePDF2, lastPagePDF], finalPDF);

    // Clean up temp PDFs (optional)
    fs.unlinkSync(firstPagePDF);
    fs.unlinkSync(contentPagePDF1);
    fs.unlinkSync(contentPagePDF2);
    fs.unlinkSync(lastPagePDF);
}

// Generate the complete multi-page PDF
createCompletePDF().catch(console.error);
