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

    resolveKeyDid(did, (err, keydid, pk )=> {   

        signWithKeyDid(seedSSI,keydid,"hello",pk, (err, status)=>{
            console.log("status of signature verification",status)
            
        })
            
        
        
    })

})



function createKeyDid(domain, callback){

    var seedSSI = keyssispace.buildSeedSSI(domain);
    var didSSI;
    seedSSI.initialize("default", undefined, undefined, "v0", "hint",   (err) => {});
    var readSSI=seedSSI.derive();
    resolver.createDSU(seedSSI, (err, dsuInstance) =>{
        var did="did:"+seedSSI.getDLDomain()+":"+seedSSI.getIdentifier();
        var didDocument= {
          "@context": "https://www.w3.org/ns/did/v1",
          "id": did,
          "authentication": [{

            "id": did+"#keys-1",
            "type": "Ed25519VerificationKey2018",
            "controller": did,
            "publicKeyBase58": seedSSI.getPublicKey()//.split('\n')[1]+''+seedSSI.getPublicKey().split('\n')[2]
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

            var pk=dataObject.authentication[0].publicKeyBase58;

            callback(err,keydid, pk);

                
           
        });
    });
}



function signWithKeyDid(seedSSI, keydid, message, pk, callback){
    crypto.hash(seedSSI, message, (err, hash) => {
            crypto.sign(seedSSI, hash, (err, signature) => {
                crypto.verifySignature(keydid, hash, signature, pk, (err, status)=>{
                    callback(err,status);
                })
            });
        });
}


