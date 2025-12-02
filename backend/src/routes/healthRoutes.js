// backend/src/routes/healthRoutes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "CozyShare API healthy and running",
  });
});

module.exports = router;
