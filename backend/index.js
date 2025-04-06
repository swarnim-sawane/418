require("dotenv").config();
const express = require("express");
const cors = require("cors");

const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("🍬 SugarTrace Backend is live!"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
