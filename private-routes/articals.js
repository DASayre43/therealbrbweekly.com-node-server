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
    // Helper Functions
    //--------------------------------------------------

    // Wrap Multer's callback API in a Promise so it can
    // be used with async/await.
    // const upload = (req, res) => {
    //     return new Promise((resolve, reject) => {
    //         imageStorage.single("image")(req, res, err => {
    //             if (err)
    //                 reject(err);
    //             else
    //                 resolve();
    //         });
    //     });
    // };

    //--------------------------------------------------
    // Return document metadata as JSON
    //--------------------------------------------------

    router.post("/editUpload/:ID", async (req, res) => {

        try {

            // Save uploaded file.
            const ID = req.params.ID
            const title = req.body.articalName;

            await articalDB.del(ID);

            // Store article.
            await articalDB.put(ID, {
                articleID: ID,
                title: title,
                uploadDate: req.body.date,
                articleText: req.body.articalText,
                coverID: req.body.coverID
            });

            // Display success page.
            res.send(`
                <h2>Upload Successful</h2>

                <img
                    src="/image/uploads/image/${req.body.coverID}"
                    width="300"
                >

                <p>Your article has been uploaded and stored successfully.</p>

                <a href="/articalUpload.html">Upload Another</a>
                <br>
                <a href="/manageArticals.html">Return to article Management</a>
            `);

        }
        catch (err) {

            console.error("Upload failed:", err);

            res.status(500).send(`
                <h2>Upload Failed</h2>

                <p>There was a problem uploading your article.</p>

                <a href="/articleUpload.html">Try Again</a>
                <br>
                <a href="/manageImages.html">Return to article Management</a>
            `);

        }

    });

    router.get("/edit/:ID", async (req, res) => {
        let ID = req.params.ID
        res.render("articalEdit", {target: ID})

    });

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

    //--------------------------------------------------
    // Confirmation page before deleting an image
    //--------------------------------------------------

    router.get("/areyousure/:toDelete", (req, res) => {

        const articleId = req.params.toDelete;

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirm Action</title>

                <link rel="stylesheet" href="/admin.css">
            </head>
            <body>

                <h1>Confirm Action</h1>

                <div class="section">

                    <h2>Are you sure you want to delete this article?</h2>
                    <h2>it would be gone forever. and forever is like practicaly an eternity</h2>

                    <div id="edit">

                        <div class="edit-card">
                            <a class="main" href="/manageimages.html">Cancel</a>
                        </div>

                        <div class="edit-card">
                            <a class="main" href="/articles/delete/${articleId}">Confirm</a>
                        </div>

                    </div>

                </div>

            </body>
            </html>
        `);

    });

    //--------------------------------------------------
    // Upload a new artical
    //--------------------------------------------------

    router.post("/upload", async (req, res) => {

        try {

            // Save uploaded file.

            const title = req.body.articalName;
            let data = title;
            // Create a hash object
            const hash = crypto.createHash('md5');
            // Update the hash with data
            hash.update(data);
            // Get the digest in hexadecimal format
            const digest = hash.digest('hex');

            // Store article.
            await articalDB.put(digest, {
                articleID: digest,
                title: title,
                uploadDate: req.body.date,
                articleText: req.body.articalText,
                coverID: req.body.coverID
            });

            // Display success page.
            res.send(`
                <h2>Upload Successful</h2>

                <img
                    src="/image/uploads/image/${req.body.coverID}"
                    width="300"
                >

                <p>Your article has been uploaded and stored successfully.</p>

                <a href="/articalUpload.html">Upload Another</a>
                <br>
                <a href="/manageArticals.html">Return to article Management</a>
            `);

        }
        catch (err) {

            console.error("Upload failed:", err);

            res.status(500).send(`
                <h2>Upload Failed</h2>

                <p>There was a problem uploading your article.</p>

                <a href="/articleUpload.html">Try Again</a>
                <br>
                <a href="/manageImages.html">Return to article Management</a>
            `);

        }

    });

    //--------------------------------------------------
    // Delete an article
    //--------------------------------------------------

    router.get("/delete/:id", async (req, res) => {

        const articleId = req.params.id;

        try {
            // Remove database entry.
            await articalDB.del(articleId);

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>article Deleted</title>

                    <link rel="stylesheet" href="/admin.css">
                </head>
                <body>

                    <h1>article Deleted Successfully</h1>

                    <div class="section">

                        <h2>Options</h2>

                        <div id="edit">

                            <div class="edit-card">
                                <strong>Return to Admin Panel</strong>
                                <a class="main" href="/">Return</a>
                            </div>

                            <div class="edit-card">
                                <strong>Return to article Management</strong>
                                <a class="main" href="/manageArticals.html">Return</a>
                            </div>

                        </div>

                        <br>

                        <img src="/Images/fractions in fire.gif">

                        <p>It has joined the fractions.</p>

                    </div>

                </body>
                </html>
            `);

        }
        catch (err) {

            console.error(`Error deleting "${articleId}":`, err);

            res.status(500).send(`
                <h2>Delete Failed</h2>

                <p>The article could not be deleted.</p>

                <a href="/managearticles.html">Return to article Management</a>
            `);

        }

    });

   
    return router;

};