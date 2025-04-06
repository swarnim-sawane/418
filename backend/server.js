const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import controller functions
const {
  registerUser,
  updateUserLocation,
  getNearbyUsers,
} = require("./controllers/userController-temp");

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post("/api/users/register", registerUser);
app.post("/api/users/update-location", updateUserLocation);
app.get("/api/users/nearby", getNearbyUsers);

// Root route (optional)
app.get("/", (req, res) => {
  res.send("🔥 GeoMatch API is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
