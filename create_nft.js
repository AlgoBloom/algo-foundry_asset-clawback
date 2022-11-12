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
    // print the txn id
    console.log("Transaction ID is: " + txn.txnId);
    // wait for confirmation of transaction completion, save object in var
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txn.txnId, 4);
    // log information about completed transaction
    console.log("Transaction with ID " + txn.txnId + " confirmed in round " + confirmedTxn["confirmed-round"]);
    // the submit to network function returns the confirmed transaction object
    return confirmedTxn;
}