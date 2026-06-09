import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// MATERIALS ARRAY
// =========================

let materials = [];
let deleteMaterialId = null;
// =========================
// TOAST
// =========================

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  toast.innerText =
    message;

  toast.classList.add(
    "show"
  );

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

  }, 2000);

}

function showDeleteToast() {

  document
    .getElementById(
      "deleteToast"
    )
    .classList.add(
      "show"
    );

}
// =========================
// ADD MATERIAL
// =========================

async function addMaterial() {

  let materialName =
    document.getElementById("materialName")
      .value.trim();

  let materialQty =
    document.getElementById("materialQty")
      .value.trim();

  let materialUnit =
    document.getElementById("materialUnit")
      .value;

  let materialPrice =
    document.getElementById("materialPrice")
      .value.trim();

  let materialDate =
    document.getElementById("materialDate")
      .value;
  showToast(
    "Material Added Successfully"
  );
  // VALIDATION

  if (
    materialName === "" ||
    materialQty === "" ||
    materialPrice === "" ||
    materialDate === ""
  ) {
    return;
  }

  // OVERALL PRICE (2 DECIMAL)

  let overallPrice = Number(
    (
      Number(materialQty) *
      Number(materialPrice)
    ).toFixed(2)
  );

  // MATERIAL OBJECT

  let material = {

    materialName,

    materialQty:
      Number(materialQty),

    materialUnit,

    materialPrice:
      Number(
        Number(materialPrice)
          .toFixed(2)
      ),

    materialDate,

    overallPrice

  };

  try {

    await addDoc(
      collection(db, "materials"),
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

    loadMaterials();

  }
  catch (error) {

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

    const querySnapshot =
      await getDocs(
        collection(db, "materials")
      );

    materials = [];

    querySnapshot.forEach(
      (docItem) => {

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
          <td colspan="8" class="empty">
            No Material Found
          </td>
        </tr>
      `;

      document.getElementById(
        "totalMaterialCost"
      ).innerText = "0.00";

      return;

    }

    // LOOP MATERIALS

    materials.forEach(
      (material, index) => {

        totalMaterialCost +=
          Number(
            material.overallPrice || 0
          );

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
              ₹${Number(
          material.materialPrice || 0
        ).toFixed(2)}
            </td>

            <td>
              ₹${Number(
          material.overallPrice || 0
        ).toFixed(2)}
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

          () => {

            deleteMaterialId =
              button.dataset.id;

            showDeleteToast();

          }

        );

      });

    // TOTAL COST (2 DECIMAL)

    document.getElementById(
      "totalMaterialCost"
    ).innerText =
      totalMaterialCost.toFixed(2);

  }
  catch (error) {

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

    showToast(
      "Material Deleted Successfully"
    );

    loadMaterials();

  }
  catch (error) {

    console.log(error);

  }

}

// =========================
// START
// =========================

loadMaterials();

// =========================
// BUTTON EVENT
// =========================

document
  .getElementById(
    "addMaterialBtn"
  )
  .addEventListener(
    "click",
    addMaterial
  );

document
  .getElementById(
    "confirmDeleteBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (deleteMaterialId) {

        await deleteMaterial(
          deleteMaterialId
        );

        deleteMaterialId = null;

      }

      document
        .getElementById(
          "deleteToast"
        )
        .classList.remove(
          "show"
        );

    }
  );

document
  .getElementById(
    "cancelDeleteBtn"
  )
  .addEventListener(
    "click",
    () => {

      deleteMaterialId = null;

      document
        .getElementById(
          "deleteToast"
        )
        .classList.remove(
          "show"
        );

    }
  );
