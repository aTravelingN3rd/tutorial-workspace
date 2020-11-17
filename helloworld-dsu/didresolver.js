//Load openDSU enviroment
require("../privatesky/psknode/bundles/testsRuntime");
require("../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

const crypto = opendsu.loadApi("crypto");


console.log("hello");




createKeyDid('default', (err, did, seedSSI)=> {

    resolveKeyDid(did, seedSSI, (err,seedSSI)=> {   

        signWithKeyDid(seedSSI,"hello", (err, status)=>{
            console.log("status",status)
            
        })
            
        
        
    })

})



function createKeyDid(domain, callback){

    var seedSSI = keyssispace.buildSeedSSI(domain);
    var didSSI;
    seedSSI.initialize("default", undefined, undefined, "v0", "hint",   (err) => {});
    var readSSI=seedSSI.derive();
    resolver.createDSU(seedSSI, (err, dsuInstance) =>{
        console.log(seedSSI.getPublicKey());
        var didDocument= {
          "@context": "https://www.w3.org/ns/did/v1",
          "id": "did:example:123456789abcdefghi",
          "authentication": [{

            "id": "did:example:123456789abcdefghi#keys-1",
            "type": "Ed25519VerificationKey2018",
            "controller": "did:example:123456789abcdefghi",
            "publicKeyBase58": seedSSI.getPublicKey().split('\n')[1]+''+seedSSI.getPublicKey().split('\n')[2]
          }]
        };
        dsuInstance.writeFile('/did', JSON.stringify(didDocument), (err) => {
             dsuInstance.getKeySSI('sread',(err, keyidentifier) => {
                callback(err, keyidentifier, seedSSI);
            });
        });
    });

    
}


function resolveKeyDid(keydid, callback){
    resolver.loadDSU(keydid, (err, dsuInstance) =>{
        dsuInstance.readFile('/did', (err, data) => {

            const dataObject = JSON.parse(data.toString());
            console.log("Resolve did with sread:",dataObject);

            callback(err,seedSSI);
           
        });
    });
}



function signWithKeyDid(keydid, message, callback){
    crypto.hash(keydid, message, (err, hash) => {
            crypto.sign(keydid, hash, (err, signature) => {
                crypto.verifySignature(keydid, hash, signature, (err, status)=>{
                    callback(err,status);
                })
            });
        });
}


