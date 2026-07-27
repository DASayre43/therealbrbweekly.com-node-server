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

module.exports = function (imageDB, imageStorage) {

    const router = express.Router();

    //--------------------------------------------------
    // Return an uploaded image
    //--------------------------------------------------

    router.get("/uploads/image/:id", async (req, res) => {

        try {

            const image = await imageDB.get(req.params.id);

            await fs.promises.access(image.path);

            fs.createReadStream(image.path).pipe(res);

        }
        catch (err) {

            console.error("Error serving image:", err);

            res.status(404).send("Image not found.");

        }

    });

    //--------------------------------------------------
    // Return image metadata as JSON
    //--------------------------------------------------

    router.get("/alldata/:amount", async (req, res) => {

        const amount = Number(req.params.amount);

        if (Number.isNaN(amount) || amount < 1) {

            return res.status(400).json({
                error: "Invalid amount."
            });

        }

        try {

            const images = [];

            let count = 0;

            for await (const [, image] of imageDB.iterator()) {

                images.push(image);

                count++;

                if (count >= amount)
                    break;

            }

            res.json(images);

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