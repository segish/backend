const router = require("express").Router();
const { getAll, deletePending } = require("../controllers/ToShopPending.js");

router.get("/getall", getAll);
router.delete("/undo/:id", deletePending);

module.exports = router;