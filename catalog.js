const puppeteer = require("puppeteer");
const fs = require("fs");

// Sample product data (replace with real data)
const products = [
    {
        title: "Milton Greens Stars",
        subtitle: "REVERSIBLE SECTIONAL SOFA SET",
        model: "M8023-LGR",
        color: "LIGHT GRAY",
        dimensions: "Sectional: 76.77 x 51.18 x 33.86 in. H",
        features: [
            "Linen Tufted Back Upholstered",
            "Reversible Chaise Sectional Sofa",
            "Square Armrest",
        ],
        imageUrl: "https://yourimageurl.com/image1.jpg" // Replace with actual image URL
    },
    {
        title: "Milton Greens Stars",
        model: "M8023-SAND",
        color: "SAND",
        dimensions: "Sectional: 76.77 x 51.18 x 33.86 in. H",
        features: [
            "Linen Tufted Back Upholstered",
            "Reversible Chaise Sectional Sofa",
            "Square Armrest",
        ],
        imageUrl: "https://yourimageurl.com/image2.jpg" // Replace with actual image URL
    }
];

// Function to generate HTML for all product pages in one document
function generateProductHTML(products) {
    return `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; width: 595px; height: 842px; background: white; }
            .page { page-break-after: always; padding: 20px; }
            .title { text-align: center; font-size: 24px; font-weight: bold; color: #006400; }
            .subtitle { text-align: center; font-size: 18px; margin-bottom: 20px; }
            .product-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
            .product-image { width: 500px; height: auto; border: 1px solid #ddd; border-radius: 5px; }
            .details { text-align: left; width: 500px; font-size: 14px; margin-top: 10px; }
            .model { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
            .color { font-style: italic; color: gray; margin-bottom: 5px; }
            .dimensions { margin-bottom: 5px; font-weight: bold; }
            .features { margin-top: 10px; padding-left: 15px; }
        </style>
    </head>
    <body>
        ${products.map(product => `
            <div class="page">
                <div class="title">${product.title}</div>
                <div class="subtitle">${product.subtitle || ""}</div>
                <div class="product-container">
                    <img src="${product.imageUrl}" class="product-image" />
                    <div class="details">
                        <div class="model">${product.model}</div>
                        <div class="color">${product.color}</div>
                        <div class="dimensions">${product.dimensions}</div>
                        <ul class="features">
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `).join('')}
    </body>
    </html>
    `;
}

// Function to generate a PDF from the entire HTML document
async function createPDF(products, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Generate the full HTML content with multiple product pages
    const htmlContent = generateProductHTML(products);
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate a multi-page PDF
    await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    console.log(`✅ PDF saved to: ${outputPath}`);
}

// Run the PDF generator
const outputPDF = "catalog.pdf";
createPDF(products, outputPDF);
