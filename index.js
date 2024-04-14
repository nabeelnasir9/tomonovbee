const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const goapiRoutes = require("./routes/goapiRoutes");
const journeyRoutes = require("./routes/journeyRoutes");
const authRoutes2 = require("./routes/authRoutes2");
const middlewares = require("./middlewares");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

const serverAddress = process.env.ORIGIN;
app.use(
  cors({
    // Use the serverAddress variable for the origin
    origin: `${serverAddress}`,
    credentials: true,
  }),
);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// app.use("/api/user", authRoutes2);
app.use("/api/auth", authRoutes);
app.use("/api/generate", goapiRoutes);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
