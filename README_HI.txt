JALMITRA 360 - Mobile-first front-end starter
================================================

Files:
- index.html
- style.css
- app.js
- manifest.webmanifest

Run:
Open index.html in a browser or upload all files to a static host.

Important limitations:
- This is a front-end demo. Complaints are saved only in the current browser/device using localStorage.
- Report IDs and tracking work only for complaints stored on this device.
- The Admin login in this demo is NOT secure; it is only a visual/demo gate.
- Photo filename is recorded; the image is not uploaded to cloud storage.
- Gmail notifications are NOT sent.
- Firebase is NOT connected in this source. To connect your existing Firebase project, add its web config and implement Firestore, Storage, Firebase Authentication, and a trusted server/Cloud Function for email notifications. Never put service-account private keys or SMTP passwords in browser code.
- Do not publish this demo as a production complaint service until backend security, validation, privacy policy, and data handling are implemented and tested.

Next Android step:
This source can be wrapped with Capacitor and built as Android App Bundle using a cloud build workflow, but it still needs Firebase integration and Android project configuration.
