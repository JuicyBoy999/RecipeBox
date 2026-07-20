const express = require("express");
const router = express.Router();
const {
  addItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
} = require("../controller/pantryController");
const { verifyToken } = require("../middleware/verifyToken");

router.use(verifyToken);

router.post("/", addItem);
router.get("/", getItems);
router.get("/:id", getItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
