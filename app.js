
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDCqrxb4NVNZ5rP2AGNb6biUTw0Xns9Ax8",
  authDomain: "jalmitra-360.firebaseapp.com",
  projectId: "jalmitra-360",
  storageBucket: "jalmitra-360.firebasestorage.app",
  messagingSenderId: "217827320498",
  appId: "1:217827320498:web:f2b306dac416ce8ac81fab",
  measurementId: "G-YBDK6Q5VKY"
};

const ADMIN_EMAIL = "nargisnishanargisnisha@gmail.com";
const CONTACT_PHONE = "+916203544149";

const ALLOWED_ADMIN_UIDS = [
  "GecuvHCuEHWxi1YtYmTWxoL7Nru2",
  "SLS2s5Ss3ehQvW2EneVXFJyZbmm2"
];

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function setMessage(element, message) {
  if (element) element.textContent = message;
}

// ADMIN VERIFICATION
async function isAdminUser(user) {
  if (!user) return false;

  console.log("LOGIN EMAIL:", user.email);
  console.log("LOGIN UID:", user.uid);

  if (!ALLOWED_ADMIN_UIDS.includes(user.uid)) {
    throw new Error("यह UID अधिकृत Admin सूची में नहीं है: " + user.uid);
  }

  const adminRef = doc(db, "admins", user.uid);
  const adminSnap = await getDoc(adminRef);

  console.log("ADMIN DOCUMENT EXISTS:", adminSnap.exists());

  if (!adminSnap.exists()) {
    throw new Error("admins में UID का डॉक्यूमेंट नहीं मिला: " + user.uid);
  }

  const adminData = adminSnap.data();

  console.log("ADMIN DATA:", adminData);
  console.log("ACTIVE VALUE:", adminData.active);
  console.log("ACTIVE TYPE:", typeof adminData.active);

  if (adminData.active !== true) {
    throw new Error(
      "Firestore में active की असली वैल्यू true नहीं है। मिला: " +
      JSON.stringify(adminData.active) +
      " (Type: " + typeof adminData.active + ")"
    );
  }

  return true;
}

// INDIAN STATES
const states = [
  "आंध्र प्रदेश", "अरुणाचल प्रदेश", "असम", "बिहार", "छत्तीसगढ़",
  "गोवा", "गुजरात", "हरियाणा", "हिमाचल प्रदेश", "झारखंड",
  "कर्नाटक", "केरल", "मध्य प्रदेश", "महाराष्ट्र", "मणिपुर",
  "मेघालय", "मिजोरम", "नागालैंड", "ओडिशा", "पंजाब",
  "राजस्थान", "सिक्किम", "तमिलनाडु", "तेलंगाना", "त्रिपुरा",
  "उत्तर प्रदेश", "उत्तराखंड", "पश्चिम बंगाल",
  "अंडमान और निकोबार द्वीपसमूह", "चंडीगढ़",
  "दादरा और नगर हवेली और दमन और दीव", "दिल्ली",
  "जम्मू और कश्मीर", "लद्दाख", "लक्षद्वीप", "पुदुचेरी"
];

if ($("#state")) {
  states.forEach((state) => {
    $("#state").add(new Option(state, state));
  });
}

// NAVIGATION
function go(pageId) {
  $$(".page").forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });

  $$("[data-page]").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.page === pageId
    );
  });

  $("#drawer")?.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pageId === "admin") refreshAdmin();
  if (pageId === "stats") refreshStats();
}

$$("[data-page]").forEach((button) => {
  button.addEventListener("click", () => go(button.dataset.page));
});

$("#menuBtn")?.addEventListener("click", () => {
  $("#drawer")?.classList.toggle("hidden");
});

function showNotice() {
  alert("नई सूचनाएँ अभी उपलब्ध नहीं हैं।");
}

$("#notificationBtn")?.addEventListener("click", showNotice);
$("#bottomNotice")?.addEventListener("click", showNotice);

// GENERATE REPORT ID
function makeReportId() {
  const date = new Date();

  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");

  const randomPart = crypto.randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `JM360-${datePart}-${randomPart}`;
}

// SUBMIT COMPLAINT
$("#complaintForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('[type="submit"]');
  const originalText = submitButton?.textContent;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "शिकायत जमा हो रही है...";
  }

  try {
    const formData = new FormData(form);
    const complaintData = Object.fromEntries(formData.entries());

    delete complaintData.photo;

    const reportId = makeReportId();
    const batch = writeBatch(db);

    batch.set(doc(db, "complaints", reportId), {
      ...complaintData,
      reportId,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    batch.set(doc(db, "tracking", reportId), {
      reportId,
      status: "Pending",
      type: complaintData.type,
      createdAt: serverTimestamp()
    });

    await batch.commit();

    if ($("#successId")) {
      $("#successId").textContent = reportId;
    }

    form.reset();
    go("success");

  } catch (error) {
    console.error("Complaint submission failed:", error);
    alert("शिकायत जमा नहीं हो सकी: " + error.message);

  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText || "शिकायत जमा करें";
    }
  }
});

