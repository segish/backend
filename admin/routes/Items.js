const router = require("express").Router();
const { addItem, deleteItem, getAll, updateItem } = require("../controllers/Items.js");

router.post("/add",addItem);
router.delete("/delete/:id", deleteItem);
router.get("/getall", getAll);
router.post("/update/:id", updateItem);

module.exports = router;