// importing algosdk
const algosdk = require("algosdk");
const { Account } = require("algosdk/dist/types/src/client/v2/algod/models/types");

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

// this function creates the NFTs
const createNFT = async () => {
    // address that is creating the NFT
    const from = creator.addr;
    // frozen is set to false
    const defaultFrozen = false; 
    // unit name is MND
    const unitName = "MND";
    // asset name is Mandala NFT
    const assetName = "Mandala NFT";
    // the URL where the asset meta data may be found
    const assetURL = "https://path/to/my/nft/asset/metadata.json";
    // manager address is initialized as the creator address
    const manager = creator.addr;
    // reserve is initialized as undefined
    const reserve = undefined;
    // freeze is intialized as undefined
    const freeze = undefined;
    // creator is able to clawback the asset
    const clawback = creator.addr;
    // total should be one, NFTs always have issuance of exactly one
    const total = 1;
    // pure NFTs have zero decimals
    const decimals = 0;
    // builds suggested params including fee amount
    const suggestedParams = await algodClient.getTransactionParams().do();
    // builds transaction that will be submitted to the AVM

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        // parameters are loaded in from above where defined
        from,
        total,
        decimals,
        assetName,
        unitName,
        assetURL,
        defaultFrozen,
        suggestedParams,
        freeze,
        manager,
        clawback,
        reserve,
    });

    // signed transaction is returned as a object and saved in signed transaction variable
    const signedTxn = txn.signTxn(creator.sk);
    // returns the confirmed transaction object after the signed transaction is submitted to the network
    const confirmedTxn = await submitToNetwork(signedTxn);
    
    // finally the asset ID is retured by the create NFT function
    return confirmedTxn["asset-index"]
};

// gets the created asset information
const getCreatedAsset = async (account, assetId) => {
    //  gets account info from algod
    let accountInfo = await algodClient.accountInformation(account.addr).do();
    // returns account info in 
    const asset = accountInfo["created-assets"].find((asset) => {
        // returns true if asset index equals the asset id ?
        return asset["index"] === assetId;
    });
    // return the asset constant
    return asset;
};

// this actually runs the logic of the script using functions below
(async () => {

})