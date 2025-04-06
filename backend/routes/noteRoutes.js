const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  createNote,
  getNearbyNotes,
  getUserNotes,
} = require("../controllers/noteController");

// POST /api/notes (with image upload)
router.post("/", upload.single("image"), createNote);

// GET /api/notes/nearby?lat=..&lng=..&radius=..
router.get("/nearby", getNearbyNotes);

// GET /api/notes/user/:uid
router.get("/user/:uid", getUserNotes);

module.exports = router;
