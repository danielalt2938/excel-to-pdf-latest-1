const puppeteer = require("puppeteer");
const fs = require("fs");
const csv = require("csv-parser");

// Sample product data (replace with real images & details)
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
    imageUrl:
      "https://dallas.goupdated.com/Image/LoadImage?image_name=171.jpg&width=1200&height=1200", // Replace with actual image URL
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
    imageUrl:
      "https://dallas.goupdated.com/Image/LoadImage?image_name=171.jpg&width=1200&height=1200", // Replace with actual image URL
  },
];

// Function to generate full-page HTML using Tailwind CSS
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
            @page { size: A4; margin: 0; }  /* Ensures full A4 size */
            html, body { margin: 0; padding: 0; width: 595px; height: 842px; }
            .page { width: 595px; height: 842px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
            .page-break { page-break-after: always; }
        </style>
    </head>
    <body class="bg-gray-100 text-gray-900">
        ${products
          .map(
            (product) => `
            <div class="page bg-white shadow-lg p-0">
                <h1 class="text-4xl font-bold text-green-700">${
                  product.title
                }</h1>
                <h2 class="text-2xl text-gray-600 mt-2">${
                  product.subtitle || ""
                }</h2>
                <img src="${
                  product.imageUrl
                }" class="w-[595px] h-[300px] object-contain mt-4" />
                <p class="text-lg font-semibold mt-4">Model: <span class="font-bold">${
                  product.model
                }</span></p>
                <p class="italic text-gray-500">Color: ${product.color}</p>
                <p class="mt-2 font-medium">Dimensions: ${
                  product.dimensions
                }</p>
                <ul class="mt-4 list-disc list-inside text-gray-700">
                    ${product.features
                      .map((feature) => `<li>${feature}</li>`)
                      .join("")}
                </ul>
            </div>
            <div class="page-break"></div>
        `
          )
          .join("")}
    </body>
    </html>
    `;
}

// Function to generate a multi-page PDF with Tailwind styles
async function createPDF(products, outputPath) {
  // Read CSV file and convert it to JSON
  const results = [];

  fs.createReadStream("houston-lion.csv") // Replace with your CSV file
    .pipe(csv())
    .on("data", (row) => {
      if (row.quantity) {
        results.push({
          title: "Houston Inventory Sale",
          subtitle: row["Description"],
          model: row["Item No."],
          imageUrl: `https://dallas.goupdated.com/Image/LoadImage?image_name=${row["Item No."]}.jpg&width=1200&height=1200`, // Replace with actual image URL
          color: "DEMO: LIGHT GRAY",
          dimensions: "DEMO: Sectional: 76.77 x 51.18 x 33.86 in. H",
          features: [
            "DEMO: Linen Tufted Back Upholstered",
            "DEMO: Reversible Chaise Sectional Sofa",
            "DEMO: Square Armrest",
          ],
        });
      }
    })
    .on("end", async () => {
      // Save the JSON to a file
      // fs.writeFileSync('output.json', JSON.stringify(results, null, 2));
      // console.log(results)
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Generate the full HTML content
      const htmlContent = generateProductHTML(results);
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      // Force Puppeteer to wait for Tailwind CSS to load and apply styles
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      // Generate multi-page PDF
      await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      await browser.close();
      console.log(`✅ PDF saved to: ${outputPath}`);
    });
}

// Run the PDF generator
const outputPDF = "catalog.pdf";
createPDF(products, outputPDF);
