const express = require("express");
const fs = require("fs");
const { json } = require("stream/consumers");

module.exports = function (databases) {

    const router = express.Router();

    router.get("/", async (req, res) => {
        res.render('index');
    })

    router.get("/index.html", async (req, res) => {
        res.render('index');
    })

    router.get("/home", async (req, res) => {
        res.render('index');
    })

    router.get("/home.html", async (req, res) => {
        res.render('index');
    })

    

    router.get("/our%20team.html", async (req, res) => {
        res.render('our team');
    })

    router.get("/article/:id", async (req, res) => {
        try {

            const ID = req.params.id;
            res.render('articalDisplay.html', {id: ID});

        }
        catch (err) {

            console.error("Error in url:", err);

            res.status(404).send("incorectly formed url");

        }
    })

    router.get("/document/:id", async (req, res) => {
        try {

            const ID = req.params.id;
            const issuesDB = databases.issuesDB;
            const pdfMetaData = await issuesDB.get(ID);
            res.render('documentDisplay.html', {
                    id: ID, 
                    path: pdfMetaData.path,
                    uploadDate: pdfMetaData.uploadDate,
                    documentName: pdfMetaData.documentName,
                    Intro: pdfMetaData.Intro,
                    Cover: pdfMetaData.cover
                }
            );

        }
        catch (err) {

            console.error("Error in url:", err);

            res.status(404).send("incorectly formed url");

        }
        
    })

    router.get("/BRB-Nightly-Catalog.html", async (req, res) => {
        res.render('BRB-Nightly-Catalog.html');
    })

    router.get("/positivefeedback", async (req, res) => {
        res.render('positiveFeedBack.html');
    })

    router.get("/negativefeedback", async (req, res) => {
        res.render('negitiveFeedBack.html');
    })

    router.get("/deleted", async (req, res) => {
        res.render('deleted.html');
    })

    router.post("/feedback", async (req, res) => {
    
            try {
    
                // Save uploaded file.
                let title = req.body.topic;
                title = removeSpecialChars(title);
                await fs.promises.writeFile(`./feedback/${title}.txt`, JSON.stringify(req.body));
    
                // Display success page.
                res.render("uploadFinished.html")
    
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

   
    return router;

};

/**
 * Removes all special characters from a string, keeping letters, numbers, and spaces.
 * @param {string} input - The string to clean.
 * @returns {string} - The cleaned string.
 */
function removeSpecialChars(input) {
    if (typeof input !== "string") {
        throw new TypeError("Input must be a string");
    }

    // Replace everything except letters, numbers, and spaces
    return input.replace(/[^a-zA-Z0-9 ]/g, "");
}