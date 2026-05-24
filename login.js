import { db } from "./firebase.js";

import {

  collection,
  getDocs

} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// LOGIN FUNCTION
// =========================

async function login() {

  let username =

    document.getElementById(
      "username"
    ).value.trim();

  let password =

    document.getElementById(
      "password"
    ).value.trim();

  let errorBox =

    document.getElementById(
      "error"
    );

  errorBox.innerText = "";

  // VALIDATION

  if (

    username === "" ||

    password === ""

  ) {

    errorBox.innerText =

      "Please Fill All Fields";

    return;

  }

  try {

    // GET FIREBASE DATA

    const querySnapshot =

      await getDocs(

        collection(db, "admin")

      );

    let loginSuccess = false;

    querySnapshot.forEach(doc => {

      let admin = doc.data();

      console.log(admin);

      // CHECK LOGIN

      if (

        admin.Username === username &&

        String(admin.Password) === password

      ) {

        loginSuccess = true;

      }

    });

    // SUCCESS

    if (loginSuccess) {

      localStorage.setItem(

        "adminLogin",

        "true"

      );

      window.location.href =
        "dashboard.html";

    }

    // FAILED

    else {

      errorBox.innerText =

        "Invalid Username or Password";

    }

  }

  catch (error) {

    console.log(error);

    alert(error.message);

  }

}

// =========================
// START APP
// =========================

window.addEventListener(

  "DOMContentLoaded",

  () => {

    document
      .getElementById(
        "loginBtn"
      )

      .addEventListener(
        "click",
        login
      );

    // ENTER KEY

    document
      .addEventListener(

        "keydown",

        (event) => {

          if (event.key === "Enter") {

            login();

          }

        }

      );

  }

);