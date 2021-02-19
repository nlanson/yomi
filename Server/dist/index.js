"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload = require('express-fileupload');
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = express_1.default();
const port = 6969;
/*
DB Structure:
[
    {
        title: string, //Title of manga (Taken from dir name)
        path: string, //Path of manga (Path for manga dir)
        pages: Array<string>, //List of pages for manga (Within the path dir)
        cover: string //First page of the manga (From pages list)
    }
]
*/
class Database {
    constructor(dbpath) {
        this.dbpath = dbpath;
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mangadb = yield this.scan_dir();
            yield this.init_db();
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mangadb = yield this.scan_dir();
            yield this.init_db();
        });
    }
    //Scans for any directories that could contain manga in the Database Path.
    scan_dir() {
        console.log('Scanning...');
        return new Promise((resolve) => {
            var mangasList = [];
            fs_1.default.readdir(this.dbpath, (err, files) => {
                files.forEach((file) => {
                    let fileDir = path_1.default.join(this.dbpath, file);
                    if (fs_1.default.statSync(fileDir).isDirectory()) { //If the file in this.dbpath is a directory, add to the mangas list.
                        mangasList.push({
                            title: file,
                            path: fileDir
                        });
                    }
                });
                console.log('DONE');
                resolve(mangasList);
            });
        });
    }
    //Initiales the DB from scanned dirs.
    init_db() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Creating DB');
            for (let i = 0; i < this.mangadb.length; i++) {
                this.mangadb[i].pageCount = this.getPageCount(this.mangadb[i].path); //Count how many files are in the path to fugure out how many pages are in the manga.
                if (this.mangadb[i].pageCount == 0) {
                    this.mangadb.splice(i, 1); //If there are no pages in the directory, remove it from the db.
                    continue;
                }
                this.mangadb[i].pages = yield this.makePagesArray(this.mangadb[i].path); //Create an array of pages and their directories.
                this.mangadb[i].cover = this.addPreview(this.mangadb[i].pages); //Creates a cover property with the first page of the manga as the value.
            }
            console.log('DONE');
        });
    }
    addPreview(pages) {
        return pages[0];
    }
    getPageCount(abs_path) {
        return fs_1.default.readdirSync(abs_path).length;
    }
    makePagesArray(abs_path) {
        return new Promise((resolve) => {
            var pages = [];
            fs_1.default.readdir(abs_path, (err, files) => {
                files = files.map(function (fileName) {
                    return {
                        name: fileName,
                        time: fs_1.default.statSync(abs_path + '/' + fileName).mtime.getTime()
                    };
                })
                    .sort(function (a, b) {
                    return a.time - b.time;
                })
                    .map(function (v) {
                    return v.name;
                });
                files.forEach((file) => {
                    //TODO: Only push jpg, png or jpeg file types as often manga downloaded contains ads in pdf or html format.
                    pages.push(abs_path + '/' + file);
                });
                resolve(pages);
            });
        });
    }
} //END DB Class
class Server {
    constructor(app, db) {
        this.app = app;
        this.db = db;
        this.init_server();
    }
    init_server() {
        this.app.use(upload());
        this.refreshdb();
        this.searchByTitle();
        this.listdb();
        this.editManga();
        this.upload();
        this.listen();
    }
    listen() {
        this.app.listen(port, () => {
            console.log(`Yomi Server listening at http://localhost:${port}`);
        });
    }
    searchByTitle() {
        //Returns the Manga info such as title, path and page count as well as array of page paths.
        this.app.get('/manga/:title', (req, res) => {
            let search = req.params.title;
            console.log(`Searched requested for ${search}`);
            let found = false;
            let i = 0;
            while (i < this.db.mangadb.length && found == false) {
                if (this.db.mangadb[i].title == req.params.title) {
                    found = true;
                    res.json(this.db.mangadb[i]);
                }
                i++;
            }
            if (found == false)
                res.json({ status: 'Not Found' });
        });
    }
    listdb() {
        // Can be used to list all manga in the DB to click and open.
        this.app.get('/list', (req, res) => {
            console.log('List requested.');
            let list = [];
            for (let manga in this.db.mangadb) {
                const listEntry = ((_a) => {
                    var { pages } = _a, manga = __rest(_a, ["pages"]);
                    return manga;
                })(this.db.mangadb[manga]); // Remove pages property from mangadb entries and push into list.
                list.push(listEntry);
            }
            res.json(list);
        });
    }
    refreshdb() {
        this.app.get('/refresh', (req, res) => {
            console.log('Refresh requested.');
            this.db.refresh();
            res.json({ status: 'Refreshed.' });
        });
    }
    editManga() {
        this.app.get('/editmanga/:edit', (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log('Edit Requested');
            let edit = req.params.edit;
            edit = JSON.parse(edit);
            let ogName = edit.title;
            let newName = edit.edit;
            let i = 0;
            let found = false;
            let message;
            while (i < this.db.mangadb.length && found == false) { //Loop through every manga
                if (this.db.mangadb[i].title == ogName) { //If ogname equals any manga in the db then..,
                    found = true;
                    this.db.mangadb[i].title = newName; //Set manga title to the new name
                    fs_1.default.rename(this.db.mangadb[i].path, this.db.dbpath + '/' + newName, (err) => {
                        if (err)
                            message = err && console.log(err);
                        else
                            console.log(`Successfully Edited ${ogName} -> ${newName}`);
                        this.db.refresh(); //Refresh DB
                        if (!message)
                            message = 'Success';
                        let response = {
                            found: found,
                            message: message
                        };
                        res.json(response); //Response with found = true and message being either success or rename err.
                    });
                }
                i++;
            }
            //If no match was found, then response with 'manga not found'
            if (found == false) {
                console.log('Edit is Invalid');
                message = 'Manga not found';
                let response = {
                    found: found,
                    message: message
                };
                res.json(response); //Respond with found = false and manga not found.
            }
        }));
    }
    upload() {
        this.app.get('/upload', (req, res) => {
            res.json({ status: 'failed', message: `You've requested this the wrong way.` });
        });
        this.app.post('/upload', (req, res) => {
            if (req.files) {
                console.log('Recieving Upload...');
                let file = req.files.file;
                let filename = file.name;
                file.mv(this.db.dbpath + '/' + filename, (err) => {
                    if (err) {
                        res.json({ status: 'failed', message: 'Failed in file.mv()' });
                        console.log('Upload Failed at mv().');
                    }
                    else {
                        res.json({ status: 'Success', message: 'File uploaded' });
                        console.log('Upload Success');
                    }
                });
            }
            else {
                res.json({ status: 'failed', message: 'no file uploaded.' });
            }
        });
    }
} //END Server Class
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let prodPath = '/data/manga';
        let devPath = 'C:/Users/Nlanson/Desktop/Coding/Yomi/test/data/manga';
        var dbpath = prodPath;
        var db = new Database(dbpath);
        yield db.setup();
        let server = new Server(app, db);
    });
}
main();
