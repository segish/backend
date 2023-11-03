const router = require("express").Router();
const { addSubStore, deleteSubStore, getAll, updateSubStore, Subtransaction, transaction, HoleSall } = require("../controllers/SubStore.js");

router.post("/add", addSubStore);
router.delete("/delete/:id", deleteSubStore);
router.get("/getall", getAll);
router.post("/update/:id", updateSubStore);
router.post("/transaction/:id", transaction);
router.post("/subtransaction/:id", Subtransaction);
router.post("/holesall/:id", HoleSall);

module.exports = router;