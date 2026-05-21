const express = require("express");
const { Authenticate, restrictTo } = require("../../middlewares/auth");
const { getAuditLog } = require("../admin/admin.controller");

const router = express.Router();

router.use(Authenticate);
router.get("/", restrictTo("admin", "owner"), getAuditLog);

module.exports = router;
