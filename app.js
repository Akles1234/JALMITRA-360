
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
  getFirestore, doc, getDoc, getDocs, collection,
  query, orderBy, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

import {
  getAuth, signInWithEmailAndPassword, signInAnonymously,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

import {
  getStorage, ref, uploadBytesResumable, getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-storage.js";

// FIREBASE CONFIG
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
const storage = getStorage(firebaseApp);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function setMessage(el, msg) {
  if (el) el.textContent = msg;
}

// ADMIN CHECK
async function isAdminUser(user) {
  if (!user || user.isAnonymous) return false;

  if (!ALLOWED_ADMIN_UIDS.includes(user.uid)) {
    throw new Error("यह UID अधिकृत Admin सूची में नहीं है।");
  }

  const snap = await getDoc(doc(db, "admins", user.uid));

  if (!snap.exists() || snap.data().active !== true) {
    throw new Error("Admin account सक्रिय नहीं है।");
  }

  return true;
}

// STATES
const states = [
  "आंध्र प्रदेश", "अरुणाचल प्रदेश", "असम", "बिहार", "छत्तीसगढ़",
  "गोवा", "गुजरात", "हरियाणा", "हिमाचल प्रदेश", "झारखंड",
  "कर्नाटक", "केरल", "मध्य प्रदेश", "महाराष्ट्र", "मणिपुर",
  "मेघालय", "मिजोरम", "नागालैंड", "ओडिशा", "पंजाब",
  "राजस्थान", "तमिलनाडु", "तेलंगाना", "त्रिपुरा",
  "उत्तर प्रदेश", "उत्तराखंड", "पश्चिम बंगाल", "चंडीगढ़", "दिल्ली"
];

if ($("#state") && $("#state").options.length <= 1) {
  states.forEach(s => $("#state").add(new Option(s, s)));
}

// NAVIGATION
function go(pageId) {
  $$(".page").forEach(p => p.classList.toggle("active", p.id === pageId));

  $$("[data-page]").forEach(b => {
    b.classList.toggle("selected", b.dataset.page === pageId);
  });

  $("#drawer")?.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pageId === "admin") refreshAdmin();
  if (pageId === "stats") refreshStats();
}

$$("[data-page]").forEach(b => {
  b.addEventListener("click", () => go(b.dataset.page));
});

$("#menuBtn")?.addEventListener("click", () => {
  $("#drawer")?.classList.toggle("hidden");
});

// BEAUTIFUL NOTIFICATION CENTER
const notifications = [
  {
    icon: "🌊",
    title: "JALMITRA 360 में आपका स्वागत है!",
    message: "आपकी एक छोटी-सी पहल हजारों लोगों के जीवन में बड़ा बदलाव ला सकती है। आइए, मिलकर हर घर तक स्वच्छ जल पहुँचाने का संकल्प लें।",
    tag: "WELCOME"
  },
  {
    icon: "💧",
    title: "पानी की हर बूँद अनमोल है!",
    message: "जल ही जीवन है। पानी को व्यर्थ न बहाएँ। आज पानी बचाएँ, आने वाली पीढ़ियों का भविष्य सुरक्षित बनाएँ।",
    tag: "SAVE WATER"
  },
  {
    icon: "📢",
    title: "अब आपकी शिकायत होगी आसान!",
    message: "पानी से जुड़ी किसी भी समस्या के लिए ऐप में अपनी शिकायत दर्ज करें और अपनी Report ID सुरक्षित रखें।",
    tag: "PUBLIC SERVICE"
  },
  {
    icon: "🔍",
    title: "अपनी शिकायत का स्टेटस जानें!",
    message: "अपनी Report ID डालकर कभी भी शिकायत की स्थिति चेक करें। आपकी समस्या की जानकारी आपके लिए उपलब्ध है।",
    tag: "TRACK REPORT"
  },
  {
    icon: "🤝",
    title: "आपकी आवाज़, हमारा उद्देश्य!",
    message: "आपकी शिकायत और सुझाव बेहतर जल सेवा की दिशा में एक महत्वपूर्ण कदम हैं। जागरूक नागरिक बनें और दूसरों को भी जागरूक करें।",
    tag: "TOGETHER"
  },
  {
    icon: "🌱",
    title: "आइए जल संरक्षण का संकल्प लें!",
    message: "नल खुला न छोड़ें, पानी का सही उपयोग करें और वर्षा जल संचयन को बढ़ावा दें। जल बचाना हम सभी की जिम्मेदारी है।",
    tag: "GREEN FUTURE"
  },
  {
    icon: "❤️",
    title: "JALMITRA 360 परिवार की ओर से धन्यवाद!",
    message: "इस डिजिटल जल सेवा से जुड़ने के लिए आपका आभार। आपका सहयोग ही हमारी सबसे बड़ी ताकत है।",
    tag: "THANK YOU"
  }
];

function showNotice() {
  $("#jalmitraNoticeModal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "jalmitraNoticeModal";

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "999999",
    background: "rgba(0,15,35,.78)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px"
  });

  const panel = document.createElement("div");

  Object.assign(panel.style, {
    width: "100%",
    maxWidth: "440px",
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#ffffff",
    color: "#173047",
    borderRadius: "22px",
    padding: "18px",
    boxSizing: "border-box",
    boxShadow: "0 15px 50px rgba(0,0,0,.35)"
  });

  const banner = document.createElement("div");

  Object.assign(banner.style, {
    background: "linear-gradient(135deg,#075985,#0891b2,#14b8a6)",
    color: "white",
    padding: "22px 15px",
    borderRadius: "17px",
    textAlign: "center",
    marginBottom: "17px"
  });

  const logo = document.createElement("div");
  logo.textContent = "💧";

  Object.assign(logo.style, {
    fontSize: "42px",
    marginBottom: "6px"
  });

  const brand = document.createElement("h2");
  brand.textContent = "JALMITRA 360";

  Object.assign(brand.style, {
    margin: "0",
    fontSize: "24px",
    letterSpacing: "1px"
  });

  const subtitle = document.createElement("p");
  subtitle.textContent = "जल सेवा • जन सेवा • हमारा संकल्प";

  Object.assign(subtitle.style, {
    margin: "8px 0 0",
    fontSize: "13px",
    color: "#e0f2fe"
  });

  banner.append(logo, brand, subtitle);

  const header = document.createElement("div");

  Object.assign(header.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px"
  });

  const heading = document.createElement("h3");
  heading.textContent = "🔔 आज की खास सूचनाएँ";
  heading.style.margin = "0";
  heading.style.fontSize = "17px";

  const close = document.createElement("button");
  close.textContent = "✕";
  close.type = "button";

  Object.assign(close.style, {
    width: "35px",
    height: "35px",
    border: "0",
    borderRadius: "50%",
    background: "#e8f1f7",
    color: "#173047",
    fontSize: "17px",
    cursor: "pointer"
  });

  close.addEventListener("click", () => overlay.remove());

  header.append(heading, close);
  panel.append(banner, header);

  notifications.forEach((item, index) => {
    const card = document.createElement("div");

    Object.assign(card.style, {
      display: "flex",
      gap: "12px",
      padding: "14px 12px",
      marginBottom: "11px",
      borderRadius: "14px",
      border: "1px solid #dceaf2",
      background: index % 2 === 0 ? "#f0f9ff" : "#f0fdfa"
    });

    const icon = document.createElement("div");
    icon.textContent = item.icon;

    Object.assign(icon.style, {
      fontSize: "28px",
      minWidth: "35px",
      textAlign: "center"
    });

    const content = document.createElement("div");
    content.style.flex = "1";

    const tag = document.createElement("small");
    tag.textContent = item.tag;

    Object.assign(tag.style, {
      color: "#0891b2",
      fontWeight: "bold",
      fontSize: "10px",
      letterSpacing: "1px"
    });

    const title = document.createElement("h4");
    title.textContent = item.title;

    Object.assign(title.style, {
      margin: "4px 0 6px",
      fontSize: "15px",
      color: "#075985"
    });

    const message = document.createElement("p");
    message.textContent = item.message;

    Object.assign(message.style, {
      margin: "0",
      fontSize: "13px",
      lineHeight: "1.65",
      color: "#334155"
    });

    content.append(tag, title, message);
    card.append(icon, content);
    panel.append(card);
  });

  const footer = document.createElement("div");

  Object.assign(footer.style, {
    textAlign: "center",
    background: "#ecfeff",
    borderRadius: "13px",
    padding: "14px 8px",
    marginTop: "15px"
  });

  footer.textContent = "💙 जल है तो कल है! 💧";

  const thanks = document.createElement("p");
  thanks.textContent = "आपका दिन शुभ और मंगलमय हो!";
  thanks.style.margin = "7px 0 0";
  thanks.style.fontSize = "12px";

  footer.append(thanks);
  panel.append(footer);
  overlay.append(panel);

  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.append(overlay);
}

