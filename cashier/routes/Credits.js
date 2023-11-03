const router = require("express").Router();
const { getAll } = require("../controllers/Credit.js");

router.get("/getall", getAll);

module.exports = router;