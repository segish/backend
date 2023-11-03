const router = require("express").Router();
const { deleteCredit, getAll, updateCredit,ApproveCredit,canceleCredite } = require("../controllers/Credit.js");

// router.post("/add", addCredit);
router.delete("/delete/:id", deleteCredit);
router.get("/getall", getAll);
router.post("/update/:id", updateCredit);
router.post("/approve/:id", ApproveCredit);
router.post("/cancele/:id", canceleCredite);

module.exports = router;