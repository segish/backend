const router = require("express").Router();
const { addMainStore, deleteMainStore, getAll, updateMainStore, transaction, Maintransaction, HoleSall,getAllbyDate } = require("../controllers/MainStore.js");

router.post("/add", addMainStore);
router.delete("/delete/:id", deleteMainStore);
router.get("/getall", getAll);
router.post("/update/:id", updateMainStore);
router.post("/transaction/:id", transaction);
router.post("/maintransaction/:id", Maintransaction);
router.post("/holesall/:id", HoleSall);
router.get("/pie", getAllbyDate);

module.exports = router;