const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const goapiRoutes = require("./routes/goapiRoutes");
const journeyRoutes = require("./routes/journeyRoutes");
const middlewares = require("./middlewares");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/generate", goapiRoutes);
app.use("/api/generate2", goapiRoutes);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
