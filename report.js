import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// MONTHS
// =========================

const months = [
  "Jan","Feb","Mar","Apr",
  "May","Jun","Jul","Aug",
  "Sep","Oct","Nov","Dec"
];

// =========================
// LOAD REPORT
// =========================

async function loadReport() {

  let totalProfit = 0;
  let totalExpense = 0;

  let monthlyProfit = new Array(12).fill(0);
  let monthlyExpense = new Array(12).fill(0);

  try {

    // =========================
    // ORDERS (PROFIT)
    // =========================

    const orderSnapshot = await getDocs(
      collection(db, "orders")
    );

    orderSnapshot.forEach(docItem => {

      const order = docItem.data();

      if (
        order.status === "Complete" &&
        order.moneyStatus === "Paid"
      ) {

        if (order.date) {

          const month =
            new Date(order.date).getMonth();

          monthlyProfit[month] +=
            Number(order.total || 0);

        }

      }

    });

    // =========================
    // MATERIALS (EXPENSE)
    // =========================

    const materialSnapshot = await getDocs(
      collection(db, "materials")
    );

    materialSnapshot.forEach(docItem => {

      const material = docItem.data();

      if (material.materialDate) {

        const month =
          new Date(
            material.materialDate
          ).getMonth();

        monthlyExpense[month] +=
          Number(
            material.overallPrice || 0
          );

      }

    });

    // =========================
    // TABLE
    // =========================

    const reportTable =
      document.getElementById(
        "reportTable"
      );

    reportTable.innerHTML = "";

    months.forEach((month, index) => {

      const profit =
        monthlyProfit[index];

      const expense =
        monthlyExpense[index];

      const balance =
        profit - expense;

      totalProfit += profit;
      totalExpense += expense;

      reportTable.innerHTML += `
        <tr>
          <td>${month}</td>
          <td>₹${profit.toFixed(2)}</td>
          <td>₹${expense.toFixed(2)}</td>
          <td>₹${balance.toFixed(2)}</td>
        </tr>
      `;
    });

    // =========================
    // TOTALS
    // =========================

    document.getElementById(
      "totalProfit"
    ).innerText =
      `${totalProfit.toFixed(2)}`;

    document.getElementById(
      "totalExpense"
    ).innerText =
      `${totalExpense.toFixed(2)}`;

    document.getElementById(
      "netBalance"
    ).innerText =
      `${(
        totalProfit - totalExpense
      ).toFixed(2)}`;

    // =========================
    // CHART
    // =========================

    const chartCanvas =
      document.getElementById(
        "financeChart"
      );

    if (window.financeChartInstance) {
      window.financeChartInstance.destroy();
    }

    window.financeChartInstance =
      new Chart(chartCanvas, {

        type: "bar",

        data: {

          labels: months,

          datasets: [

            {
              label: "Profit",
              data: monthlyProfit,
              backgroundColor: "#28a745"
            },

            {
              label: "Expense",
              data: monthlyExpense,
              backgroundColor: "#dc3545"
            }

          ]

        },

        options: {
          responsive: true,
          maintainAspectRatio: false
        }

      });

  }

  catch (error) {

    console.error(error);
    alert(error.message);

  }

}

// =========================
// START
// =========================

loadReport();
