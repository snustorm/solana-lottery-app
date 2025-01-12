import { AnchorProvider, BN, Program, Idl } from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";

import IDL from "./idl.json";
import {
    LOTTERY_SEED,
    MASTER_SEED,
    PROGRAM_ID,
    TICKET_SEED,
} from "./constants";
import { AnchorWallet } from "@solana/wallet-adapter-react";


interface Lottery {
    id: number;
    authority: PublicKey;
    ticket_price: BN;
    lastTicketId: number;
    winnerId: number | null;
    claimed: boolean;
}

export const getProgram = (connection: Connection, wallet: AnchorWallet) => {
    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    const program = new Program(IDL as Idl, PROGRAM_ID, provider);
    return program;
};

export const getMasterAddress = (): PublicKey => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(MASTER_SEED)], 
        PROGRAM_ID
    )[0];
};

export const getLotteryAddress = (id: number) : PublicKey => {
    return PublicKey.findProgramAddressSync([
        Buffer.from(LOTTERY_SEED), 
        new BN(id).toArrayLike(Buffer, "le", 4)],
        PROGRAM_ID)[0];
}

export const getTicketAddress = async (LotteryPk: PublicKey, id: number) => {
    return PublicKey.findProgramAddressSync(

        [
            Buffer.from(TICKET_SEED),
            LotteryPk.toBuffer(),
            new BN(id).toArrayLike(Buffer, "le", 4),
        ],
        PROGRAM_ID)[0]
}

export const getTotalPrize = (lottery: Lottery | undefined) => {

    if (!lottery || !lottery.lastTicketId == null || !lottery.ticket_price == null) {
        console.error("Invalid lottery object:", lottery);
        return 0;
    }

    try {
        const lastTicketId = new BN(lottery.lastTicketId);  
        const ticketPrice = new BN(lottery.ticket_price);  

        // If there are no tickets, the total prize is 0
        if (lastTicketId.isZero()) {
            return "0";
        }
        // Calculate the total prize by multiplying the number of tickets by the ticket price
        return lastTicketId.mul(ticketPrice).div(new BN(LAMPORTS_PER_SOL)).toString();
    } catch (err) {
        console.error("Error calculating total prize:", err);
        return 0;
    }
};