$("#notificationBtn")?.addEventListener("click", showNotice);
$("#bottomNotice")?.addEventListener("click", showNotice);

// REPORT ID
function makeReportId() {
  const d = new Date();

  const datePart = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("");

  const randomPart = crypto.randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `JM360-${datePart}-${randomPart}`;
}

// PHOTO PREVIEW
let selectedPhoto = null;

const photoInput = $("#complaintPhoto");
const photoPreview = $("#photoPreview");
const uploadStatus = $("#uploadStatus");

photoInput?.addEventListener("change", () => {
  const file = photoInput.files?.[0];

  selectedPhoto = null;

  if (photoPreview) {
    photoPreview.style.display = "none";
    photoPreview.removeAttribute("src");
  }

  setMessage(uploadStatus, "");

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    alert("कृपया JPG, PNG या WEBP फोटो चुनें।");
    photoInput.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("फोटो का आकार 5 MB से कम होना चाहिए।");
    photoInput.value = "";
    return;
  }

  selectedPhoto = file;

  if (photoPreview) {
    photoPreview.src = URL.createObjectURL(file);
    photoPreview.style.display = "block";
  }

  setMessage(uploadStatus, "फोटो अपलोड के लिए तैयार है।");
});

// PHOTO UPLOAD
async function uploadComplaintPhoto(file, reportId) {
  if (!auth.currentUser) await signInAnonymously(auth);

  const uid = auth.currentUser.uid;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `complaints/${uid}/${reportId}/${Date.now()}_${safeName}`;

  const storageRef = ref(storage, filePath);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type
  });

  await new Promise((resolve, reject) => {
    task.on("state_changed", snapshot => {
      const percent = Math.round(
        snapshot.bytesTransferred / snapshot.totalBytes * 100
      );
      setMessage(uploadStatus, `फोटो अपलोड हो रहा है: ${percent}%`);
    }, reject, resolve);
  });

  return {
    photoURL: await getDownloadURL(task.snapshot.ref),
    photoPath: filePath
  };
}

