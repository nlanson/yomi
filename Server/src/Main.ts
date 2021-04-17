//Internal
import { CollectionEngine } from './Collections/CollectionEngine';
import { Database } from './Database';
import { Server } from './Server';

class YomiInitialiser {
    static async run(dbpath: string): Promise<void> {
        var mdb: Database = new Database(dbpath);
        await mdb.setup();

        var cdb: CollectionEngine = new CollectionEngine('/data/collections.json', mdb);
        await cdb.setup(); //Does nothing atm.
    
        let server = new Server(mdb, cdb); //Make collection data accessible through API, pass param here.
    }
}



async function main() {
    let prodPath = '/data/manga';
    let devPath = 'C:/Users/Nlanson/Desktop/Coding/Yomi/test/data/manga';
    
    await YomiInitialiser.run(devPath);
}

main();