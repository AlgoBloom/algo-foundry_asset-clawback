const algosdk = require("algosdk");

const algodClient = new algosdk.Algodv2(process.env.ALGOD_TOKEN, process.env.ALGOD_SERVER, process.env.ALGOD_PORT);

const creator = algosdk.mnemonicToSecretKey(process.env.MNEMONIC_CREATOR);
const receiver = algosdk.mnemonicToSecretKey(process.env.MNEMONIC_RECEIVER);

const submitToNetwork = async (signedTxn) => {
    // send txn
    let tx = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Transaction : " + tx.txId);

    // Wait for transaction to be confirmed
    confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);

    //Get the completed Transaction
    console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    return confirmedTxn;
};

const createNFT = async () => {
    const from = creator.addr;
    const defaultFrozen = false;
    const unitName = "TST1"; //8 characters max
    const assetName = "Algo Foundry NFT";
    const assetURL = "https://path/to/my/nft/asset/metadata.json";
    const manager = creator.addr;
    const reserve = undefined;
    const freeze = undefined;
    const clawback = creator.addr;
    const total = 1; // NFTs have totalIssuance of exactly 1
    const decimals = 0; // NFTs have decimals of exactly 0

    // create suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Create the asset creation transaction
    // For mutable params, set undefined instead of empty string so that no one can control it
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
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

    // Sign the transaction
    const signedTxn = txn.signTxn(creator.sk);

    const confirmedTxn = await submitToNetwork(signedTxn);

    return confirmedTxn["asset-index"];
};

const getCreatedAsset = async (account, assetId) => {
    let accountInfo = await algodClient.accountInformation(account.addr).do();

    const asset = accountInfo["created-assets"].find((asset) => {
        return asset["index"] === assetId;
    });

    return asset;
};

const assetOptIn = async (receiver, assetId) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
    let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        receiver.addr,
        receiver.addr,
        undefined,
        undefined,
        0,
        undefined,
        assetId,
        suggestedParams
    );

    let signedTxn = txn.signTxn(receiver.sk);
    return await submitToNetwork(signedTxn);
};

const transferAsset = async (receiver, assetId) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
    let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        creator.addr,
        receiver.addr,
        undefined,
        undefined,
        1,
        undefined,
        assetId,
        suggestedParams
    );
    const signedTxn = txn.signTxn(creator.sk);
    return await submitToNetwork(signedTxn);
};

const clawbackAsset = async (receiver, assetId) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
    let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        creator.addr,
        receiver.addr,
        undefined,
        receiver.addr,
        1,
        undefined,
        assetId,
        suggestedParams
    );
    const signedTxn = txn.signTxn(creator.sk);
    return await submitToNetwork(signedTxn);
};

(async () => {
    console.log("Creating NFT...");
    const assetId = await createNFT().catch(console.error);
    let asset = await getCreatedAsset(creator, assetId);
    console.log("NFT Created");
    console.log(asset);
    const receiverOptedIn = await assetOptIn(receiver, assetId);
    console.log("Receiver has opted in to asset " + assetId);
    console.log(receiverOptedIn);
    const receiverReceivedAsset = await transferAsset(receiver, assetId);
    console.log("Asset transfer complete.");
    console.log(receiverReceivedAsset);
    const clawbackCompleted = await clawbackAsset(receiver, assetId);
    console.log("Clawback has been completed.");
    console.log(clawbackCompleted);
})();