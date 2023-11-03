const router = require("express").Router();
const { getAll,deletePending,ApprovePending } = require("../controllers/SallesPending.js");

router.get("/getall", getAll);
router.delete("/undo/:id", deletePending);
router.post("/approve/:id", ApprovePending);

module.exports = router;