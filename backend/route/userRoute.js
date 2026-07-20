const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
} = require("../controller/userController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.get("/:id", verifyToken, getProfile);
router.put("/:id", verifyToken, updateProfile);
router.delete("/:id", verifyToken, deleteProfile);

module.exports = router;
