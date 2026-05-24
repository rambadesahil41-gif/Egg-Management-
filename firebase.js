import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyD0RTUJE2EDPNO7YNvSNf-xvdRZG9vIGvBk",

  authDomain:
  "egg-management-7064a.firebaseapp.com",

  projectId:
  "egg-management-7064a",

  storageBucket:
  "egg-management-7064a.firebasestorage.app",

  messagingSenderId:
  "872366076029",

  appId:
  "1:872366076029:web:375c7092a3ac4d3f554114"

};

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

export { db };