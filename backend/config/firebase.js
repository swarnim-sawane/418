const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccountKey.json");
const { GeoFirestore } = require("geofirestore");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sugartrace.firebaseio.com",
});

const db = admin.firestore();
const geofirestore = new GeoFirestore(db); 

module.exports = { admin, db, geofirestore };
