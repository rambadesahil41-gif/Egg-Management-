import { db } from "./firebase.js";

import {

  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// LOGIN CHECK
// =========================

if (

  localStorage.getItem(
    "adminLogin"
  ) !== "true"

){

  window.location.href =
  "index.html";

}

// =========================
// ORDERS ARRAY
// =========================

let orders = [];

// =========================
// TOAST FUNCTION
// =========================

function showToast(message){

  let toast =

  document.getElementById(
    "toast"
  );

  toast.innerText =
  message;

  toast.classList.add(
    "show"
  );

  setTimeout(()=>{

    toast.classList.remove(
      "show"
    );

  },2000);

}

// =========================
// ADD ORDER
// =========================

async function addOrder(){

  let customerName =

  document.getElementById(
    "customerName"
  ).value.trim();

  let trayPrice =

  document.getElementById(
    "trayPrice"
  ).value.trim();

  let trayQty =

  document.getElementById(
    "trayQty"
  ).value.trim();

  let date =

  document.getElementById(
    "date"
  ).value;

  let status =

  document.getElementById(
    "status"
  ).value;

  let payment =

  document.getElementById(
    "payment"
  ).value;

  let moneyStatus =

  document.getElementById(
    "moneyStatus"
  ).value;

  // VALIDATION

  if(

    customerName === "" ||

    trayPrice === "" ||

    trayQty === "" ||

    date === ""

  ){

    showToast(
      "Please Fill All Fields"
    );

    return;

  }

  // TOTAL

  let total =

  Number(trayPrice) *

  Number(trayQty);

  // ORDER OBJECT

  let order = {

    customerName,

    trayPrice:
    Number(trayPrice),

    trayQty:
    Number(trayQty),

    total,

    date,

    status,

    payment,

    moneyStatus

  };

  try{

    // SAVE FIREBASE

    await addDoc(

      collection(db,"orders"),

      order

    );

    // CLEAR INPUTS

    document.getElementById(
      "customerName"
    ).value = "";

    document.getElementById(
      "trayPrice"
    ).value = "";

    document.getElementById(
      "trayQty"
    ).value = "";

    document.getElementById(
      "date"
    ).value = "";

    // RELOAD

    loadOrders();

    showToast(
      "Order Added Successfully"
    );

  }

  catch(error){

    console.log(error);

    showToast(
      error.message
    );

  }

}

// =========================
// LOAD ORDERS
// =========================

async function loadOrders(){

  let pendingTable =

  document.getElementById(
    "pendingTable"
  );

  let completeTable =

  document.getElementById(
    "completeTable"
  );

  pendingTable.innerHTML = "";

  completeTable.innerHTML = "";

  let totalProfit = 0;

  try{

    // GET FIREBASE DATA

    const querySnapshot =

    await getDocs(

      collection(db,"orders")

    );

    orders = [];

    querySnapshot.forEach(
      (docItem)=>{

        orders.push({

          id:docItem.id,

          ...docItem.data()

        });

      }
    );

    // EMPTY DATA

    if(orders.length === 0){

      pendingTable.innerHTML = `

      <tr>

        <td colspan="10"
        style="text-align:center;">

          No Orders Found

        </td>

      </tr>

      `;

      completeTable.innerHTML = `

      <tr>

        <td colspan="10"
        style="text-align:center;">

          No Complete Orders

        </td>

      </tr>

      `;

      document.getElementById(
        "totalProfit"
      ).innerText = 0;

      return;

    }

    // LOOP ORDERS

    orders.forEach((order,index)=>{

      // TOTAL PROFIT

      if(

        order.status === "Complete" &&

        order.moneyStatus === "Paid"

      ){

        totalProfit +=

        Number(order.total);

      }

      // ROW

      let row = `

      <tr>

        <td>${index + 1}</td>

        <td>${order.customerName}</td>

        <td>₹${order.trayPrice}</td>

        <td>${order.trayQty}</td>

        <td>₹${order.total}</td>

        <td>${order.date}</td>

        <td>

          <span class="${
            order.status === "Pending"
            ? "pending"
            : "complete"
          }">

            ${order.status}

          </span>

        </td>

        <td>

          ${order.payment}

        </td>

        <td>

          <button

          class="${
            order.moneyStatus === "Pending"
            ? "pending-btn"
            : "paid-btn"
          } money-btn"

          data-id="${order.id}"

          data-status="${order.moneyStatus}">

            ${order.moneyStatus}

          </button>

        </td>

        <td>

          ${
            order.status === "Pending"

            ?

            `<button

            class="complete-btn action-complete"

            data-id="${order.id}">

              Complete

            </button>`

            :

            `<button
            class="done-btn">

              Done

            </button>`
          }

          <button

          class="delete-btn action-delete"

          data-id="${order.id}">

            Delete

          </button>

        </td>

      </tr>

      `;

      // PENDING TABLE

      if(

        order.status === "Pending" ||

        order.moneyStatus === "Pending"

      ){

        pendingTable.innerHTML += row;

      }

      // COMPLETE TABLE

      if(

        order.status === "Complete" &&

        order.moneyStatus === "Paid"

      ){

        completeTable.innerHTML += row;

      }

    });

    // COMPLETE BUTTON

    document

    .querySelectorAll(
      ".action-complete"
    )

    .forEach(button=>{

      button.addEventListener(

        "click",

        async ()=>{

          await completeOrder(

            button.dataset.id

          );

        }

      );

    });

    // DELETE BUTTON

    document

    .querySelectorAll(
      ".action-delete"
    )

    .forEach(button=>{

      button.addEventListener(

        "click",

        async ()=>{

          await deleteOrder(

            button.dataset.id

          );

        }

      );

    });

    // MONEY BUTTON

    document

    .querySelectorAll(
      ".money-btn"
    )

    .forEach(button=>{

      button.addEventListener(

        "click",

        async ()=>{

          await toggleMoneyStatus(

            button.dataset.id,

            button.dataset.status

          );

        }

      );

    });

    // SHOW PROFIT

    document.getElementById(
      "totalProfit"
    ).innerText =
    totalProfit;

  }

  catch(error){

    console.log(error);

    showToast(
      error.message
    );

  }

}

// =========================
// COMPLETE ORDER
// =========================

async function completeOrder(id){

  try{

    await updateDoc(

      doc(db,"orders",id),

      {

        status:"Complete"

      }

    );

    showToast(
      "Order Completed"
    );

    loadOrders();

  }

  catch(error){

    console.log(error);

  }

}

// =========================
// MONEY STATUS
// =========================

async function toggleMoneyStatus(
  id,
  currentStatus
){

  let newStatus =

  currentStatus === "Pending"
  ? "Paid"
  : "Pending";

  try{

    await updateDoc(

      doc(db,"orders",id),

      {

        moneyStatus:newStatus

      }

    );

    showToast(
      "Money Status Updated"
    );

    loadOrders();

  }

  catch(error){

    console.log(error);

  }

}

// =========================
// DELETE ORDER
// =========================

async function deleteOrder(id){

  try{

    await deleteDoc(

      doc(db,"orders",id)

    );

    showToast(
      "Order Deleted"
    );

    loadOrders();

  }

  catch(error){

    console.log(error);

  }

}

// =========================
// LOGOUT
// =========================

function logout(){

  localStorage.removeItem(
    "adminLogin"
  );

  window.location.href =
  "index.html";

}

// =========================
// START APP
// =========================

window.addEventListener(

  "DOMContentLoaded",

  ()=>{

    // LOAD ORDERS

    loadOrders();

    // ADD ORDER BUTTON

    const addBtn =

    document.getElementById(
      "addOrderBtn"
    );

    if(addBtn){

      addBtn.addEventListener(

        "click",

        addOrder

      );

    }

    // LOGOUT BUTTON

    const logoutBtn =

    document.getElementById(
      "logoutBtn"
    );

    if(logoutBtn){

      logoutBtn.addEventListener(

        "click",

        logout

      );

    }

  }

);