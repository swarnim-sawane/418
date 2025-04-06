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
    // Upload image if available
    if (file) {
      const bucket = getStorage().bucket();
      const filename = `notes/${uuidv4()}-${file.originalname}`;
      const fileUpload = bucket.file(filename);

      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
          },
        },
      });

      imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
    }

    const geopoint = new admin.firestore.GeoPoint(location.lat, location.lng);
    const createdAt = new Date();

    const docRef = await notesCollection.add({
      content: note,
      createdBy: uid,
      createdAt,
      image: imageUrl || null,
      coordinates: geopoint,
      g: {
        geopoint,
        geohash: require("geofire-common").geohashForLocation([location.lat, location.lng]),
      },
    });

    return res.status(201).json({ message: "Note created!", id: docRef.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/notes/nearby?lat=..&lng=..&radius=..
const getNearbyNotes = async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng are required." });
  }

  try {
    const center = new admin.firestore.GeoPoint(parseFloat(lat), parseFloat(lng));
    const radiusInKm = parseFloat(radius) || 1;

    const query = notesCollection.near({ center, radius: radiusInKm });
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

// GET /api/notes/feed
const getFeed = async (req, res) => {
  try {
    const snapshot = await notesCollection
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ notes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/notes/user/:uid
const getUserNotes = async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const snapshot = await notesCollection
      .where("createdBy", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

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
  getFeed,
  getUserNotes,
};
