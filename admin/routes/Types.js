const router = require("express").Router();
const { addType, deleteType, getAll, updateType } = require("../controllers/Type.js");

router.post("/add", addType);
router.delete("/delete/:id", deleteType);
router.get("/getall", getAll);
router.post("/update/:id", updateType);

module.exports = router;