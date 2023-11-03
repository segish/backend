const router = require("express").Router();
const { getAll, transaction, HoleSall } = require("../controllers/SubStore.js");

router.get("/getall", getAll);
router.post("/transaction/:id", transaction);
router.post("/holesale/:id", HoleSall);

module.exports = router;