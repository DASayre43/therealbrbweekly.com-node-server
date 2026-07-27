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


module.exports = function (imageDB, imageStorage) {

    const router = express.Router();

    //--------------------------------------------------
    // Helper Functions
    //--------------------------------------------------

    // Wrap Multer's callback API in a Promise so it can
    // be used with async/await.
    const upload = (req, res) => {
        return new Promise((resolve, reject) => {
            imageStorage.single("image")(req, res, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

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
    // Confirmation page before deleting an image
    //--------------------------------------------------

    router.get("/areyousure/:toDelete", (req, res) => {

        const imageId = req.params.toDelete;

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

        <h2>Are you sure you want to delete this image?</h2>

        <div id="edit">

            <div class="edit-card">
                <a class="main" href="/manageimages.html">Cancel</a>
            </div>

            <div class="edit-card">
                <a class="main" href="/image/delete/${imageId}">Confirm</a>
            </div>

        </div>

    </div>

</body>
</html>
        `);

    });

    //--------------------------------------------------
    // Upload a new image
    //--------------------------------------------------

    router.post("/upload", async (req, res) => {

        try {

            // Save uploaded file.
            await upload(req, res);

            const filename = req.file.filename;
            let data = req.file.filename;
            // Create a hash object
            const hash = crypto.createHash('md5');
            // Update the hash with data
            hash.update(data);
            // Get the digest in hexadecimal format
            const digest = hash.digest('hex');

            // Store metadata.
            await imageDB.put(digest, {
                id: digest,
                path: `./uploads/${filename}`,
                uploadDate: req.body.date,
                caption: req.body.caption
            });

            // Display success page.
            res.send(`
                <h2>Upload Successful</h2>

                <img
                    src="/image/uploads/image/${digest}"
                    width="300"
                >

                <p>Your image has been uploaded and stored successfully.</p>

                <a href="/imageUpload.html">Upload Another</a>
                <br>
                <a href="/manageImages.html">Return to Image Management</a>
            `);

        }
        catch (err) {

            console.error("Upload failed:", err);

            res.status(500).send(`
                <h2>Upload Failed</h2>

                <p>There was a problem uploading your image.</p>

                <a href="/imageUpload.html">Try Again</a>
                <br>
                <a href="/manageImages.html">Return to Image Management</a>
            `);

        }

    });

    //--------------------------------------------------
    // Delete an image
    //--------------------------------------------------

    router.get("/delete/:id", async (req, res) => {

        const imageId = req.params.id;

        const image = await imageDB.get(imageId);

        try {

            // Delete the image file.
            await fs.promises.unlink(`./${image.path}`);

            // Remove database entry.
            await imageDB.del(imageId);

            res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Deleted</title>

    <link rel="stylesheet" href="/admin.css">
</head>
<body>

    <h1>Image Deleted Successfully</h1>

    <div class="section">

        <h2>Options</h2>

        <div id="edit">

            <div class="edit-card">
                <strong>Return to Admin Panel</strong>
                <a class="main" href="/">Return</a>
            </div>

            <div class="edit-card">
                <strong>Return to Image Management</strong>
                <a class="main" href="/manageimages.html">Return</a>
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

            console.error(`Error deleting "${imageId}":`, err);

            res.status(500).send(`
<h2>Delete Failed</h2>

<p>The image could not be deleted.</p>

<a href="/manageimages.html">Return to Image Management</a>
            `);

        }

    });

    //--------------------------------------------------
    // Return all images as HTML
    //--------------------------------------------------

    router.get("/images", getAllImages);

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

    //--------------------------------------------------
    // Helper: Generate HTML image gallery
    //--------------------------------------------------

    async function getAllImages(req, res) {

        try {

            let html = "<h1>Uploaded Images</h1>";

            for await (const [key, image] of imageDB.iterator()) {

                html += `
<div>
    <img
        src="/image/uploads/image/${key}"
        width="200"
    >

    <p>
        ${image.path}<br>
        ${image.caption}
    </p>
</div>

<hr>
                `;

            }

            res.send(html);

        }
        catch (err) {

            console.error("Error generating image gallery:", err);

            res.status(500).send("Unable to load images.");

        }

    }

    return router;

};