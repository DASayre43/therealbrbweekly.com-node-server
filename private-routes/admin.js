// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// const { ClassicLevel } = require('classic-level')
// const os = require('node:os');

// module.exports = function(visitorsDB) {

//     const router = express.Router();

//     router.get("/hardwarestatus", (req, res) => {
//         res.json({freeMemory: os.freemem(), host: os.hostname(), totalMemory: os.totalmem(), cpuInfo: os.cpus()})
//     })

//     router.get("/visitors", async (req, res) => {
        
//     })

//     return router;
    
// };

const express = require("express");
const os = require("node:os");

module.exports = function (visitorsDB) {

    const router = express.Router();

    router.get("/hardwarestatus", (req, res) => {

        res.json({
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
            host: os.hostname(),
            cpuCount: os.cpus().length,
            cpuInfo: os.cpus()
        });

    });

    router.get("/visitors/:x", async (req, res) => {

        try {

            const count = parseInt(req.params.x, 10);

            if (isNaN(count) || count < 1) {
                return res.status(400).json({
                    error: "Invalid count"
                });
            }

            const visitors = [];

            for await (const [key, value] of visitorsDB.iterator({
                reverse: true
            })) {

                visitors.push({
                    timestamp: key,
                    ...value
                });

                if (visitors.length >= count) {
                    break;
                }

            }

            res.json(visitors);

        }
        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Failed to read database"
            });

        }

    });

    return router;

};