const {
  createItem,
  getAllItemsByUser,
  getItemById,
  updateItemById,
  deleteItemById,
} = require("../model/pantryModel");

const addItem = async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Item name is required" });
    }
    const qty = Number(quantity) || 0;
    if (qty < 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }
    const item = await createItem(name, qty, unit || "", req.user.id);
    res.status(201).json({ message: "Item added successfully", item });
  } catch (e) {
    res.status(500).json({ message: "Failed to add item", error: e.message });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await getAllItemsByUser(req.user.id);
    res.status(200).json({ message: "Items fetched", items });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch items", error: e.message });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await getItemById(req.params.id, req.user.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item fetched", item });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch item", error: e.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Item name is required" });
    }
    const qty = Number(quantity) || 0;
    if (qty < 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }
    const item = await updateItemById(req.params.id, req.user.id, name, qty, unit || "");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item updated successfully", item });
  } catch (e) {
    res.status(500).json({ message: "Failed to update item", error: e.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await deleteItemById(req.params.id, req.user.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete item", error: e.message });
  }
};

module.exports = {
  addItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
};
