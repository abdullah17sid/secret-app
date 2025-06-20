const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

// Middleware setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/secrets", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB successfully");
}).catch((err) => {
    console.log("MongoDB connection error:", err);
});

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
    res.render("login");
});

// Handle Login
app.post("/login", async (req, res) => {
    const email = req.body.username?.trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
        return res.send("Please enter both email and password.");
    }

    try {
        const foundUser = await User.findOne({ email: email });

        if (!foundUser) {
            return res.send("User not found. Please register first.");
        }

       if (foundUser.password === password) {
    res.render("profile", { user: foundUser }); // Pass user info if needed
}
else {
            res.send("Incorrect password.");
        }
    } catch (err) {
        console.log("Error during login:", err);
        res.status(500).send("Something went wrong during login.");
    }
});

// Secrets Page
app.get("/secrets", (req, res) => {
    res.render("secrets");
});

// Logout Route - ✅ Fixed: No rendering of logout view
app.get("/logout", (req, res) => {
    res.redirect("/");
});
// Submit Secret Page
app.get("/submit", (req, res) => {
    res.render("submit"); // Make sure submit.ejs exists in views/
});
app.post("/submit", (req, res) => {
    const submittedSecret = req.body.secret;
    console.log("Submitted secret:", submittedSecret);
    res.send("Secret submitted successfully!");
});


// Start Server
app.listen(3000, () => {
    console.log("App is running on port 3000");
});
