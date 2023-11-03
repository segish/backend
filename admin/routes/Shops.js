const router = require("express").Router();
const { addShop, deleteShop, getAll, updateShop, transaction } = require("../controllers/Shop.js");

router.post("/add", addShop);
router.delete("/delete/:id", deleteShop);
router.get("/getall", getAll);
router.post("/update/:id", updateShop);
router.post("/transaction/:id", transaction);

module.exports = router;