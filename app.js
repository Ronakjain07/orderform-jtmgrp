// This line is needed to use the jsPDF library
const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
  // --- UI ELEMENTS ---
  const partyNameInput = document.getElementById("partyName");
  const gstNoInput = document.getElementById("gstNo");
  const orderNoInput = document.getElementById("orderNo");
  const orderDateInput = document.getElementById("orderDate");
  const transportInput = document.getElementById("transport");
  const discountInput = document.getElementById("discount");
  const destinationInput = document.getElementById("destination");
  const paymentWithinInput = document.getElementById("paymentWithin");

  const addProductBtn = document.getElementById("addProductBtn");
  const productRowsContainer = document.getElementById("product-rows");
  const generatePdfBtn = document.getElementById("generatePdfBtn");

  // --- FUNCTION TO CLEAR THE FORM AFTER SUCCESSFUL SUBMISSION ---
  const clearForm = () => {
    partyNameInput.value = "";
    gstNoInput.value = "";
    orderNoInput.value = "";
    orderDateInput.value = "";
    transportInput.value = "";
    destinationInput.value = "";
    discountInput.value = "";
    paymentWithinInput.value = "";
    productRowsContainer.innerHTML = "";
    createProductRow();
  };

  // --- PRODUCT ROW MANAGEMENT (UPDATED for Mobile Responsiveness) ---
  const createProductRow = () => {
    const row = document.createElement("div");
    row.classList.add("product-row");
    // Added data-label attributes for mobile view styling
    row.innerHTML = `
            <div class="input-group" data-label="Description">
                <input type="text" class="prod-desc" list="product-list" placeholder="Select or type a Product">
            </div>
            <div class="input-group" data-label="Mtrs.">
                <input type="text" class="prod-mtrs" placeholder="Mtrs.">
            </div>
            <div class="input-group" data-label="Pcs.">
                <input type="number" class="prod-pcs" placeholder="Pcs.">
            </div>
            <div class="input-group" data-label="Rate">
                <input type="number" class="prod-rate" placeholder="Rate">
            </div>
            <div class="input-group" data-label="Remarks">
                <input type="text" class="prod-remarks" placeholder="Remarks">
            </div>
            <button type="button" class="btn-remove">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
    productRowsContainer.appendChild(row);
  };

  addProductBtn.addEventListener("click", createProductRow);

  productRowsContainer.addEventListener("click", (event) => {
    if (event.target.closest(".btn-remove")) {
      event.target.closest(".product-row").remove();
    }
  });

  createProductRow(); // Start with one empty row

  // --- PDF GENERATION & GOOGLE SHEET LOGIC ---
  generatePdfBtn.addEventListener("click", async () => {
    const webAppUrl = config.GOOGLE_SHEET_URL;
    generatePdfBtn.disabled = true;
    generatePdfBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    const orderData = {
      partyName: partyNameInput.value,
      orderNo: orderNoInput.value,
      gstNo: gstNoInput.value,
      orderDate: orderDateInput.value,
      transport: transportInput.value,
      destination: destinationInput.value,
      discount: discountInput.value,
      paymentWithin: paymentWithinInput.value,
      products: [],
    };

    document.querySelectorAll(".product-row").forEach((row) => {
      orderData.products.push({
        description: row.querySelector(".prod-desc").value,
        mtrs: row.querySelector(".prod-mtrs").value,
        pcs: row.querySelector(".prod-pcs").value,
        rate: row.querySelector(".prod-rate").value,
        remarks: row.querySelector(".prod-remarks").value,
      });
    });

    try {
      await fetch(webAppUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      alert(`Order #${orderData.orderNo} saved to Google Sheet successfully!`);
      clearForm();

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [1080, 1350],
      });

      const img = new Image();
      img.src = "orderform.png";

      img.onload = () => {
        doc.addImage(img, "PNG", 0, 0, 1080, 1350);

        const coords = {
          partyNameX: 120,
          partyNameY: 324,
          orderNoX: 840,
          orderNoY: 324,
          gstNoX: 160,
          gstNoY: 391,
          orderDateX: 837,
          orderDateY: 391,
          firstRowY: 495,
          rowHeight: 49,
          descX: 90,
          mtrsX: 504,
          pcsX: 650,
          rateX: 760,
          remarksX: 895,
          transportX: 200,
          transportY: 1185,
          discountX: 825,
          discountY: 1185,
          destinationX: 220,
          destinationY: 1220,
          paymentWithinX: 825,
          paymentWithinY: 1220,
        };

        doc.setFont("Roboto", "bold");
        doc.setFontSize(45);
        doc.text(orderData.partyName, coords.partyNameX, coords.partyNameY);
        doc.text(orderData.orderNo, coords.orderNoX, coords.orderNoY);
        doc.text(orderData.gstNo, coords.gstNoX, coords.gstNoY);
        doc.text(orderData.orderDate, coords.orderDateX, coords.orderDateY);

        doc.setFont("Roboto", "normal");
        doc.setFontSize(32);
        doc.text(orderData.transport, coords.transportX, coords.transportY);
        doc.text(
          orderData.destination,
          coords.destinationX,
          coords.destinationY
        );
        doc.text(orderData.discount, coords.discountX, coords.discountY);
        doc.text(
          orderData.paymentWithin,
          coords.paymentWithinX,
          coords.paymentWithinY
        );

        let currentY = coords.firstRowY;
        orderData.products.forEach((p) => {
          doc.text(p.description, coords.descX, currentY);
          doc.text(p.mtrs, coords.mtrsX, currentY);
          doc.text(p.pcs, coords.pcsX, currentY);
          doc.text(p.rate, coords.rateX, currentY);
          doc.text(p.remarks, coords.remarksX, currentY);
          currentY += coords.rowHeight;
        });

        doc.save(`${orderData.orderNo || "Order"}.pdf`);
      };
    } catch (error) {
      console.error("Error sending data to Google Sheet:", error);
      alert(
        "Failed to save order to Google Sheet. Please check the console for errors."
      );
    } finally {
      generatePdfBtn.disabled = false;
      generatePdfBtn.innerHTML =
        '<i class="fa-solid fa-file-arrow-down"></i> Generate PDF';
    }
  });
});
