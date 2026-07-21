const {
  createUser,
  findUserByEmail,
  getUserById,
  updateUserById,
  deleteUserById,
  updatePasswordById,
} = require("../model/userModel");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../utils/mailer");

const RESET_TOKEN_PURPOSE = "password-reset";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashedPassword);
    const { password: _password, ...safeUser } = user;
    res.status(201).json({ message: "Account created successfully", user: safeUser });
  } catch (e) {
    res.status(500).json({ message: "Registration failed", error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const token = JWT.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    const { password: _password, ...safeUser } = user;
    res.status(200).json({ message: "Login successful", user: safeUser, token });
  } catch (e) {
    res.status(500).json({ message: "Login failed", error: e.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password: _password, ...safeUser } = user;
    res.status(200).json({ message: "User fetched", user: safeUser });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch user", error: e.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const user = await updateUserById(id, name);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password: _password, ...safeUser } = user;
    res.status(200).json({ message: "Profile updated successfully", user: safeUser });
  } catch (e) {
    res.status(500).json({ message: "Failed to update profile", error: e.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await deleteUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete account", error: e.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please enter your email" });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }
    const resetToken = JWT.sign(
      { id: user.id, purpose: RESET_TOKEN_PURPOSE },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);
    res.status(200).json({ message: `Reset link sent to ${email}` });
  } catch (e) {
    res.status(500).json({ message: "Failed to send reset link", error: e.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Missing reset token or new password" });
    }
    let decoded;
    try {
      decoded = JWT.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }
    if (decoded.purpose !== RESET_TOKEN_PURPOSE) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await updatePasswordById(decoded.id, hashedPassword);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Password reset successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to reset password", error: e.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
  forgotPassword,
  resetPassword,
};
