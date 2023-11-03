const router = require("express").Router();
const { addPending, deletePending, getAll, updatePending, approvePending } = require("../controllers/pending.js");

router.post("/add", addPending);
router.delete("/delete/:id", deletePending);
router.get("/getall", getAll);
router.post("/update/:id", updatePending);
router.post("/approve/:id", approvePending);

module.exports = router;