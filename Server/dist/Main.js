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
Object.defineProperty(exports, "__esModule", { value: true });
//Internal
const CollectionEngine_1 = require("./Collections/CollectionEngine");
const Database_1 = require("./Database");
const Server_1 = require("./Server");
class YomiInitialiser {
    static run(dbpath) {
        return __awaiter(this, void 0, void 0, function* () {
            var mdb = new Database_1.Database(dbpath);
            yield mdb.setup();
            var cdb = new CollectionEngine_1.CollectionEngine('/data/collections.json', mdb);
            yield cdb.setup(); //Does nothing atm.
            let server = new Server_1.Server(mdb, cdb); //Make collection data accessible through API, pass param here.
        });
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let prodPath = '/data/manga';
        let devPath = 'C:/Users/Nlanson/Desktop/Coding/Yomi/test/data/manga';
        yield YomiInitialiser.run(prodPath);
    });
}
main();
