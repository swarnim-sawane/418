const { db, admin } = require("../config/firebase");
const { GeoFirestore } = require("geofirestore");

const geofirestore = new GeoFirestore(db);
const usersCollection = geofirestore.collection("users");

// POST /api/users/register
const registerUser = async (req, res) => {
  const { uid, name, email, location } = req.body;

  if (!uid || !name || !email || !location) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await usersCollection.doc(uid).set({
      name,
      email,
      coordinates: new admin.firestore.GeoPoint(location.lat, location.lng),
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/update-location
const updateUserLocation = async (req, res) => {
  const { uid, location } = req.body;

  if (!uid || !location) {
    return res.status(400).json({ error: "Missing uid or location." });
  }

  try {
    await usersCollection.doc(uid).set(
      {
        coordinates: new admin.firestore.GeoPoint(location.lat, location.lng),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    res.json({ message: "Location updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/nearby?lat=..&lng=..&radius=..
const getNearbyUsers = async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing coordinates." });
  }

  try {
    const query = usersCollection.near({
      center: new admin.firestore.GeoPoint(parseFloat(lat), parseFloat(lng)),
      radius: parseFloat(radius) || 1,
    });

    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  updateUserLocation,
  getNearbyUsers,
};
