const express = require("express");
const privateServer = express();
privateServer.engine('.html', require('ejs').__express);
const publicServer = express();
publicServer.engine('.html', require('ejs').__express);
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { ClassicLevel } = require('classic-level');

//----------------------------
//Functions
//----------------------------


async function deleteOldLogs(visitorsDB, maxAgeDays = 30) {

    const cutoff =
        Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);

    const batch = visitorsDB.batch();

    let deleted = 0;

    for await (const [key] of visitorsDB.iterator()) {

        if (Number(key) < cutoff) {

            batch.del(key);
            deleted++;

        } else {

            // Keys are sorted oldest -> newest
            break;

        }

    }

    if (deleted > 0) {

        await batch.write();

        console.log(`Deleted ${deleted} old visitor logs`);

    }

}

async function pruneVisitorsDB(visitorsDB, maxEntries = 10000) {

    let count = 0;

    for await (const [key] of visitorsDB.iterator({
        reverse: true
    })) {
        count++;
    }

    if (count <= maxEntries) {
        return;
    }

    const entriesToDelete = count - maxEntries;

    let deleted = 0;

    const batch = visitorsDB.batch();

    for await (const [key] of visitorsDB.iterator()) {

        batch.del(key);

        deleted++;

        if (deleted >= entriesToDelete) {
            break;
        }

    }

    await batch.write();

    console.log(`Deleted ${deleted} old visitor records`);
}

async function pruneLogs(visitorsDB) {

    await deleteOldLogs(visitorsDB, 30);
    await pruneVisitorsDB(visitorsDB, 100000);

}

async function startLogMaintenance(visitorsDB) {
    // Run immediately when server starts
    //console.log(visitorsDB)
    await pruneLogs(visitorsDB);

    // Then every 24 hours
    setInterval(() => {

        pruneLogs(visitorsDB)
            .catch(console.error);

    }, 24 * 60 * 60 * 1000);

}

function createDB(path) {
    // Create a database
    let db = new ClassicLevel(path, {
    valueEncoding: 'json'
    } )
    return db
}

function createStorage(path){
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    let storage = multer.diskStorage({

        destination(req, file, cb) {
            cb(null, path);
        },

        filename(req, file, cb) {

            
            cb(null, file.originalname);
        }
    });

    let upload = multer({
        storage: storage
    });

    return upload
}

const imageDB = createDB("./imageDB")
const issuesDB = createDB("./issuesDB")
const articlesDB = createDB("./articleDB")
const visitorsDB = createDB("./visits")
const imageStorage = createStorage("./uploads")
const issueStorage = createStorage("./Issues")

let databases = {
    imageDB: imageDB,
    issuesDB: issuesDB,
    articlesDB: articlesDB,
    visitorsDB: visitorsDB
};

if (!fs.existsSync("./feedback")) {
        fs.mkdirSync("./feedback");
    }

// -------------------------
// Private Server setup
// -------------------------

// Drop any request for a .php file
privateServer.use((req, res, next) => {
    const blockedPatterns = [
        /\.php$/i,
        /\.env$/i,
        /wp-admin/i,
        /wp-login/i,
        /wordpress/i,
        /xmlrpc\.php/i
    ];

    if (blockedPatterns.some(pattern => pattern.test(req.path))) {
        return res.status(200).end("<p>bad bot<p/>");
    }

    // Log all other requests
    // console.log(
    //     `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`
    // );

    next();
});

privateServer.use(express.static('./private/static-private'));
privateServer.use(express.json()); // for parsing application/json
privateServer.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
privateServer.set('views', path.join(__dirname, './private/views'));
privateServer.set('view engine', 'html');


const imageRoutes = require("./private-routes/images.js")(imageDB, imageStorage);
privateServer.use("/image", imageRoutes);

const adminRoutes = require("./private-routes/admin.js")(visitorsDB);
privateServer.use("/admin", adminRoutes);

const issueRoutes = require("./private-routes/issues.js")(issuesDB, issueStorage);
privateServer.use("/documents", issueRoutes);

const articleRoutes = require("./private-routes/articals.js")(articlesDB);
privateServer.use("/articles", articleRoutes);

privateServer.get("/error", (req, res, next) => {
    next(new Error("Something went wrong!"));
});

privateServer.use((req, res) => {
    res.status(404).sendFile(
        path.join(__dirname, "./private/static-private", "404.html")
    );
});

privateServer.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).sendFile(
        path.join(__dirname, "./private/static-private", "500.html")
    );
});    



// -------------------------
// Public Server setup
// -------------------------

// Routes
// const imageRoutes = require("./routes/images.js")(imageDB, imageStorage);
// privateServer.use("/image", imageRoutes);


    // Drop any request for a .php file
    publicServer.use(async (req, res, next) => {
        const blockedPatterns = [
            /\.php$/i,
            /\.env$/i,
            /wp-admin/i,
            /wp-login/i,
            /wordpress/i,
            /xmlrpc\.php/i
        ];

        if (blockedPatterns.some(pattern => pattern.test(req.path))) {
            return res.status(200).end("<p>bad bot<p/>");
        }

        // Log all other requests
        const key = Date.now().toString();
        await visitorsDB.put(key, {
            method: req.method,
            URL: req.originalUrl,
            adress: req.ip
        });
        // visitorsDB.put(new Date().now().toISOString(), { method: req.method, URL: req.originalUrl, adress: req.ip})
        next();
    });


    publicServer.use(express.json()); // for parsing application/json
    publicServer.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    publicServer.set('views', path.join(__dirname, './public/views'));
    publicServer.set('view engine', 'html');
    const mainRoutes = require("./public-routes/index.js")(databases);
    publicServer.use("/", mainRoutes);

    publicServer.use(express.static('./public/static-public'));


    const imageRoutes2 = require("./public-routes/images.js")(imageDB, imageStorage);
    publicServer.use("/image", imageRoutes2);

    const issueRoutes2 = require("./public-routes/issues.js")(issuesDB, issueStorage);
    publicServer.use("/documents", issueRoutes2);

    const articleRoutes2 = require("./public-routes/articals.js")(articlesDB);
    publicServer.use("/articles", articleRoutes2);


    // publicServer.get("/error", (req, res, next) => {
    //     next(new Error("Something went wrong!"));
    // });

    publicServer.use((req, res) => {
    res.status(404).sendFile(
        path.join(__dirname, "./private/static-private", "404.html")
    );
});

publicServer.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).sendFile(
        path.join(__dirname, "./private/static-private", "500.html")
    );
});

// -------------------------
// Start Servers
// -------------------------

//visitorsDB.then(startLogMaintenance(visitorsDB), (err) => {console.log(err)})

(async () => {

    await visitorsDB.open();
    await imageDB.open();
    await issuesDB.open();
    await articlesDB.open();

    await startLogMaintenance(visitorsDB);

    privateServer.listen(3000, () => {
        console.log("private Server running on http://localhost:3000");
    });

    publicServer.listen(8080, () => {
        console.log("public Server running on http://localhost:8080");
    });

})();


