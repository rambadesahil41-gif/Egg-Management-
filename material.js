import { db } from "./firebase.js";

import {

  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// MATERIALS ARRAY
// =========================

let materials = [];

// =========================
// ADD MATERIAL
// =========================

async function addMaterial() {

  let materialName =
  document.getElementById(
    "materialName"
  ).value.trim();

  let materialQty =
  document.getElementById(
    "materialQty"
  ).value.trim();

  let materialUnit =
  document.getElementById(
    "materialUnit"
  ).value;

  let materialPrice =
  document.getElementById(
    "materialPrice"
  ).value.trim();

  // DATE

  let materialDate =
  document.getElementById(
    "materialDate"
  ).value;

  // VALIDATION

  if (

    materialName === "" ||

    materialQty === "" ||

    materialPrice === "" ||

    materialDate === ""

  ) {

    return;

  }

  // OVERALL PRICE

  let overallPrice =

  Number(materialQty) *

  Number(materialPrice);

  // MATERIAL OBJECT

  let material = {

    materialName,

    materialQty:
    Number(materialQty),

    materialUnit,

    materialPrice:
    Number(materialPrice),

    materialDate,

    overallPrice

  };

  try {

    // SAVE FIREBASE

    await addDoc(

      collection(db,"materials"),

      material

    );

    // CLEAR INPUTS

    document.getElementById(
      "materialName"
    ).value = "";

    document.getElementById(
      "materialQty"
    ).value = "";

    document.getElementById(
      "materialPrice"
    ).value = "";

    document.getElementById(
      "materialDate"
    ).value = "";

    // RELOAD

    loadMaterials();

  }

  catch(error){

    console.log(error);

  }

}

// =========================
// LOAD MATERIALS
// =========================

async function loadMaterials() {

  let table =
  document.getElementById(
    "materialTable"
  );

  table.innerHTML = "";

  let totalMaterialCost = 0;

  try {

    // GET FIREBASE DATA

    const querySnapshot =
    await getDocs(

      collection(db,"materials")

    );

    materials = [];

    querySnapshot.forEach(
      (docItem)=>{

        materials.push({

          id: docItem.id,

          ...docItem.data()

        });

      }
    );

    // EMPTY DATA

    if (materials.length === 0) {

      table.innerHTML = `

        <tr>

          <td colspan="8"
          class="empty">

            No Material Found

          </td>

        </tr>

      `;

      document.getElementById(
        "totalMaterialCost"
      ).innerText = 0;

      return;

    }

    // LOOP MATERIALS

    materials.forEach(
      (material,index)=>{

        // TOTAL COST

        totalMaterialCost +=
        Number(
          material.overallPrice
        );

        // TABLE ROW

        table.innerHTML += `

          <tr>

            <td>${index + 1}</td>

            <td>

              ${material.materialDate || "-"}

            </td>

            <td>

              ${material.materialName}

            </td>

            <td>

              ${material.materialQty}

            </td>

            <td>

              ${material.materialUnit}

            </td>

            <td>

              ₹${material.materialPrice}

            </td>

            <td>

              ₹${material.overallPrice}

            </td>

            <td>

              <button
              class="delete-btn material-delete"

              data-id="${material.id}">

                Delete

              </button>

            </td>

          </tr>

        `;

      }
    );

    // DELETE BUTTONS

    document
    .querySelectorAll(
      ".material-delete"
    )

    .forEach(button => {

      button.addEventListener(

        "click",

        async ()=>{

          await deleteMaterial(

            button.dataset.id

          );

        }

      );

    });

    // SHOW TOTAL COST

    document.getElementById(
      "totalMaterialCost"
    ).innerText =
    totalMaterialCost;

  }

  catch(error){

    console.log(error);

  }

}

// =========================
// DELETE MATERIAL
// =========================

async function deleteMaterial(id) {

  try {

    await deleteDoc(

      doc(
        db,
        "materials",
        id
      )

    );

    loadMaterials();

  }

  catch(error){

    console.log(error);

  }

}

// =========================
// START
// =========================

loadMaterials();

// =========================
// BUTTON EVENTS
// =========================

document
.getElementById("addMaterialBtn")
.addEventListener(
  "click",
  addMaterial
);