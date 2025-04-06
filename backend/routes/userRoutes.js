const express = require("express");
const router = express.Router();
const { registerUser, updateUserLocation, getNearbyUsers } = require("../controllers/userController");

// Register a new user (you can replace this with Firebase Auth later)
router.post("/register", registerUser);

// Update user’s location (required for nearby detection)
router.post("/update-location", updateUserLocation);

// Get users near a location
router.get("/nearby", getNearbyUsers);

module.exports = router;
