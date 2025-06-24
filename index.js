const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
require("dotenv").config();

const app = express();

// Middleware setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect("mongodb+srv://abdullahsmsiddiqui:ZU35mdAOLGwh5hta@cluster0.akqftz8.mongodb.net/secrets?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Schema and Model
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const User = mongoose.model("User", userSchema);

// Home Page
app.get("/", (req, res) => {
    res.render("home");
});

// Register Page
app.get("/register", (req, res) => {
    res.render("register");
});

// Handle Registration
app.post("/register", async (req, res) => {
    try {
        const newUser = new User({
            email: req.body.username.trim(),
            password: req.body.password.trim()
        });

        await newUser.save();
        console.log("User registered successfully");
        res.redirect("/login");
    } catch (err) {
        console.log("Error during registration:", err);
        res.status(500).send("Registration failed");
    }
});

// Login Page
app.get("/login", (req, res) => {
    res.render("login", { message: null });
});

// Handle Login
app.post("/login", async (req, res) => {
    const email = req.body.username?.trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
        return res.render("login", { message: "Please enter both email and password." });
    }

    try {
        const foundUser = await User.findOne({ email: email });

        if (!foundUser) {
            return res.render("login", { message: "User not found. Please register first." });
        }

        if (foundUser.password === password) {
            res.render("secrets", { message: "Welcome back, " + foundUser.email + "!" });
        } else {
            res.render("login", { message: "Incorrect password." });
        }
    } catch (err) {
        console.log("Error during login:", err);
        res.status(500).render("login", { message: "Something went wrong. Try again later." });
    }
});

// Secrets Page (default view)
app.get("/secrets", (req, res) => {
    res.render("secrets", { message: null });
});

// Logout
app.get("/logout", (req, res) => {
    res.redirect("/");
});

// Submit Page
app.get("/submit", (req, res) => {
    res.render("submit");
});

// Handle Secret Submission
app.post("/submit", (req, res) => {
    const submittedSecret = req.body.secret;
    console.log("Submitted secret:", submittedSecret);
    res.render("secrets", { message: "Secret submitted successfully!" });
});

// Start Server
app.listen(3000, () => {
    console.log("App is running on port 3000");
});
