import { db } from "./firebase.js";

import {

  collection,
  getDocs

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// MONTHS
// =========================

let months = [

  "Jan","Feb","Mar","Apr",

  "May","Jun","Jul","Aug",

  "Sep","Oct","Nov","Dec"

];

// =========================
// DATA STORE
// =========================

let monthlyProfit =
new Array(12).fill(0);

let monthlyExpense =
new Array(12).fill(0);

// =========================
// LOAD REPORT
// =========================

async function loadReport() {

  let totalProfit = 0;

  let totalExpense = 0;

  // =========================
  // GET ORDERS FROM FIREBASE
  // =========================

  try {

    const orderSnapshot =
    await getDocs(

      collection(db,"orders")

    );

    orderSnapshot.forEach(doc => {

      let order = doc.data();

      // ONLY COMPLETE + PAID

      if (

        order.status === "Complete" &&

        order.moneyStatus === "Paid"

      ) {

        let month =

        new Date(
          order.date
        ).getMonth();

        monthlyProfit[month] +=

        Number(order.total);

      }

    });

    // =========================
    // GET MATERIALS FROM FIREBASE
    // =========================

    const materialSnapshot =
    await getDocs(

      collection(db,"materials")

    );

    materialSnapshot.forEach(doc => {

      let material = doc.data();

      // CURRENT MONTH

      let month =
      new Date().getMonth();

      monthlyExpense[month] +=

      Number(
        material.overallPrice
      );

    });

    // =========================
    // TABLE
    // =========================

    let reportTable =

    document.getElementById(
      "reportTable"
    );

    reportTable.innerHTML = "";

    months.forEach(
      (month,index)=>{

        let profit =
        monthlyProfit[index];

        let expense =
        monthlyExpense[index];

        let balance =
        profit - expense;

        totalProfit += profit;

        totalExpense += expense;

        reportTable.innerHTML += `

          <tr>

            <td>

              ${month}

            </td>

            <td>

              ₹${profit}

            </td>

            <td>

              ₹${expense}

            </td>

            <td>

              ₹${balance}

            </td>

          </tr>

        `;

      }
    );

    // =========================
    // SHOW TOTALS
    // =========================

    document.getElementById(

      "totalProfit"

    ).innerText =
    totalProfit;

    document.getElementById(

      "totalExpense"

    ).innerText =
    totalExpense;

    document.getElementById(

      "netBalance"

    ).innerText =

    totalProfit -
    totalExpense;

    // =========================
    // GRAPH
    // =========================

    new Chart(

      document.getElementById(
        "financeChart"
      ),

      {

        type:"bar",

        data:{

          labels:months,

          datasets:[

            {

              label:"Profit",

              data:
              monthlyProfit,

              backgroundColor:
              "#28a745"

            },

            {

              label:"Expense",

              data:
              monthlyExpense,

              backgroundColor:
              "#dc3545"

            }

          ]

        },

        options:{

          responsive:true

        }

      }

    );

  }

  catch(error){

    console.log(error);

    alert(
      error.message
    );

  }

}

// =========================
// START
// =========================

loadReport();