const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      const error = new Error("Name is required");
      error.statusCode = 400;
      throw error;
    }
    if (!email || email.trim() === "") {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }
    if (!password || password.trim() === "") {
      const error = new Error("Password is required");
      error.statusCode = 400;
      throw error;
    }

    // Validate email format
    if (!email.includes("@")) {
      const error = new Error("Email must contain @");
      error.statusCode = 400;
      throw error;
    }

    // Validate password length
    if (password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({ name, email, password, role });

    const token = generateToken(user);
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || email.trim() === "") {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }
    if (!password || password.trim() === "") {
      const error = new Error("Password is required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 400;
      throw error;
    }

    const token = generateToken(user);
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
