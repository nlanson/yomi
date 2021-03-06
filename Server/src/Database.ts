//External
import fs from 'fs';
const fsPromises = fs.promises;
import path from 'path';

//Internal
import { Logger } from './Common/Logger';
import { CommonHandlerResult } from './Common/CommonInterfaces';
import { UploadHandler } from './UploadHandler'


/*
    Manga Structure:
        pageCount,
        pages,
        title,
        path,
        cover
*/

export class Database {
    public dbpath: string;
    public mangadb: any;
    
    constructor(dbpath: string) {
        this.dbpath = dbpath;
    }

    public async setup() { //Initial DB Setup
        this.mangadb = await this.scan_dir(true); //Verbose ON
        await this.init_db(true);
    }

    public async refresh() { //For refreshing the DB from API
        this.mangadb = await this.scan_dir(); //Verbose OFF
        await this.init_db(false);
        return true;
    }
    
    //Scans for any directories that could contain manga in the Database Path.
    public scan_dir(verbose?:boolean) {
        if (verbose) Logger.log(`DEBUG`, 'Scanning specifed path for manga...');
        
        return new Promise((resolve) => {
            var mangasList: any[] = [];
            fs.readdir(this.dbpath, (err, files) => {
                if ( files == undefined  ) {
                    resolve(mangasList);
                } else {
                    files.forEach((file) => {
                        let fileDir = path.join(this.dbpath, file);
                        if ( fs.statSync(fileDir).isDirectory() ) { //If the file in this.dbpath is a directory, add to the mangas list.
                            mangasList.push({
                                title: file,
                                path: fileDir
                            });
                        } else {
                            if (verbose) Logger.log(`DEBUG`, `Deleting ${file} as it is not a directory.`);
                            fs.unlink(fileDir, (err) => {
                                if (err) Logger.log('ERROR', `${err}`)
                            })
                        }
                    });
                    
                    if (verbose) Logger.log(`DEBUG`, 'Scan complete');
                    resolve(mangasList);
                }
            }); 
        });
    }
    
    //Initiales the DB from scanned dirs.
    private async init_db(verbose?:boolean) {
        if (verbose) Logger.log('DEBUG', 'Creating Database Object');
        for ( let i = 0; i < this.mangadb.length; i++ ) {
            this.mangadb[i].pageCount = await this.getPageCount(this.mangadb[i].path); //Count how many files are in the path to fugure out how many pages are in the manga.
            if ( this.mangadb[i].pageCount == 0 ) {
                if (verbose) Logger.log( 'DEBUG', `Deleting ${this.mangadb[i].title} as it has a page count of zero.`);
                fs.rmdirSync(this.mangadb[i].path, { recursive: true });
                this.mangadb.splice(i, 1); //If there are no pages in the directory, remove it from the db.
                continue
            }

            this.mangadb[i].pages = await this.makePagesArray(this.mangadb[i].path); //Create an array of pages and their directories.
            this.mangadb[i].cover = this.addPreview(this.mangadb[i].pages) //Creates a cover property with the first page of the manga as the value.
        }
        if (verbose) Logger.log('DEBUG', 'Database created.')
    }
    
    private addPreview(pages: Array<any>) {
        return pages[0];
    }


    private getPageCount(abs_path: string): Promise<number> { //Counts how many pages in a manga dir.
        return new Promise((resolve) => {
            var pages: String[] = [];
            fs.readdir(abs_path, (err, files) => {
                files.forEach((file) => {
                    let filetype = path.extname(abs_path + '/' + file);
                        //console.log(`${file} is a ${filetype}`);
                        if( //List all accepted page types here.
                            filetype == '.jpg' ||
                            filetype == '.JPG' ||
                            filetype == '.png' ||
                            filetype == '.PNG' ||
                            filetype == '.jpeg' ||
                            filetype == '.JPEG' 
                            ) {
                            pages.push(abs_path + '/' + file);
                        }
                });
                resolve(pages.length);
            }); 
        });
    }

    private makePagesArray(abs_path: string): Promise<any> { //Creates an array of manga pages from paths.
        return new Promise((resolve) => {
            var pages: String[] = [];
            fs.readdir(abs_path, (err, files) => {
                //Sort pages by time
                files = files.map(function (fileName) {
                    return {
                        name: fileName,
                        time: fs.statSync(abs_path + '/' + fileName).mtime.getTime()
                    };
                })
                .sort(function (a, b) {
                    return a.time - b.time; })
                .map(function (v) {
                    return v.name;
                });
                
                files.forEach((file) => {
                    let filetype = path.extname(abs_path + '/' + file);
                    if( //List all accepted page types here.
                        filetype == '.jpg' ||
                        filetype == '.JPG' ||
                        filetype == '.png' ||
                        filetype == '.PNG' ||
                        filetype == '.jpeg' ||
                        filetype == '.JPEG' 
                        ) {
                        pages.push(abs_path + '/' + file);
                    }
                });
                resolve(pages);
            }); 
        })
    }

