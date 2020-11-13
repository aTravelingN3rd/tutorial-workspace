//Load openDSU enviroment
require("../privatesky/psknode/bundles/testsRuntime");
require("../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//load crypto library
const crypto = opendsu.loadApi("crypto");

//load bricking library
const bricking = opendsu.loadApi("bricking");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");
//console.log("KeySSI Space: ", keyssispace);

//Create a template keySSI (for default domain). See /conf/BDNS.hosts.json
const templateSSI = keyssispace.buildSeedSSI('default');

var sReadSSI;
var szaSSI;
var szaId;

templateSSI.initialize(templateSSI.getDLDomain(), templateSSI.getDLDomain(), templateSSI.getDLDomain(), undefined, 'hint', (err, templateSSI) => {
        if (err) {
            throw err;
        }

        sReadSSI=templateSSI.derive();
        
        szaSSI=sReadSSI.derive();
        szaId=szaSSI.getIdentifier();

        console.log("templ: ", templateSSI.getName());
    });



console.log("sreadSSI: ", sReadSSI.getName());
console.log("szaSSI: ", szaSSI.getName());
console.log("szaSSI: ", szaSSI);
console.log("anchorid: ", templateSSI.getAnchorId());
console.log("anchorid: ", sReadSSI.getAnchorId());
console.log("szaID: ", szaId);



//console.log("sreadssi: ", sReadSSI);


let data  = {"message": "Hello world!"};
let otherData  = "Hello underworld!";
var readData;
crypto.encrypt(sReadSSI, otherData, (err, encryptedData) => {
    readData=encryptedData;
});



//Create a DSU
resolver.createDSU(sReadSSI, (err, dsuInstance) =>{
    //Reached when DSU created
    if (err){
        throw err;
    }

        dsuInstance.writeFile('/data.txt', JSON.stringify(data), (err) => {
            dsuInstance.writeFile('/readData.txt', readData, (err) => {
                console.log("Data written succesfully! :)");
                
                
                
                dsuInstance.getKeySSI((err, keyidentifier) => {
                    console.log("KeySSI identifier: ", keyidentifier);


                    
                    resolver.loadDSU(keyidentifier, (err, anotherDSUInstance) => {
                        
                        anotherDSUInstance.readFile('/data.txt', (err, data)=>{
                                               
                                var dataObject = JSON.parse(data.toString()); //Convert data (buffer) to string and then to JSON
                                console.log("Data load succesfully! :)", dataObject.message); //Print message to console
                        });

                        anotherDSUInstance.readFile('/readData.txt', (err, data)=>{
                                    console.log("enc readData! :", data);
                                crypto.decrypt(sReadSSI, data, (err, plainData) => {
                                    console.log("readData! :", plainData.toString());
                                });
                                 //Print message to console
                        });
                    });
                });
            });         
        });
    
});


