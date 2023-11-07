const router = require("express").Router();
const { getAll,approveCredit } = require("../controllers/Credit.js");

router.get("/getall", getAll);
router.post("/approve/:id", approveCredit);

module.exports = router;