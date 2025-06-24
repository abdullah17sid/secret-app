const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://abdullahsmsiddiqui:ZU35mdAOLGwh5hta@cluster0.akqftz8.mongodb.net/secrets?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
});
const User = mongoose.model("User", userSchema);

// Routes

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const newUser = new User({
            email: req.body.username.trim(),
            password: req.body.password.trim()
        });

        await newUser.save();
        res.redirect("/login");
    } catch (err) {
        res.status(500).send("Registration failed");
    }
});

app.get("/login", (req, res) => {
    res.render("login", { message: null });
});

app.post("/login", async (req, res) => {
    const email = req.body.username?.trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
        return res.render("login", { message: "Please enter both email and password." });
    }

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.render("login", { message: "User not found. Please register first." });
        }

        if (user.password === password) {
            // Redirect to profile with email in query
            res.redirect(`/profile?email=${user.email}`);
        } else {
            res.render("login", { message: "Incorrect password." });
        }
    } catch (err) {
        res.status(500).render("login", { message: "Something went wrong during login." });
    }
});

app.get("/profile", (req, res) => {
    const email = req.query.email;
    res.render("profile", { email: email });
});

app.get("/secrets", async (req, res) => {
    try {
        const secrets = await User.find({ secret: { $ne: null } });
        res.render("secrets", { secrets: secrets, email: req.query.email || null, message: null });
    } catch (err) {
        res.status(500).render("secrets", { secrets: [], email: null, message: "Failed to load secrets." });
    }
});

app.get("/submit", (req, res) => {
    const email = req.query.email;
    res.render("submit", { email: email });
});

app.post("/submit", async (req, res) => {
    const secret = req.body.secret;
    const email = req.body.email;

    try {
        const user = await User.findOne({ email: email });
        if (user) {
            user.secret = secret;
            await user.save();
            res.redirect(`/secrets?email=${email}`);
        } else {
            res.status(404).render("secrets", { secrets: [], email: null, message: "User not found." });
        }
    } catch (err) {
        res.status(500).render("secrets", { secrets: [], email: null, message: "Failed to submit secret." });
    }
});

app.get("/logout", (req, res) => {
    res.redirect("/");
});

app.listen(3000, () => {
    console.log("App is running on port 3000");
});