    /*
    API FUNCTIONS
    */

    public searchByTitle(title: string): CommonHandlerResult {
        console.log('query received')
        let found: boolean = false;
        let i:number = 0;
        while ( i < this.mangadb.length && found == false ) {
            if ( this.mangadb[i].title == title ) {
                found = true;
                return {
                    status: 'success',
                    message: "Found",
                    data: this.mangadb[i]
                }
            }
            i++
        }

        if ( found == false ) {
            return {
                status: 'failure',
                message: "Manga not found."
            }
        } else { //fallback
            return {
                status: 'error',
                message: "Error"
            }
        }
    }

    public list(): CommonHandlerResult {
        let list = [];
        for (let manga in this.mangadb) {
            const listEntry = (({ pages, ...manga }) => manga)(this.mangadb[manga]) // Remove pages property from mangadb entries and push into list.
            list.push(listEntry);
        }

        return {status: 'success', message: 'list compiled', data: list}
    }

    public async upload(file: any): Promise<CommonHandlerResult> {
        let filename: string = file.name;
        let dbresponse: CommonHandlerResult;
        
        try {
            await file.mv(this.dbpath + '/' + filename);
        } catch(e) {
            Logger.log(`ERROR`, 'Failed receiving the file upload.');
            dbresponse = {
                status: 'failure',
                message: "Failed at receiving file upload"
            }
            return dbresponse;
        }

        Logger.log('DEBUG', 'Upload received, handling...')

        let archive: string = this.dbpath + '/' + filename;
        let uh: UploadHandler = new UploadHandler(archive, this);
        let result: CommonHandlerResult = await uh.handle();

        switch (result.status) {
            case ( 'success' ):
                dbresponse = {
                    status: 'success',
                    message: 'Upload successful'
                }
                this.refresh();
                return dbresponse
            case ( 'error' ):
                dbresponse = {
                    status: 'error',
                    message: result.message
                }
                return dbresponse
            default:
                Logger.log('ERROR', 'Handler failed to instantiate.');    
                dbresponse =  {
                    status: 'failure',
                    message: "Handler failed to instantiate"
                };
                return dbresponse
        }
    }

    public async editMangaName(o: string, n: string): Promise<CommonHandlerResult> {
        let i = 0; //Loop iterator
        let found: Boolean = false; //Was the manga found?
        let message: any; //return message for the API
        let flag: boolean = true; //Flag for checking if FS failed or not.

        while ( i < this.mangadb.length && found == false ) { //Loop through every manga
            if ( this.mangadb[i].title == o ) { //If ogname equals any manga in the db then..,
                found = true;
                this.mangadb[i].title = n; //Set manga title to the new name
                
                //rename directory in db
                try {
                    await fsPromises.rename(this.mangadb[i].path, this.dbpath + '/' +n);
                } catch(e) {
                    flag = false;
                    Logger.log(`ERROR`, 'Edit Failed');
                    message = "Rename failed. Manga exists but FS failed.";
                    return {status: 'error', message: message} //Rename failed. Manga exists but FS failed.
                }

                //If rename is successful, code will enter this condition.
                if (flag) { 
                    Logger.log(`DEBUG`, `Successfully Edited ${o} -> ${n}`);
                    message = 'Edit Success';
                    this.refresh(); //Refresh DB
                    return {status: 'success', message: message}; // Full success
                }
            }
            i++;
        }

        //Fallback statement for when manga is not found in the database.
        Logger.log(`ERROR`, 'Edit request manga not found.')
        message = 'Manga not found';
        let response: CommonHandlerResult = {
            status: 'failure',
            message: 'Manga not found'
        }
        return response
    } 

    public async deleteManga(title: string): Promise<CommonHandlerResult> {
        let found: boolean = false;
        let i = 0;
        while (i < this.mangadb.length && found == false) {
            if (this.mangadb[i].title = title) {
                found = false;

                //Delete directory containing manga
                await fsPromises.rmdir(this.dbpath + '/' + title, { recursive: true });
                //Remove entry from DB
                this.mangadb.splice(i, 1); //Remove deleted entry from DB

                Logger.log('DEBUG', `${title} was deleted`);
                let response:CommonHandlerResult = {
                    status: 'success',
                    message: `Successfully Deleted`
                }
                return response
            }
        }

        Logger.log('ERROR', 'Manga to delete not found');
        let response:CommonHandlerResult = {
            status: 'failure',
            message: `Manga not found`
        }
        return response
    }

}//END DB Class