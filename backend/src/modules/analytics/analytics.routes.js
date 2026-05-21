// backend/src/modules/analytics/analytics.routes.js
const express = require("express");
const { Authenticate, restrictTo } = require("../../middlewares/auth.js");
const { getOwnerAnalytics } = require("./analytics.controller.js");

const router = express.Router();

router.use(Authenticate, restrictTo("owner", "admin"));

router.get("/", getOwnerAnalytics);

module.exports = router;
   
