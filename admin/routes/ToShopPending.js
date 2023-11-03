const router = require("express").Router();
const { getAll, deletePending,approvePending } = require("../controllers/ToShopPending.js");

router.get("/getall", getAll);
router.delete("/undo/:id", deletePending);
router.post("/approve/:id", approvePending);

module.exports = router;