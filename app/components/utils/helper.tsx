import { Connection, PublicKey } from "@solana/web3.js";


export const mockWallet = () => {
    return {};
}

export const shortenPk = (pk: PublicKey | string, chars = 5) => {
    const pkStr = typeof pk === "object" && "toBase58" in pk? pk.toBase58() : pk;
    return `${pkStr.slice(0, chars)}...${pkStr.slice(-chars)}`;
};


export const confirmTx = async (txHash: string | undefined, connection: Connection) => {
    if (!txHash) {
        throw new Error("Transaction hash is undefined");
    }

    const blockhashInfo = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash: blockhashInfo.blockhash,
        lastValidBlockHeight: blockhashInfo.lastValidBlockHeight, // Correct casing
        signature: txHash, // Guaranteed to be a string after the check
    });
};