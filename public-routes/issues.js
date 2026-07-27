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

module.exports = function (issuesDB, pdfStorage) {

    const router = express.Router();

    //--------------------------------------------------
    // Return an uploaded document
    //--------------------------------------------------

    router.get("/document/:id", async (req, res) => {

        try {

            const document = await issuesDB.get(req.params.id);

            await fs.promises.access(document.path);

            fs.createReadStream(document.path).pipe(res);

        }
        catch (err) {

            console.error("Error serving PDF:", err);

            res.status(404).send("PDF not found.");

        }

    });

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

            const documents = [];

            let count = 0;

            for await (const [, image] of issuesDB.iterator()) {

                documents.push(image);

                count++;

                if (count >= amount)
                    break;

            }

            res.json(documents);

        }
        catch (err) {

            console.error("Error reading image database:", err);

            res.status(500).json({
                error: "Unable to retrieve image data."
            });

        }

    });

     return router;

 };