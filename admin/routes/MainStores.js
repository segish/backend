const router = require("express").Router();
const { getAll, transaction, Maintransaction, HoleSall,getAllbyDate } = require("../controllers/MainStore.js");

router.get("/getall", getAll);
router.post("/transaction/:id", transaction);
router.post("/maintransaction/:id", Maintransaction);
router.post("/holesall/:id", HoleSall);
router.get("/pie", getAllbyDate);

module.exports = router;