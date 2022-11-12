// importing algosdk
const algosdk = require("algosdk");

// using algosdk to create a algod client instance
const algodClient = new algosdk.Algodv2(process.env.ALGOD_TOKEN, process.env.ALGOD_SERVER, process.env.ALGOD_PORT);

// secret key of creator
const creatorSecretKey = algosdk.mnemonicToSecretKey(process.env.MNEMONIC_CREATOR);

// this function submits the txn to the network
const submitToNetwork = async (signedTxn) => {
    // returns txn object
    let txn = await algodClient.sendRawTransaction(signedTxn).do();
}