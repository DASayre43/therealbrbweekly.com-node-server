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
    // Helper Functions
    //--------------------------------------------------

    // Wrap Multer's callback API in a Promise so it can
    // be used with async/await.
    const upload = (req, res) => {
        return new Promise((resolve, reject) => {
            pdfStorage.single("image")(req, res, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

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
    // Confirmation page before deleting an document
    //--------------------------------------------------

    router.get("/areyousure/:toDelete", (req, res) => {

        const documentId = req.params.toDelete;

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

        <h2>Are you sure you want to delete this PDF?</h2>

        <div id="edit">

            <div class="edit-card">
                <a class="main" href="/manageDocuments.html">Cancel</a>
            </div>

            <div class="edit-card">
                <a class="main" href="/documents/delete/${documentId}">Confirm</a>
            </div>

        </div>

    </div>

</body>
</html>
        `);

    });

    //--------------------------------------------------
    // Upload a new document
    //--------------------------------------------------

    router.post("/upload", async (req, res) => {

        try {

            // Save uploaded file.
            await upload(req, res);

            const filename = req.file.filename;

            // Store metadata.
            await issuesDB.put(filename, {
                id: filename,
                path: `./Issues/${filename}`,
                uploadDate: req.body.date,
                documentName: req.body.documentName,
                Intro: req.body.documentIntro,
                Cover: req.body.coverID
            });

            // Display success page.
            res.send(`
                <h2>Upload Successful</h2>

                <img
                    src="/image/uploads/image/${req.body.coverID}"
                    width="300"
                >

                <p>Your PDF has been uploaded and stored successfully.</p>

                <a href="/documentUpload.html">Upload Another</a>
                <br>
                <a href="/manageDocuments.html">Return to PDF Management</a>
            `);

        }
        catch (err) {

            console.error("Upload failed:", err);

            res.status(500).send(`
                <h2>Upload Failed</h2>

                <p>There was a problem uploading your PDF.</p>

                <a href="/documentUpload.html">Try Again</a>
                <br>
                <a href="/managedocuments.html">Return to PDF Management</a>
            `);

        }

    });

    //--------------------------------------------------
    // Delete an image
    //--------------------------------------------------

    router.get("/delete/:id", async (req, res) => {

        const pdfId = req.params.id;

        try {

            // Delete the image file.
            await fs.promises.unlink(`./Issues/${pdfId}`);

            // Remove database entry.
            await issuesDB.del(pdfId);

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

                    <h1>PDF Deleted Successfully</h1>

                    <div class="section">

                        <h2>Options</h2>

                        <div id="edit">

                            <div class="edit-card">
                                <strong>Return to Admin Panel</strong>
                                <a class="main" href="/">Return</a>
                            </div>

                            <div class="edit-card">
                                <strong>Return to Document Management</strong>
                                <a class="main" href="/manageDocuments.html">Return</a>
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

            console.error(`Error deleting "${pdfId}":`, err);

            res.status(500).send(`
                <h2>Delete Failed</h2>

                <p>The image could not be deleted.</p>

                <a href="/managedocuments.html">Return to PDF Management</a>
            `);

        }

    });

    //--------------------------------------------------
    // Return all images as HTML
    //--------------------------------------------------

    //router.get("/images", getAllImages);

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

    //--------------------------------------------------
    // Helper: Generate HTML image gallery
    //--------------------------------------------------

//     async function getAllImages(req, res) {

//         try {

//             let html = "<h1>Uploaded Images</h1>";

//             for await (const [key, image] of issuesDB.iterator()) {

//                 html += `
// <div>
//     <img
//         src="/image/uploads/image/${key}"
//         width="200"
//     >

//     <p>
//         ${image.path}<br>
//         ${image.caption}
//     </p>
// </div>

// <hr>
//                 `;

//             }

//             res.send(html);

//         }
//         catch (err) {

//             console.error("Error generating image gallery:", err);

//             res.status(500).send("Unable to load images.");

//         }

//     }

     return router;

 };