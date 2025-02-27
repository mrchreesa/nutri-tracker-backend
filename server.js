const express = require("express");
const session = require("express-session");
const app = express();
const router = express.Router();
const { json } = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Bree = require("bree");
const mongoose = require("mongoose");

require("dotenv").config();

// Basic middleware setup
app.use(json());
app.use(cookieParser());
app.set("trust proxy", 1);

// CORS configuration
app.use(
	cors({
		origin: [
			"https://nutri-tracker-app-frontend.vercel.app", // Production frontend
			"http://localhost:3000", // Local development
		],
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cookie"],
		credentials: true, // If you're using cookies or auth headers
		optionsSuccessStatus: 200, // Ensure preflight returns 200
	})
);

// Remove this redundant middleware - cors() already handles OPTIONS
// app.use((req, res, next) => {
//   if (req.method === "OPTIONS") {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.status(200).end();
//     return;
//   }
//   next();
// });

// Remove this too - cors() handles it
// app.options("*", (req, res) => { ... });

const Ingredients = require("./Routes/Ingredients");
const Users = require("./Routes/Users");

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URL)
	.then(() => console.log("MongoDB connected successfully"))
	.catch((err) => console.error("MongoDB connection error:", err));

var db = mongoose;

// Define routes
app.use("/ingredients", Ingredients(db));
app.use("/users", Users(db));

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Server error:", err);
	res.status(500).json({ message: "Internal server error", error: process.env.NODE_ENV === "production" ? null : err.message });
});

const port = process.env.PORT || 8080;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
	app.listen(port, () => {
		console.log(`Server is listening on port ${port}...`);
	});

	const bree = new Bree({
		jobs: [{ name: "cleaning-profile-foods", interval: "at 00:00 am" }],
	});
	bree.start();
}

module.exports = app;
