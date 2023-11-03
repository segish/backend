const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const bodypaser = require("body-parser");
const authRouter = require("./routes/auth");
const SubStoreRouter = require("./routes/SubStores");
const ShopRouter = require("./routes/Shops");
const ToShopPendingRouter = require("./routes/ToShopPending");
const sallsPendingRouter = require("./routes/SallesPending");
const creditsRouter = require("./routes/Credits");
const cookieParser = require("cookie-parser");

dotenv.config();
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
},).then(() => console.log("Connected to MongoDB"))
    .catch((err) => { console.log(" Can't Connecte to MongDB because of =>" + err) })

//midleware
app.use(bodypaser.json({ limit: '50mb' }));
app.use(bodypaser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(helmet());
app.use(morgan("common"));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
app.use(
    cors({
        origin: process.env.CORS_ORIGIN_URL,
    })
);

//routs
app.use("/api/auth", authRouter)
app.use("/api/Substore", SubStoreRouter)
app.use("/api/Shop", ShopRouter)
app.use("/api/toshoppending", ToShopPendingRouter)
app.use("/api/sallespending", sallsPendingRouter)
app.use("/api/credits", creditsRouter)

app.listen(8008, () => {
    console.log("Cashier backend server is running!");
});
