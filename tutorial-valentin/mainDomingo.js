//Load openDSU enviroment
require("../privatesky/psknode/bundles/testsRuntime");
require("../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

//load crypto library
const crypto = opendsu.loadApi("crypto");

//load anchoring library
const anchoring = opendsu.loadApi("anchoring");

//Create a template keySSI (for default domain). See /conf/BDNS.hosts.json
const seedSSI = keyssispace.buildSeedSSI();


//store dsu identifier
var dsuId;


///Derive SRead and SZA

var sReadSSI;
var szaSSI;

var fileText1="Hello world";
var fileText2="Hello underworld";

const seedSSI2 = keyssispace.buildSeedSSI();

//param initialize: dlDomain, privateKey, publicKey, vn, hint, callback
seedSSI.initialize("default", undefined, undefined, "v0", "hint",   (err) => {
        if (err) {
            throw err;
        }

        sReadSSI=seedSSI.derive();       
        szaSSI=sReadSSI.derive();     

        runTest();

        
});




function runTest(callback) {
    var favouriteEndpoint="http://localhost:8080"
    //DSU creation
    resolver.createDSU(seedSSI,{
        favouriteEndpoint
    },(err, dsu) => {
        if (err){
            throw err;
        }
        console.log("DSU created!");

        //dsu.listFolders('/', (err, folders) => { list folder works but not create folder (path is not defined)

        //Write file in DSU
        dsu.writeFile('/data.txt',fileText1, (err, hash) => {
            if (err){
                throw err;
            }
            console.log("Data write successful");

            //Read file from DSU
            dsu.readFile('/data.txt', (err, data) => {
                if (err){
                    throw err;
                }
                console.log("Data.txt:",data.toString());
                //Load another instance of dsu with 

                //1-Seed key -> not working (path not recognized)
                //loadDSUwithSeed();

                //2-Key identifier (Still don't know what is it) -> working -> ANchorSSI ? 
                /*
                dsu.getKeySSI((err, keyidentifier) => {
                    dsuId=keyidentifier;
                    loadDSUwithKeyIdentifier(keyidentifier);
                });
                */

                //3-sReadSSI key -> Cannot read property create/readFile of undefined
               //loadDSUwithSRead();

               //4-Set key SSI = anchorID -> SetKeySSI is not a function (only in ArchiveConfigurator)
               //dsu.setKeySSI();

               //5 - Load DSU with keyidentifier and SREAD option
             
                /*
               dsu.getKeySSI((err, keyidentifier) => {
                    console.log(dsu.constructor.name)
                    loadDSUwithKeyIdentifierAndSRead(keyidentifier);
                });
                
                */
                //6 - Create a private folder -> Path is not defined -> createBarTest.js fail so maybe an error somwhere -> objective is to use dossierContext.readonly somehow
               
                //Fixed naming problem in Archive.js createfolder function. but new error listener is not a function
                
                /*console.log("dsuFx:",dsu);
                dsu.createFolder('/private', (err) => {     });

                dsu.listFolders('/', (err, folders) => { console.log('folders:',folders); });

               */

               dsu.getKeySSI((err, keyidentifier) => {
                    loadDSUwithPrivateFolder(keyidentifier);
                });
               

                
                

                


            });
        }); 

    });
}


//not working -> path not recognized
function loadDSUwithSeed( callback) {

    console.log("Load DSU with SeedSSI and read")
    resolver.loadDSU(seedSSI,  (err, dsu) => {
        dsu.readFile('  /data.txt', (err, data) => {
            if (err){
                throw err;
            }
            console.log("Data.txt:",data.toString());
        });
    });
}

function loadDSUwithKeyIdentifier(keyidentifier, callback) {

    console.log("Load DSU with KeyIdentifier and read")
    resolver.loadDSU(keyidentifier,  (err, anotherDsu) => {
        anotherDsu.readFile('/data.txt', (err, data) => {
            if (err){
                throw err;
            }
            console.log("Data.txt:",data.toString());
        });
    });
}

function loadDSUwithSRead(keyidentifier, callback) {

    console.log("Load DSU with sReadSSI");
    console.log("sReadSSI:", sReadSSI.getName());
    /*
    resolver.loadDSU(sReadSSI,  (err, anotherDsu) => {
        anotherDsu.readFile('/data.txt', (err, data) => {
            if (err){
                throw err;
            }
            console.log("Data.txt:",data.toString());
        });
    });
    */
}

function loadDSUwithKeyIdentifierAndSRead(keyidentifier, callback) {

    console.log("Load DSU with KeyIdentifier and sReadSSI")
    resolver.loadDSU(keyidentifier, sReadSSI, (err, anotherDsu) => {
        anotherDsu.readFile('/data.txt', (err, data) => {
            if (err){
                throw err;
            }
            console.log("Data.txt:",data.toString());
            //Trying to write but should not work
            anotherDsu.writeFile('/data2.txt', "That should not Work",(err, data) => {
                if (err){
                    throw err;
                }
                anotherDsu.readFile('/data2.txt', (err, data) => {
                    if (err){
                        throw err;
                    }
                    console.log("Data2.txt:",data.toString());
                    //Is it writtern in Old DSU?
                    resolver.loadDSU(keyidentifier, seedSSI, (err, oldDsu) => {
                        oldDsu.readFile('/data.txt', (err, data) => {
                            if (err){
                                throw err;
                            }
                            console.log("Old dsu - Data.txt:",data.toString());
                            oldDsu.readFile('/data2.txt', (err, data) => {
                                if (err){
                                    throw err;
                                }
                                console.log("Old dsu -Data2.txt:",data.toString());
                            });
                        });
                    }); //Yes it is written

                });
            });
        });
    });
}

function loadDSUwithPrivateFolder(keyidentifier, callback) {

    console.log("Load DSU with KeyIdentifier and sReadSSI")
    resolver.loadDSU(keyidentifier, sReadSSI, (err, anotherDsu) => {
        console.log(anotherDsu);
        anotherDsu.createFolder('/private', (err) => {     });
        
    });
}

