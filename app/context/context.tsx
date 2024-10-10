'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BN, Wallet } from "@project-serum/anchor";
import { SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { toast } from 'react-toastify';


import {
    getLotteryAddress,
    getMasterAddress,
    getProgram,
    getTicketAddress,
    getTotalPrize,
} from "../components/utils/program";

import { confirmTx, mockWallet } from "../components/utils/helper";
import { TICKET_SEED } from "../components/utils/constants";

//import toast from "react-hot-toast";

// Define the shape of your context data
interface AppContextType {
    connected: boolean;
    publicKey: string | null;
    program: any | null;
    isMasterInitialized: boolean;
    lotteryId: number;
    lotteryPot: number,
    isLotteryAuthority: boolean | undefined,
    isFinished: boolean,
    canClaim: boolean,
    lotteryHistory: LotteryHistory[],
    initMaster?: () => Promise<void>; // Adding the initMaster function as optional
    createLottery?: () => Promise<void>;
    buyTicket?: () => Promise<void>;
    pickWinner?: () => Promise<null | undefined>;
    claimPrize?: () => Promise<null | undefined>;
}

interface Lottery {
    id: number;
    authority: PublicKey;
    ticket_price: BN;
    lastTicketId: number;
    winnerId: number | null;
    claimed: boolean;
}

interface LotteryHistory {
    lotteryId: number;
    winnerId: number;
    winnerAddress: PublicKey; // Adjust this based on the actual type of authority
    prize: number; // Adjust this if `prize` can have a different type
}

// Create the context with a default value of `undefined` for optional types
const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const { connected, publicKey } = useWallet();
    const { connection } = useConnection();
    const wallet = useAnchorWallet();


    const [masterAddress, setMasterAddress] = useState<PublicKey | null>(null);
    const [initialized, setIsInitialized] = useState(false);
    const [lotteryPot, setLotteryPot] = useState(0.01);
    const [lotteryId, setLotteryId] = useState(0);
    const [lottery, setLottery] = useState<Lottery | undefined>(undefined);
    const [LotteryAddress, setLotteryAddress] = useState<PublicKey | null>(null);
    const [userWinningId, setUserWinningId] = useState(0);
    const [lotteryHistory, setLotteryHistory] = useState<LotteryHistory[]>([]);
    const [canClaim, setCanClaim] = useState(false);

    // Use useMemo to get the program if connected
    const program = useMemo(() => {
        if (connected && wallet) {
            return getProgram(connection, wallet);
        }
        return null; // Ensure null is returned when wallet or connection is unavailable
    }, [connection, wallet, connected]);
    
    useEffect(() => {
        updateState()
    }, [program])

    useEffect(() => {
        if(!lottery)
            return;
        getPot();
        getHistory();
    }, [lottery])

    useEffect(() => {
        if (lottery && !lottery.claimed && userWinningId) {
            setCanClaim(true);
        } else {
            setCanClaim(false);
        }
    }, [lottery, userWinningId]);

    const updateState = async () => {
        if (!program) return;
    
        try {
            if (!masterAddress) {
                // Get master address
                const fetchedMasterAddress = await getMasterAddress();
                setMasterAddress(fetchedMasterAddress);
            }
    
            const master = await program.account.master.fetch(
                masterAddress ?? await getMasterAddress()
            );
            setIsInitialized(true);
            setLotteryId(master.lastId);
    
            const LotteryAddress = await getLotteryAddress(master.lastId);
            setLotteryAddress(LotteryAddress);
    
            const lottery1 = await program.account.lottery.fetch(LotteryAddress) as Lottery;
    
            // Use lottery1 here directly
            if (wallet?.publicKey && lottery1) {
                const userTickets = await program.account.ticket.all();
                const userWin = userTickets.some((t) => t.account.id === lottery1.winnerId);
    
                if (userWin && lottery1.winnerId) {
                    setUserWinningId(lottery1.winnerId);
                } else {
                    setUserWinningId(0);
                }
            }
            
            setLottery(lottery1);
        } catch (err) {
            console.error("Error: ", err);
        }
    };

    const initMaster = async() => {
        try {
            const tx = await program?.methods.initialize()
                .accounts({
                    master: getMasterAddress(),
                    payer: wallet?.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc()

                await confirmTx(tx, connection);

        } catch (err) {
            console.error("Error:", err);
        }
    }
    
    const createLottery = async () => {
        console.log("Action: Create Lottery")
        try {
            const tx = await program?.methods.createLottery(
                new BN(1).mul(new BN(LAMPORTS_PER_SOL))
            )
            .accounts({
                lottery: getLotteryAddress(lotteryId + 1),
                master: masterAddress as PublicKey,
                authority: wallet?.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

            await confirmTx(tx, connection);
            updateState();
            toast.success("Lottery Created!");

        } catch (err) {
            console.error("Error: ", err);
        }
    }

    const getPot = async () => {
        const pot = getTotalPrize(lottery);
        setLotteryPot(pot);
    }

    const buyTicket = async () => {
        console.log("Action: Buy Ticket")
        try{
            if(LotteryAddress && lottery?.lastTicketId !== undefined)
            {
                const txHash = await program?.methods
                .buyTicket(lotteryId)
                .accounts({
                    lottery: LotteryAddress,
                    ticket: await getTicketAddress(
                        LotteryAddress, lottery?.lastTicketId + 1
                    ),
                    buyer: wallet?.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

                await confirmTx(txHash, connection);
                toast.success("Bought a Ticket!");
            }else {
                console.log("LotteryAddress or last_ticket_id does not exist");
            }
            
        } catch (err) {
            toast.error("Error occurred while buying a ticket");
        }
    }

    const pickWinner = async () => {
        console.log("Action: Pick Winner")
        try{
            if (!lottery || !LotteryAddress) {
                console.log("Lottery or LotteryAddress is not available.");
                return null;
            }
            const txHash = await program?.methods.pickWinner(lotteryId)
                .accounts({
                    lottery: LotteryAddress,
                    authority: wallet?.publicKey,
                })
                .rpc();

            await confirmTx(txHash, connection);

            updateState();
            toast.success("Picked a winner!");

        } catch(err) {
            toast.error("Error occurred while picking a winner");
        }
    }

    const getHistory = async () => {
        if(!lotteryId)
            return

        const history = []

        for (const i in new Array(lotteryId).fill(null)) {
            const id = lotteryId - parseInt(i)
            if(!id)
                break
            
            const LotteryAddress = await getLotteryAddress(id)
            const lottery = await program?.account.lottery.fetch(LotteryAddress);
            
            if(lottery){
                
                const winnerId = lottery.winnerId;
                if(winnerId){
                    const ticketAddress = await getTicketAddress(LotteryAddress, winnerId);
                    const ticket = await program?.account.ticket.fetch(ticketAddress);

                    if(!ticket)
                        return;
                    history.push({
                        lotteryId: id,
                        winnerId,
                        winnerAddress: ticket.authority,
                        prize: getTotalPrize(lottery),
                    })
                }
            }

        }
        setLotteryHistory(history);
    }

    const claimPrize = async () => {
        console.log("Action: Claim Prize");
        try {
            if (!lottery || !LotteryAddress) {
                console.log("Lottery or LotteryAddress is not available.");
                return null;
            }
            const txHash = await program?.methods.claimPrize(lotteryId, userWinningId)
                .accounts({
                    lottery: LotteryAddress,
                    ticket: await getTicketAddress(LotteryAddress, userWinningId),
                    authority: wallet?.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc()

                await confirmTx(txHash, connection);

                updateState();

                toast.success("Claim the prize complete!");

        } catch (err) {
            toast.error("Error occurred while claim prize");
        }
    }

    return (
        <AppContext.Provider
            value={{
                connected,
                publicKey: publicKey ? publicKey.toBase58() : null,
                program,
                isMasterInitialized: initialized,
                lotteryId,
                lotteryPot,
                isLotteryAuthority: wallet && lottery && wallet.publicKey.equals(lottery.authority),
                isFinished: !!(lottery && lottery.winnerId),
                canClaim,
                lotteryHistory,
                initMaster,
                createLottery,
                buyTicket,
                pickWinner,
                claimPrize,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};



// Custom hook to use the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