// SUBMIT COMPLAINT
$("#complaintForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const button = form.querySelector('[type="submit"]');
  const originalText = button?.textContent;

  if (button) {
    button.disabled = true;
    button.textContent = "शिकायत जमा हो रही है...";
  }

  try {
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.photo;

    const reportId = makeReportId();
    let photoData = {};

    if (selectedPhoto) {
      photoData = await uploadComplaintPhoto(selectedPhoto, reportId);
    }

    setMessage(uploadStatus, "शिकायत सेव हो रही है...");

    const batch = writeBatch(db);

    batch.set(doc(db, "complaints", reportId), {
      ...data,
      ...photoData,
      reportId,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    batch.set(doc(db, "tracking", reportId), {
      reportId,
      status: "Pending",
      type: data.type,
      createdAt: serverTimestamp()
    });

    await batch.commit();

    if ($("#successId")) $("#successId").textContent = reportId;

    form.reset();
    selectedPhoto = null;

    if (photoPreview) {
      photoPreview.style.display = "none";
      photoPreview.removeAttribute("src");
    }

    setMessage(uploadStatus, "");
    go("success");

  } catch (error) {
    console.error(error);
    alert("शिकायत जमा नहीं हो सकी: " + error.message);

  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText || "शिकायत जमा करें";
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
    const snap = await getDoc(doc(db, "tracking", reportId));

    if (!snap.exists()) {
      setMessage(output, "इस Report ID की शिकायत नहीं मिली।");
      return;
    }

    const item = snap.data();
    output.replaceChildren();

    const result = document.createElement("div");
    result.className = "result";

    const heading = document.createElement("b");
    heading.textContent = "शिकायत की स्थिति";

    const id = document.createElement("p");
    id.textContent = "Report ID: " + item.reportId;

    const type = document.createElement("p");
    type.textContent = "समस्या: " + (item.type || "उपलब्ध नहीं");

    const labels = {
      Pending: "नई शिकायत",
      "In Review": "जांच जारी",
      Resolved: "समाधान हो गया"
    };

    const status = document.createElement("p");
    status.textContent = "स्थिति: " + (labels[item.status] || item.status);

    result.append(heading, id, type, status);
    output.append(result);

  } catch (error) {
    console.error(error);
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
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await isAdminUser(credential.user);

    $("#adminLogin")?.classList.add("hidden");
    $("#adminDashboard")?.classList.remove("hidden");

    setMessage(message, "");
    await refreshAdmin();

  } catch (error) {
    console.error(error);
    setMessage(message, "लॉगिन असफल: " + (error.code || "") + " " + error.message);

    if (auth.currentUser) await signOut(auth).catch(console.error);

  } finally {
    if (button) button.disabled = false;
  }
});

// RESTORE ADMIN SESSION
onAuthStateChanged(auth, async user => {
  if (user?.isAnonymous) return;

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
    console.error(error);
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
    console.error(error);
    alert("Logout नहीं हो सका।");
  }
});

