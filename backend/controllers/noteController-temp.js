const admin = require("firebase-admin");
const { GeoFirestore } = require("geofirestore");
const { db } = require("../config/firebase");

const { getStorage } = require("firebase-admin/storage");
const { v4: uuidv4 } = require("uuid");

const geofirestore = new GeoFirestore(db);
const notesCollection = geofirestore.collection("sugar_notes");

// POST /api/notes
const createNote = async (req, res) => {
  const { uid, note, location } = req.body;
  const file = req.file;

  if (!uid || !note || !location) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  let imageUrl = null;

  try {
    const geopoint = new admin.firestore.GeoPoint(location.lat, location.lng);
    const createdAt = new Date();

    const docRef = await notesCollection.add({
      content: note,
      createdBy: uid,
      createdAt,
      coordinates: geopoint,
      // The following fields are required for GeoFirestore to query properly
      g: {
        geopoint: geopoint,
        geohash: require("geofire-common").geohashForLocation([location.lat, location.lng])
      }
    });

    return res.status(201).json({ message: "Note created!", id: docRef.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/notes/nearby?lat=..&lng=..&radius=..
// GET /api/notes/nearby?lat=..&lng=..&radius=..
const getNearbyNotes = async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng are required." });
  }

  try {
    const center = new admin.firestore.GeoPoint(parseFloat(lat), parseFloat(lng));
    const radiusInKm = parseFloat(radius) || 1; // default to 1 km if not provided

    // This will use the GeoFirestore 'near' method to query the documents.
    const query = notesCollection.near({
      center,
      radius: radiusInKm,
    });

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No nearby notes found." });
    }

    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ notes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



module.exports = {
  createNote,
  getNearbyNotes,
};
