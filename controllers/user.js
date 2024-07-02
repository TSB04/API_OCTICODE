const mongoose = require("mongoose");
const { Validator } = require("node-input-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pwRules = require("../security/password");
const User = require("../models/user");

// Function to create a new user
exports.createUser = async (req, res) => {
    try {
        // Validate input using node-input-validator
        const validInput = new Validator(req.body, {
            email: "required|email|length:250",
            password: "required|string",
            fname: "string|length:150",
            lname: "string|length:100",
        });

        const validationPassed = await validInput.check();
        if (!validationPassed) {
            return res.status(400).json(validInput.errors);
        }

        // Validate password rules
        const pw = req.body.password;
        if (!pwRules.validate(pw)) {
            return res.status(400).json({
                password: {
                    message: "Password must contain 6 to 16 characters, upper and lowercase letters and digits.",
                    rule: "required|string",
                },
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(pw, 12);

        // Create new user object
        const newUser = new User({
            email: req.body.email,
            password: hashedPassword,
            fname: req.body.fname || "",
            lname: req.body.lname || "",
			role: req.body.role || "employee", // Assuming default value for role
            isAdmin: false, // Assuming default value for isAdmin
        });

        // Save the user to the database
        await newUser.save();

        // Return success response
        res.status(201).json({ message: "User account created successfully!!!" });
    } catch (error) {
        // Handle errors
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user account.", details: error.message });
    }
};

// Function to log in a user
exports.logUser = async (req, res) => {
    try {
        // Validate input using node-input-validator
        const validInput = new Validator(req.body, {
            email: "required|email|length:250",
            password: "required|string",
        });

        const validationPassed = await validInput.check();
        if (!validationPassed) {
            return res.status(400).json(validInput.errors);
        }

        // Find user by email
        const foundUser = await User.findOne({ email: req.body.email });
        if (!foundUser) {
            return res.status(404).json({ email: { message: "Email not found, please try again." } });
        }

        // Compare passwords
        const match = await bcrypt.compare(req.body.password, foundUser.password);
        if (!match) {
            return res.status(403).json({ password: { message: "Password is incorrect, please try again." } });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: foundUser.userId, isAdmin: foundUser.isAdmin },
            process.env.TOKEN_SECRET,
            { expiresIn: "12h" }
        );

        // Return success response with user details and token
        res.status(200).json({
            userId: foundUser.userId,
            token: token,
            isAdmin: foundUser.isAdmin,
            fName: foundUser.fname,
            lName: foundUser.lname,
            email: foundUser.email,
            message: `Welcome ${foundUser.fname} !!!`,
        });
    } catch (error) {
        // Handle errors
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Failed to log in user.", details: error.message });
    }
};

// Function to retrieve all users
exports.getAllUsers = async (req, res) => {
    try {
        // Retrieve all users from database
        const users = await User.find().select({ fname: 1, lname: 1, isAdmin: 1, email: 1, role: 1, _id: 0});

        // Return success response with users array
        res.status(200).json(users);
    } catch (error) {
        // Handle errors
        console.error("Error retrieving users:", error);
        res.status(500).json({ error: "Failed to retrieve users.", details: error.message });
    }
};

// Function to retrieve users based on criteria
exports.getUser = async (req, res) => {
    try {
        // Validate input using node-input-validator
        const validInput = new Validator(req.body, {
            email: "email|length:250",
            fname: "string|length:150",
            lname: "string|length:100",
        });

        const validationPassed = await validInput.check();
        if (!validationPassed) {
            return res.status(400).json({ error: validInput.errors });
        }

        // Find users based on request criteria
        const users = await User.find(req.body).select({ fname: 1, lname: 1, email: 1 });

        // Check if users were found
        if (!users || users.length === 0) {
            return res.status(404).json({ error: "Users not found." });
        }

        // Return success response with users array
        res.status(200).json(users);
    } catch (error) {
        // Handle errors
        console.error("Error finding users:", error);
        res.status(500).json({ error: "Failed to find users.", details: error.message });
    }
};

// Function to retrieve logged-in user details
exports.getLoggedUser = async (req, res) => {
    try {
        const userId = res.locals.userId;

        // Find logged-in user by userId
        const foundUser = await User.findOne({ userId: userId });

        // Check if user was found
        if (!foundUser) {
            return res.status(404).json({ error: "User not found." });
        }

        // Return success response with user details
        res.status(200).json(foundUser);
    } catch (error) {
        // Handle errors
        console.error("Error retrieving logged-in user:", error);
        res.status(500).json({ error: "Failed to retrieve user.", details: error.message });
    }
};

// Function to update user details
exports.updateUser = async (req, res) => {
    try {
        // Validate input using node-input-validator
        const validInput = new Validator(req.body, {
            email: "email|length:200",
            lastname: "string|length:150",
            firstname: "string|length:150",
			role: "string",
            isAdmin: "boolean",
        });

        const validationPassed = await validInput.check();
        if (!validationPassed) {
            return res.status(400).json(validInput.errors);
        }

        const userId = res.locals.userId;
        const data = { ...req.body };

        // Update user details in the database
        const result = await User.findOneAndUpdate({ userId: userId }, data);

        // Check if user was found and updated
        if (!result) {
            return res.status(404).json({ error: "User not found." });
        }

        // Return success response
        res.status(200).json({ message: "User updated successfully!" });
    } catch (error) {
        // Handle errors
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user.", details: error.message });
    }
};

// Function to delete user
exports.deleteUser = async (req, res) => {
    console.log("Delete user", res.locals.userId);
    try {
        const userId = res.locals.userId;

        // Delete user from the database
        const result = await User.findOneAndDelete({ userId: userId });

        // Check if user was found and deleted
        if (!result) {
            return res.status(404).json({ error: "User not found." });
        }

        // Return success response
        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        // Handle errors
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user.", details: error.message });
    }
};
