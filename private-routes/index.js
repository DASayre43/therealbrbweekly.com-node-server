const express = require("express");
const fs = require("fs");

module.exports = function (databases) {

    const router = express.Router();

    router.get("/", async (req, res) => {
        res.render('index');
    })

   
    return router;

};