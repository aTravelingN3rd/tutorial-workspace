//Load openDSU enviroment
require("../privatesky/psknode/bundles/testsRuntime");
require("../privatesky/psknode/bundles/openDSU");

/*const testUtils = require('../privatesky/modules/key-ssi-resolver/tests/utils');
const dc = require("double-check");
const assert = dc.assert;

const constants = require('../privatesky/modules/key-ssi-resolver/lib/constants');
const dsuRepresentations = constants.builtinDSURepr;
const brickMapStrategies = constants.builtinBrickMapStrategies;
*/

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
const seedSSI = keyssispace.buildSeedSSI('default');

//store dsu identifier
var dsuId;


///Derive SRead and SZA
var sReadSSI;
var szaSSI;
var szaId;

var fileText1="Hello world";
var fileText2="Hello underworld";



//param initialize: dlDomain, privateKey, publicKey, vn, hint, callback
seedSSI.initialize(seedSSI.getDLDomain(), undefined, undefined, "v0", "hint",   (err, seedSSI) => {
        if (err) {
            throw err;
        }

        sReadSSI=seedSSI.derive();       
        szaSSI=sReadSSI.derive();

        console.log(seedSSI);
        console.log("test",sReadSSI.getDSURepresentationName());
        console.log("sreadId",sReadSSI.getIdentifier());
        
    //Seed/sRead AnchorId = sza Identifier
        //console.log(seedSSI.getAnchorId());
        //console.log(szaSSI.getIdentifier());

        runTest(seedSSI);


      
       

        
});


 


//verifyKey(sReadSSI);


console.log('///First Test ok///')


/** Param create dsu
     * @param {object} options
     * @param {string} options.favouriteEndpoint
     * @param {string} options.brickMapStrategy 'Diff', 'Versioned' or any strategy registered with the factory
     * @param {object} options.anchoringOptions Anchoring options to pass to bar map strategy
     * @param {callback} options.anchoringOptions.decisionFn Callback which will decide when to effectively anchor changes
     *                                                              If empty, the changes will be anchored after each operation
     * @param {callback} options.anchoringOptions.conflictResolutionFn Callback which will handle anchoring conflicts
     *                                                              The default strategy is to reload the BrickMap and then apply the new changes
     * @param {callback} options.anchoringOptions.anchoringEventListener An event listener which is called when the strategy anchors the changes
     * @param {callback} options.anchoringOptions.signingFn  A function which will sign the new alias
     * @param {object} options.validationRules
     * @param {object} options.validationRules.preWrite An object capable of validating operations done in the "preWrite" stage of the BrickMap
     * @param {callback} callback
     */

//var favouriteEndpoint="http://localhost:8080";


function runTest(keySSI,callback) {

    resolver.createDSU(keySSI, {

        //favouriteEndpoint,
        //anchorinOpions:{signingFn }, //?
        validationRules: {
            preWrite: {
                /**
                 * @param {BrickMap} A dirty copy of the valid BrickMap
                 * @param {string} The write operation (addFile, delete, copy, etc...)
                 * @param {string} The BrickMap path to write in
                 * @param {object} Corresponding write data. Ex: brick hashes for the write operation
                 * @param {callback} callback
                 */
                validate: (dirtyBrickMap, operation, brickMapPath, data, callback) => {
                    console.log(operation, brickMapPath, data);
                    // Assume all writes are valid
                    return callback();
                }
            }
        }
    },(err, dsu) => {
        //available in privatesky/modules/bar/lib/ARchive
        //console.log("dsu fonctions:",dsu);
        //dsu.setValidationRules()
        console.log("keySSI",keySSI.getIdentifier());
        writeAndReadTest(dsu, callback);

    });
}

function writeAndReadTest(dsu, callback) {

    dsu.writeFile('/data.txt',fileText1, (err, hash) => {
        dsu.readFile('/data.txt', (err, data) => {
            dsu.getKeySSI((err, keyidentifier) => {
            
                 console.log("keyId:",keyidentifier); //How is this generated, getIdentifier of what ? 
                 //console.log("dsu:",dsu.getDID()); keyidentifiere replace DID ?
                  console.log("keyId:",keyidentifier);
                 


                loadSameDSU(keyidentifier, dsu, callback);

            });
        }) 
    }) 
}

function loadSameDSU(dsuId, oldDSU, callback) {
    resolver.loadDSU(dsuId, seedSSI,  (err, dsu) => {
        dsu.writeFile('/otherData.txt', fileText2, (err) => {

            dsu.getKeySSI((err, keyidentifier) => {
                console.log("keyId:",keyidentifier); 

                readFilesTest(keyidentifier, callback);
            })
        
        });
    });
}


function readFilesTest(dsuId, callback) {
    resolver.loadDSU(dsuId, seedSSI, (err, dsu) => {

        dsu.readFile('/data.txt', (err, data) => {
            console.log("Data file :",data.toString());

            dsu.readFile('/otherData.txt', (err, data) => {
                console.log("DOther data file! :",data.toString());  

                //runTestSRead(sReadSSI);

            })

           
        });
    });
}



//Resolve DSU with sRead
function  runTestSRead(keySSI) {
    console.log("---Test 2 Start---");
    //keySSI.initialize(keySSI.getDLDomain(), undefined, undefined, "v0", "hint",   (err, keySSI) => {
        
        //use option in load? DId not get how to use it
        //what is getKeySSI? Why anchor not used? //
        
        resolver.loadDSU(dsuId, keySSI,(err, dsu) => {
            if (err){
                throw err;
            }
                   
           dsu.readFile('/data.txt', (err, data) => {
               console.log("Data file SREEEAD:",data.toString());
                if(lowCostTest(keySSI)){
                   dsu.writeFile('/dataRead.txt',"I shouldn't be able to write here", (err, hash) => {
                        dsu.readFile('/dataRead.txt', (err, data) => {
                            console.log("Data file SREEEAD:",data.toString());

                           

                        });
                    });
                }
                
                 testOldDsuWithTest(seedSSI);

            });
         

        }); 
    //});

}

//Resolve DSU with sRead
function  testOldDsuWithTest(keySSI) {
    console.log("---Test 3 Start------");
    //keySSI.initialize(keySSI.getDLDomain(), undefined, undefined, "v0", "hint",   (err, keySSI) => {
        
        //use option in load? DId not get how to use it
        //what is getKeySSI? Why anchor not used? //
       // resolver.createDSU(seedSSI, (err, dsu) => {
          resolver.loadDSU(dsuId, keySSI,(err, dsu) => {
                if (err){
                    throw err;
                }
                       
               dsu.readFile('/data.txt', (err, data) => {
                   console.log("Data file SREEEAD:",data.toString());
                    if(lowCostTest(keySSI)){
                        dsu.writeFile('/dataSeed.txt',"Write normally", (err, hash) => {
                            dsu.readFile('/dataSeed.txt', (err, data) => {
                                console.log("Data file SSEED:",data.toString());

                               

                            });
                        });
                    }
                   
             

                });
             

            }); 

      //  });

        
    //});

}



function lowCostTest(keySSI){
    
    var status;

    if(keySSI.getName() == 'seed'){
        console.log("test ok")
        status=true;
    }else{
        console.log("You don't have permission to write in this DSU");
        status=false;
    }

    return status;
}



function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}