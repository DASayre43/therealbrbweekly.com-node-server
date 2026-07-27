//==================================================
// Image Router
//
// Handles:
//   GET    /uploads/image/:id
//   GET    /areyousure/:toDelete
//   POST   /upload
//   GET    /delete/:id
//   GET    /images
//   GET    /alldata/:amount
//==================================================

const express = require("express");
const fs = require("fs");
const crypto = require('crypto');

module.exports = function (articalDB) {

    const router = express.Router();

    //--------------------------------------------------
    // Return document metadata as JSON
    //--------------------------------------------------

    router.get("/alldata/:amount", async (req, res) => {

        const amount = Number(req.params.amount);

        if (Number.isNaN(amount) || amount < 1) {

            return res.status(400).json({
                error: "Invalid amount."
            });

        }

        try {

            const articles = [];

            let count = 0;

            for await (const [ ,article] of articalDB.iterator()) {

                articles.push(article);

                count++;

                if (count >= amount)
                    break;

            }

            res.json(articles);

        }
        catch (err) {

            console.error("Error reading article database:", err);

            res.status(500).json({
                error: "Unable to retrieve article data."
            });

        }

    });

    //--------------------------------------------------
    // Return document metadata as JSON
    //--------------------------------------------------

    router.get("/article/:id", async (req, res) => {

        const ID = req.params.id;

        try {
            const article = await articalDB.get(ID)
            res.json(article)
        }
        catch (err) {

            console.error("Error reading article database:", err);

            res.status(500).json({
                error: "Unable to retrieve article data."
            });

        }

    });

   
    return router;

};