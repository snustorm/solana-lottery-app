import { PublicKey } from "@solana/web3.js";


export const mockWallet = () => {
    return {};
}

export const shortenPk = (pk: PublicKey | String, chars = 5) => {
    const pkStr = typeof pk === "object" && "toBase58" in pk? pk.toBase58() : pk;
    return `${pkStr.slice(0, chars)}...${pkStr.slice(-chars)}`;
};

export const confirmTx = async (txHash: String | undefined, connection: any) => {
    const blockhasInfo = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash: blockhasInfo.blockhash,
        LastValidBlockHeight: blockhasInfo.LastValidBlockHeight,
        signature: txHash,
    })
}