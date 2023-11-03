const router = require("express").Router();
const { addWarehouse, deleteWarehouse, getAll, updateWarehouse } = require("../controllers/Warehouses.js");

router.post("/add", addWarehouse);
router.delete("/delete/:id", deleteWarehouse);
router.get("/getall", getAll);
router.post("/update/:id", updateWarehouse);

module.exports = router;