// ADMIN DASHBOARD
async function refreshAdmin() {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return;

  try {
    await isAdminUser(user);

    const q = query(
      collection(db, "complaints"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    const complaints = snap.docs.map(d => d.data());

    if ($("#totalCount")) $("#totalCount").textContent = complaints.length;
    if ($("#newCount")) {
      $("#newCount").textContent =
        complaints.filter(x => x.status === "Pending").length;
    }
    if ($("#pendingCount")) {
      $("#pendingCount").textContent =
        complaints.filter(x => x.status === "In Review").length;
    }
    if ($("#doneCount")) {
      $("#doneCount").textContent =
        complaints.filter(x => x.status === "Resolved").length;
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

    complaints.forEach(item => {
      const row = document.createElement("div");
      row.className = "complaint-row";

      const title = document.createElement("b");
      title.textContent = `${item.reportId} · ${item.type || "शिकायत"}`;

      const detail = document.createElement("p");
      detail.textContent =
        `${item.name || ""} · ${item.phone || ""} · ` +
        `${item.place || ""}, ${item.district || ""}, ${item.state || ""}`;

      const description = document.createElement("p");
      description.textContent = item.details || "";

      if (item.photoURL) {
        const photo = document.createElement("img");
        photo.src = item.photoURL;
        photo.alt = "शिकायत की फोटो";
        photo.loading = "lazy";

        Object.assign(photo.style, {
          maxWidth: "250px",
          width: "100%",
          height: "auto",
          display: "block",
          margin: "10px 0",
          borderRadius: "10px"
        });

        row.append(photo);
      }

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
        select.disabled = true;

        try {
          const batch = writeBatch(db);
          batch.update(doc(db, "complaints", item.reportId), {
            status: select.value
          });
          batch.update(doc(db, "tracking", item.reportId), {
            status: select.value
          });

          await batch.commit();
          await refreshAdmin();

        } catch (error) {
          console.error(error);
          alert("स्थिति अपडेट नहीं हुई: " + error.message);
          select.disabled = false;
        }
      });

      row.append(title, detail, description, select);
      list.append(row);
    });

  } catch (error) {
    console.error(error);
    setMessage($("#adminList"), "शिकायतें लोड नहीं हुईं: " + error.message);
  }
}

// STATISTICS
async function refreshStats() {
  const statsText = $("#statsText");
  if (!statsText) return;

  try {
    const snap = await getDocs(collection(db, "tracking"));
    statsText.textContent = `अब तक ${snap.size} शिकायतें दर्ज हुई हैं।`;
  } catch (error) {
    console.error(error);
    statsText.textContent = "आंकड़े अभी उपलब्ध नहीं हैं।";
  }
}

// CONTACT
window.JALMITRA_CONTACT = {
  email: ADMIN_EMAIL,
  phone: CONTACT_PHONE
};