// TRACK COMPLAINT
$("#trackBtn")?.addEventListener("click", async () => {
  const reportId = ($("#trackId")?.value || "").trim().toUpperCase();
  const output = $("#trackResult");

  if (!reportId) {
    setMessage(output, "कृपया Report ID दर्ज करें।");
    return;
  }

  setMessage(output, "शिकायत की स्थिति देखी जा रही है...");

  try {
    const snapshot = await getDoc(doc(db, "tracking", reportId));

    if (!snapshot.exists()) {
      setMessage(output, "इस Report ID की शिकायत नहीं मिली।");
      return;
    }

    const item = snapshot.data();
    output.replaceChildren();

    const result = document.createElement("div");
    result.className = "result";

    const heading = document.createElement("b");
    heading.textContent = "शिकायत की स्थिति";

    const idLine = document.createElement("p");
    idLine.textContent = "Report ID: " + item.reportId;

    const typeLine = document.createElement("p");
    typeLine.textContent = "समस्या: " + (item.type || "उपलब्ध नहीं");

    const statusLabels = {
      Pending: "नई शिकायत",
      "In Review": "जांच जारी",
      Resolved: "समाधान हो गया"
    };

    const statusLine = document.createElement("p");
    statusLine.textContent =
      "स्थिति: " + (statusLabels[item.status] || item.status);

    result.append(heading, idLine, typeLine, statusLine);
    output.append(result);

  } catch (error) {
    console.error("Tracking failed:", error);
    setMessage(output, "ट्रैकिंग उपलब्ध नहीं है: " + error.message);
  }
});

// ADMIN LOGIN
$("#adminLoginBtn")?.addEventListener("click", async () => {
  const email = ($("#adminEmail")?.value || "").trim().toLowerCase();
  const password = $("#adminPassword")?.value || "";
  const message = $("#adminMsg");
  const button = $("#adminLoginBtn");

  if (!email || !password) {
    setMessage(message, "कृपया ईमेल और पासवर्ड दर्ज करें।");
    return;
  }

  if (button) button.disabled = true;
  setMessage(message, "लॉगिन हो रहा है...");

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    await isAdminUser(credential.user);

    $("#adminLogin")?.classList.add("hidden");
    $("#adminDashboard")?.classList.remove("hidden");

    setMessage(message, "");
    await refreshAdmin();

  } catch (error) {
    console.error("Admin login failed:", error);

    setMessage(
      message,
      "लॉगिन असफल: " + (error.code || "") + " " + error.message
    );

    if (auth.currentUser) {
      await signOut(auth).catch(console.error);
    }

  } finally {
    if (button) button.disabled = false;
  }
});

// RESTORE ADMIN SESSION
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    $("#adminLogin")?.classList.remove("hidden");
    $("#adminDashboard")?.classList.add("hidden");
    return;
  }

  try {
    await isAdminUser(user);

    $("#adminLogin")?.classList.add("hidden");
    $("#adminDashboard")?.classList.remove("hidden");
    await refreshAdmin();

  } catch (error) {
    console.error("Session check failed:", error);
    $("#adminLogin")?.classList.remove("hidden");
    $("#adminDashboard")?.classList.add("hidden");
    await signOut(auth).catch(console.error);
  }
});

// ADMIN LOGOUT
$("#adminLogoutBtn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    go("home");
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Logout नहीं हो सका।");
  }
});

// ADMIN DASHBOARD
async function refreshAdmin() {
  if (!auth.currentUser) return;

  try {
    await isAdminUser(auth.currentUser);

    const complaintsQuery = query(
      collection(db, "complaints"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(complaintsQuery);
    const complaints = snapshot.docs.map((item) => item.data());

    if ($("#totalCount")) {
      $("#totalCount").textContent = complaints.length;
    }

    if ($("#newCount")) {
      $("#newCount").textContent =
        complaints.filter((item) => item.status === "Pending").length;
    }

    if ($("#pendingCount")) {
      $("#pendingCount").textContent =
        complaints.filter((item) => item.status === "In Review").length;
    }

    if ($("#doneCount")) {
      $("#doneCount").textContent =
        complaints.filter((item) => item.status === "Resolved").length;
    }

    const list = $("#adminList");
    if (!list) return;

    list.replaceChildren();

    if (!complaints.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "अभी कोई शिकायत नहीं है।";
      list.append(empty);
      return;
    }

    complaints.forEach((item) => {
      const row = document.createElement("div");
      row.className = "complaint-row";

      const title = document.createElement("b");
      title.textContent = `${item.reportId} · ${item.type}`;

      const detail = document.createElement("p");
      detail.textContent =
        `${item.name} · ${item.phone} · ${item.place}, ${item.district}, ${item.state}`;

      const description = document.createElement("p");
      description.textContent = item.details || "";

      const select = document.createElement("select");

      [
        ["Pending", "नई"],
        ["In Review", "जांच जारी"],
        ["Resolved", "समाधान हो गया"]
      ].forEach(([value, label]) => {
        select.add(new Option(label, value));
      });

      select.value = item.status || "Pending";

      select.addEventListener("change", async () => {
        const newStatus = select.value;
        select.disabled = true;

        try {
          const batch = writeBatch(db);

          batch.update(
            doc(db, "complaints", item.reportId),
            { status: newStatus }
          );

          batch.update(
            doc(db, "tracking", item.reportId),
            { status: newStatus }
          );

          await batch.commit();
          await refreshAdmin();

        } catch (error) {
          console.error("Status update failed:", error);
          alert("स्थिति अपडेट नहीं हुई: " + error.message);
          select.disabled = false;
        }
      });

      row.append(title, detail, description, select);
      list.append(row);
    });

  } catch (error) {
    console.error("Admin list failed:", error);
    setMessage($("#adminList"), "शिकायतें लोड नहीं हुईं: " + error.message);
  }
}

// COMPLAINT STATISTICS
async function refreshStats() {
  const statsText = $("#statsText");
  if (!statsText) return;

  try {
    const snapshot = await getDocs(collection(db, "tracking"));

    statsText.textContent =
      `अब तक ${snapshot.size} शिकायतें दर्ज हुई हैं।`;

  } catch (error) {
    console.error("Stats failed:", error);
    statsText.textContent = "आंकड़े अभी उपलब्ध नहीं हैं।";
  }
}

// CONTACT INFORMATION
window.JALMITRA_CONTACT = {
  email: ADMIN_EMAIL,
  phone: CONTACT_PHONE
};
