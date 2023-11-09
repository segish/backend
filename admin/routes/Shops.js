const router = require("express").Router();
const {getAll,transaction } = require("../controllers/Shop.js");

router.get("/getall", getAll);
router.post("/transaction/:id", transaction);

module.exports = router;