import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// LOGIN CHECK
// =========================
if (localStorage.getItem("adminLogin") !== "true") {
  window.location.href = "index.html"; // Ensure this points to your actual login page
}

// =========================
// STATE VARIABLES
// =========================
let orders = [];
let deleteOrderId = null;
let showingAllComplete = false; // Tracks the "View More / View Less" state

// =========================
// TOAST FUNCTIONS
// =========================
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function showDeleteToast() {
  const toast = document.getElementById("deleteToast");
  if (toast) toast.classList.add("show");
}

// =========================
// ADD ORDER
// =========================
async function addOrder() {
  const customerName = document.getElementById("customerName").value.trim();
  const trayPrice = document.getElementById("trayPrice").value.trim();
  const trayQty = document.getElementById("trayQty").value.trim();
  const date = document.getElementById("date").value;
  const status = document.getElementById("status").value;
  const payment = document.getElementById("payment").value;
  const moneyStatus = document.getElementById("moneyStatus").value;

  // VALIDATION
  if (!customerName || !trayPrice || !trayQty || !date) {
    showToast("Please Fill All Fields");
    return;
  }

  // TOTAL
  const total = Number(trayPrice) * Number(trayQty);

  // ORDER OBJECT
  const order = {
    customerName,
    trayPrice: Number(trayPrice),
    trayQty: Number(trayQty),
    total,
    date,
    status,
    payment,
    moneyStatus
  };

  try {
    // SAVE FIREBASE
    await addDoc(collection(db, "orders"), order);

    // CLEAR INPUTS
    document.getElementById("customerName").value = "";
    document.getElementById("trayPrice").value = "";
    document.getElementById("trayQty").value = "";
    document.getElementById("date").value = "";

    // RELOAD
    loadOrders();
    showToast("Order Added Successfully");

  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
}

// =========================
// LOAD ORDERS
// =========================
async function loadOrders() {
  const pendingTable = document.getElementById("pendingTable");
  const completeTable = document.getElementById("completeTable");
  const profitEl = document.getElementById("totalProfit");

  let totalProfit = 0;
  let pendingHTML = "";
  let completeRows = []; // Array to handle the View More logic

  const searchValue = document.getElementById("searchCustomer")?.value.toLowerCase() || "";
  const filterDate = document.getElementById("filterDate")?.value || "";

  try {
    // GET FIREBASE DATA
    const querySnapshot = await getDocs(collection(db, "orders"));
    orders = [];
    
    querySnapshot.forEach((docItem) => {
      orders.push({ id: docItem.id, ...docItem.data() });
    });

   const completeCount = orders.filter(
  order =>
    order.status === "Complete" &&
    order.moneyStatus === "Paid"
).length;

const pendingCount = orders.filter(
  order =>
    order.status === "Pending" ||
    order.moneyStatus === "Pending"
).length;

document.getElementById("totalOrders").innerText =
  orders.length;

document.getElementById("completeOrders").innerText =
  completeCount;

document.getElementById("pendingOrders").innerText =
  pendingCount;

    // EMPTY DATA
    if (orders.length === 0) {
      if (pendingTable) pendingTable.innerHTML = `<tr><td colspan="10" style="text-align:center;">No Orders Found</td></tr>`;
      if (completeTable) completeTable.innerHTML = `<tr><td colspan="10" style="text-align:center;">No Complete Orders</td></tr>`;
      if (profitEl) profitEl.innerText = 0;
      const viewMoreContainer = document.getElementById("viewMoreCompleteContainer");
      if (viewMoreContainer) viewMoreContainer.style.display = "none";
      return;
    }

    // LOOP ORDERS
    orders.forEach((order, index) => {
      // ROW TEMPLATE
      const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${order.customerName}</td>
        <td>₹${order.trayPrice}</td>
        <td>${order.trayQty}</td>
        <td>₹${order.total}</td>
        <td>${order.date}</td>
        <td>
          <span class="${order.status === "Pending" ? "pending" : "complete"}">${order.status}</span>
        </td>
        <td>${order.payment}</td>
        <td>
          <button class="${order.moneyStatus === "Pending" ? "pending-btn" : "paid-btn"} money-btn" data-id="${order.id}" data-status="${order.moneyStatus}">
            ${order.moneyStatus}
          </button>
        </td>
        <td>
          ${order.status === "Pending"
            ? `<button class="complete-btn action-complete" data-id="${order.id}">Complete</button>`
            : `<button class="done-btn">Done</button>`
          }
          <button class="delete-btn action-delete" data-id="${order.id}">Delete</button>
        </td>
      </tr>`;

      // PENDING TABLE
      if (order.status === "Pending" || order.moneyStatus === "Pending") {
        pendingHTML += row;
      }

      // COMPLETE TABLE AND PROFIT CALCULATION
      if (order.status === "Complete" && order.moneyStatus === "Paid") {
        const nameMatch = order.customerName.toLowerCase().includes(searchValue);
        const dateMatch = filterDate === "" || order.date === filterDate;

        if (nameMatch && dateMatch) {
          completeRows.push(row);
          totalProfit += Number(order.total); // Profit calculates for ALL matches
        }
      }
    });

    // INJECT PENDING HTML
    if (pendingTable) pendingTable.innerHTML = pendingHTML || `<tr><td colspan="10" style="text-align:center;">No Pending Orders</td></tr>`;
    
    // INJECT COMPLETE HTML & HANDLE "VIEW MORE / VIEW LESS"
    const viewMoreContainer = document.getElementById("viewMoreCompleteContainer");
    const viewMoreBtn = document.getElementById("viewMoreCompleteBtn");
    
    if (completeRows.length === 0) {
      if (completeTable) completeTable.innerHTML = `<tr><td colspan="10" style="text-align:center;">No Complete Orders</td></tr>`;
      if (viewMoreContainer) viewMoreContainer.style.display = "none";
    } else {
      // If there are more than 10 complete orders total
      if (completeRows.length > 10) {
        if (viewMoreContainer) viewMoreContainer.style.display = "block"; // Always show button
        
        if (!showingAllComplete) {
          if (completeTable) completeTable.innerHTML = completeRows.slice(0, 10).join("");
          if (viewMoreBtn) viewMoreBtn.innerText = "View More Orders";
        } else {
          if (completeTable) completeTable.innerHTML = completeRows.join("");
          if (viewMoreBtn) viewMoreBtn.innerText = "View Less Orders";
        }
      } else {
        // 10 or fewer items, show all, hide button
        if (completeTable) completeTable.innerHTML = completeRows.join("");
        if (viewMoreContainer) viewMoreContainer.style.display = "none";
      }
    }

    if (profitEl) profitEl.innerText = totalProfit;

    // ATTACH LISTENERS AFTER RENDERING
    attachTableEventListeners();

  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
}

// =========================
// ATTACH TABLE EVENT LISTENERS
// =========================
function attachTableEventListeners() {
  // COMPLETE BUTTON
  document.querySelectorAll(".action-complete").forEach(button => {
    button.addEventListener("click", async () => {
      await completeOrder(button.dataset.id);
    });
  });

  // DELETE BUTTON
  document.querySelectorAll(".action-delete").forEach(button => {
    button.addEventListener("click", () => {
      deleteOrderId = button.dataset.id;
      showDeleteToast();
    });
  });

  // MONEY BUTTON
  document.querySelectorAll(".money-btn").forEach(button => {
    button.addEventListener("click", async () => {
      await toggleMoneyStatus(button.dataset.id, button.dataset.status);
    });
  });
}

// =========================
// COMPLETE ORDER
// =========================
async function completeOrder(id) {
  try {
    await updateDoc(doc(db, "orders", id), { status: "Complete" });
    showToast("Order Completed");
    loadOrders();
  } catch (error) {
    console.error(error);
  }
}

// =========================
// MONEY STATUS
// =========================
async function toggleMoneyStatus(id, currentStatus) {
  const newStatus = currentStatus === "Pending" ? "Paid" : "Pending";
  try {
    await updateDoc(doc(db, "orders", id), { moneyStatus: newStatus });
    showToast("Money Status Updated");
    loadOrders();
  } catch (error) {
    console.error(error);
  }
}

// =========================
// DELETE ORDER
// =========================
async function deleteOrder(id) {
  try {
    await deleteDoc(doc(db, "orders", id));
    showToast("Order Deleted Successfully");
    loadOrders();
  } catch (error) {
    console.error(error);
    showToast("Failed to delete order");
  }
}

// =========================
// LOGOUT
// =========================
function logout() {
  localStorage.removeItem("adminLogin");
  window.location.href = "index.html"; // Ensure this points to your login page
}

// =========================
// START APP / EVENT LISTENERS
// =========================
window.addEventListener("DOMContentLoaded", () => {
  
  // LOAD ORDERS INITIALLY
  loadOrders();

  // VIEW MORE / VIEW LESS BUTTON
  document.getElementById("viewMoreCompleteBtn")?.addEventListener("click", () => {
    showingAllComplete = !showingAllComplete; // Toggles back and forth
    loadOrders(); 
  });

  // SEARCH & FILTER LISTENERS
  document.getElementById("searchCustomer")?.addEventListener("input", () => {
    showingAllComplete = false; 
    loadOrders();
  });
  
  document.getElementById("filterDate")?.addEventListener("change", () => {
    showingAllComplete = false;
    loadOrders();
  });

  // GLOBAL BUTTONS
  document.getElementById("addOrderBtn")?.addEventListener("click", addOrder);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  // DELETE TOAST MODAL BUTTONS
  document.getElementById("confirmDeleteBtn")?.addEventListener("click", async () => {
    if (deleteOrderId) {
      await deleteOrder(deleteOrderId);
      deleteOrderId = null;
    }
    document.getElementById("deleteToast")?.classList.remove("show");
  });

  document.getElementById("cancelDeleteBtn")?.addEventListener("click", () => {
    deleteOrderId = null;
    document.getElementById("deleteToast")?.classList.remove("show");
  });

});
