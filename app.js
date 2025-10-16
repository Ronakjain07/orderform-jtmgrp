// This line is needed to use the jsPDF library
const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
  // --- UI ELEMENTS ---
  const partyNameInput = document.getElementById("partyName");
  const gstNoInput = document.getElementById("gstNo");
  const orderNoInput = document.getElementById("orderNo");
  const orderDateInput = document.getElementById("orderDate");
  const addProductBtn = document.getElementById("addProductBtn");
  const productRowsContainer = document.getElementById("product-rows");
  const grandTotalSpan = document.getElementById("grandTotal");
  const generatePdfBtn = document.getElementById("generatePdfBtn");
  const historyBtn = document.getElementById("historyBtn");
  const historyModal = document.getElementById("historyModal");
  const closeModalBtn = document.querySelector(".close-btn");
  const historyListContainer = document.getElementById("historyList");

  const STORAGE_KEY = "jtmOrderHistory";

  // --- HISTORY STORAGE FUNCTIONS ---
  const getOrdersFromStorage = () =>
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const saveOrdersToStorage = (orders) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  // --- POPULATE HISTORY MODAL ---
  const populateHistoryList = () => {
    historyListContainer.innerHTML = "";
    const orders = getOrdersFromStorage();

    if (orders.length === 0) {
      historyListContainer.innerHTML = "<p>No saved orders found.</p>";
      return;
    }

    orders.forEach((order) => {
      const item = document.createElement("div");
      item.classList.add("history-item");
      item.dataset.orderNo = order.orderNo;
      item.innerHTML = `
                <div class="item-details">
                    <span class="item-order-no">Order #${order.orderNo}</span>
                    <span class="item-party">${order.partyName}</span>
                    <span class="item-date">${order.orderDate}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-view"><i class="fa-solid fa-eye"></i> View</button>
                    <button class="btn-delete"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            `;
      historyListContainer.appendChild(item);
    });
  };

  // --- LOAD & DELETE ORDER FROM HISTORY ---
  historyListContainer.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;

    const historyItem = target.closest(".history-item");
    const orderNoToActOn = historyItem.dataset.orderNo;
    let orders = getOrdersFromStorage();

    if (target.classList.contains("btn-view")) {
      const orderToLoad = orders.find((o) => o.orderNo === orderNoToActOn);
      if (orderToLoad) {
        partyNameInput.value = orderToLoad.partyName;
        gstNoInput.value = orderToLoad.gstNo;
        orderNoInput.value = orderToLoad.orderNo;
        orderDateInput.value = orderToLoad.orderDate;
        productRowsContainer.innerHTML = "";
        orderToLoad.products.forEach((product) => createProductRow(product));
        updateTotals();
        closeHistoryModal();
      }
    }

    if (target.classList.contains("btn-delete")) {
      const updatedOrders = orders.filter((o) => o.orderNo !== orderNoToActOn);
      saveOrdersToStorage(updatedOrders);
      populateHistoryList();
    }
  });

  // --- UI INTERACTIVITY (MODAL & PRODUCTS) ---
  const openHistoryModal = () => {
    populateHistoryList();
    historyModal.classList.remove("hidden");
  };
  const closeHistoryModal = () => historyModal.classList.add("hidden");

  historyBtn.addEventListener("click", openHistoryModal);
  closeModalBtn.addEventListener("click", closeHistoryModal);
  historyModal.addEventListener("click", (event) => {
    if (event.target === historyModal) closeHistoryModal();
  });

  const updateTotals = () => {
    let grandTotal = 0;
    document.querySelectorAll(".product-row").forEach((row) => {
      const pcs = parseFloat(row.querySelector(".prod-pcs").value) || 0;
      const rate = parseFloat(row.querySelector(".prod-rate").value) || 0;
      const amount = pcs * rate;
      row.querySelector(".prod-amount").value = amount.toFixed(2);
      grandTotal += amount;
    });
    grandTotalSpan.textContent = grandTotal.toFixed(2);
  };

  const createProductRow = (productData = {}) => {
    const row = document.createElement("div");
    row.classList.add("product-row");
    row.innerHTML = `
            <div class="input-group"><input type="text" class="prod-desc" placeholder="Description" value="${
              productData.description || ""
            }"></div>
            <div class="input-group"><input type="text" class="prod-mtrs" placeholder="e.g., 2.5x10" value="${
              productData.mtrs || ""
            }"></div>
            <div class="input-group"><input type="number" class="prod-pcs" placeholder="Pcs." value="${
              productData.pcs || ""
            }"></div>
            <div class="input-group"><input type="number" class="prod-rate" placeholder="Rate" value="${
              productData.rate || ""
            }"></div>
            <div class="input-group"><input type="number" class="prod-amount" placeholder="Amount" value="${(
              productData.amount || 0
            ).toFixed(2)}" disabled></div>
            <div class="input-group"><input type="text" class="prod-remarks" placeholder="Remarks" value="${
              productData.remarks || ""
            }"></div>
            <button type="button" class="btn-remove">X</button>
        `;
    productRowsContainer.appendChild(row);
  };

  addProductBtn.addEventListener("click", () => createProductRow());
  productRowsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-remove")) {
      event.target.parentElement.remove();
      updateTotals();
    }
  });

  productRowsContainer.addEventListener("input", (event) => {
    if (
      event.target.classList.contains("prod-pcs") ||
      event.target.classList.contains("prod-rate")
    ) {
      updateTotals();
    }
  });

  createProductRow(); // Start with one empty row

  // --- PDF GENERATION & SAVE TO HISTORY LOGIC ---
  generatePdfBtn.addEventListener("click", () => {
    const currentOrder = {
      partyName: partyNameInput.value,
      gstNo: gstNoInput.value,
      orderNo: orderNoInput.value,
      orderDate: orderDateInput.value,
      products: [],
    };

    if (!currentOrder.orderNo) {
      alert("Please enter an Order Number before generating the PDF.");
      return;
    }

    document.querySelectorAll(".product-row").forEach((row) => {
      currentOrder.products.push({
        description: row.querySelector(".prod-desc").value,
        mtrs: row.querySelector(".prod-mtrs").value,
        pcs: row.querySelector(".prod-pcs").value,
        rate: row.querySelector(".prod-rate").value,
        amount: row.querySelector(".prod-amount").value,
        remarks: row.querySelector(".prod-remarks").value,
      });
    });

    let orders = getOrdersFromStorage();
    orders = orders.filter((o) => o.orderNo !== currentOrder.orderNo);
    orders.unshift(currentOrder);
    saveOrdersToStorage(orders);
    alert(`Order #${currentOrder.orderNo} has been saved to history!`);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [850, 1202],
    });
    const img = new Image();
    img.src = "orderform.png";
    img.onload = () => {
      doc.addImage(img, "JPEG", 0, 0, 850, 1202);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(33);

      const coords = {
        partyNameX: 105,
        partyNameY: 270,
        orderNoX: 678,
        orderNoY: 270,
        gstNoX: 132,
        gstNoY: 330,
        orderDateX: 678,
        orderDateY: 330,
        firstRowY: 412,
        rowHeight: 39,
        descX: 140,
        mtrsX: 380,
        pcsX: 515,
        rateX: 607,
        remarksX: 711,
        totalTextX: 550,
        totalTextY: 900,
        totalValueX: 700,
        totalValueY: 900,
      };

      doc.text(currentOrder.partyName, coords.partyNameX, coords.partyNameY);
      doc.text(currentOrder.orderNo, coords.orderNoX, coords.orderNoY);
      doc.text(currentOrder.gstNo, coords.gstNoX, coords.gstNoY);
      doc.text(currentOrder.orderDate, coords.orderDateX, coords.orderDateY);

      let currentY = coords.firstRowY;
      let grandTotal = 0;

      currentOrder.products.forEach((p) => {
        doc.text(p.description, coords.descX, currentY);
        doc.text(p.mtrs, coords.mtrsX, currentY);
        doc.text(p.pcs, coords.pcsX, currentY);
        doc.text(p.rate, coords.rateX, currentY);
        doc.text(p.remarks, coords.remarksX, currentY);
        currentY += coords.rowHeight;
        // grandTotal += parseFloat(p.amount) || 0;
      });

      doc.setFontSize(35);
      doc.setFont("Roboto", "bold");
    //   doc.text("Grand Total:", coords.totalTextX, coords.totalTextY);
    //   doc.text(
    //     `Rs. ${grandTotal.toFixed(2)}`,
    //     coords.totalValueX,
    //     coords.totalValueY
    //   );

      doc.save(`Order_${currentOrder.orderNo}.pdf`);
    };
  });
});
