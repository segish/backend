const router = require("express").Router();
const { getAll, Subtransaction, transaction, HoleSall } = require("../controllers/SubStore.js");

router.get("/getall", getAll);
router.post("/transaction/:id", transaction);
router.post("/subtransaction/:id", Subtransaction);
router.post("/holesall/:id", HoleSall);

module.exports = router;