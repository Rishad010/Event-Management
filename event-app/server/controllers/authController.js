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

    console.log("\n=== LOGIN ATTEMPT ===");
    console.log("Email received:", email);
    console.log(
      "Password received (first 3 chars):",
      password?.substring(0, 3) + "...",
    );

    // Validate required fields
    if (!email || email.trim() === "") {
      console.log("❌ Login failed: Email is empty");
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }
    if (!password || password.trim() === "") {
      console.log("❌ Login failed: Password is empty");
      const error = new Error("Password is required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Login failed: User not found for email:", email);
      const error = new Error("Invalid credentials");
      error.statusCode = 400;
      throw error;
    }

    console.log("✓ User found:", user.email, "Role:", user.role);

    const isMatch = await user.comparePassword(password);
    console.log("✓ Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Login failed: Password mismatch");
      const error = new Error("Invalid credentials");
      error.statusCode = 400;
      throw error;
    }

    console.log("✅ Login successful!");

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
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent users from modifying their own role
    if (
      req.user._id.toString() === req.params.id &&
      role &&
      role !== req.user.role
    ) {
      return res.status(403).json({ message: "Cannot change your own role" });
    }

    // Only superadmin can modify superadmin accounts
    if (targetUser.role === "superadmin" && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmins can modify superadmin accounts" });
    }

    // Only superadmin can grant superadmin role
    if (role === "superadmin" && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmins can grant superadmin privileges" });
    }

    // Only superadmin can grant admin role
    if (
      role === "admin" &&
      req.user.role !== "superadmin" &&
      targetUser.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Only superadmins can grant admin privileges" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true },
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent users from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res
        .status(403)
        .json({ message: "Cannot delete your own account" });
    }

    // Only superadmin can delete superadmins
    if (targetUser.role === "superadmin" && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmins can delete superadmin accounts" });
    }

    // Only superadmin can delete admin accounts
    if (targetUser.role === "admin" && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmins can delete admin accounts" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message:
          "If a user with this email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // For development, return the token in the response
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    res.status(200).json({
      message: "Password reset link has been sent to your email.",
      // In production, remove these fields - they're for development only
      resetToken,
      resetUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      const error = new Error("Reset token is required");
      error.statusCode = 400;
      throw error;
    }

    if (!password || password.trim() === "") {
      const error = new Error("Password is required");
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const error = new Error("Invalid or expired reset token");
      error.statusCode = 400;
      throw error;
    }

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired reset token");
      error.statusCode = 400;
      throw error;
    }

    // Update password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.status(200).json({
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });

    res.status(200).json({
      exists: !!user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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

    if (password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Update password
    user.password = password;
    await user.save();

    res.status(200).json({
      message:
        "Password updated successfully. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
