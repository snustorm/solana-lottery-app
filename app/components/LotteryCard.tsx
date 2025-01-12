'use client'

import { useAppContext } from "../context/context";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { WalletButton } from "@/app/components/wallet/AppWalletProvider";
import { shortenPk } from "./utils/helper";

export default function LotteryCard() {

    const {
        connected,
        isMasterInitialized,
        lotteryId,
        lotteryPot,
        isLotteryAuthority,
        isFinished,
        canClaim,
        lotteryHistory,
        initMaster,
        createLottery,
        buyTicket,
        pickWinner,
        claimPrize,
    } = useAppContext();
    
    return (
      <div className="border border-gray-300 p-6 rounded-lg shadow-md w-full max-w-md">
        {!isMasterInitialized ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Lottery #</h2>
            { connected ? (
                <button
                className="bg-white text-purple-700 px-4 py-2 rounded-lg border border-solid border-purple-700 hover:bg-purple-100"
                onClick={initMaster}
                >
                Initialize Master
                </button> ) : (
                    <WalletButton />
                )  
            }           
          </>
        ) : (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4">Lottery <span className="text-purple-700">#{lotteryId}</span></h2>
  
            {/* Pot Information */}
            <p className="text-lg mb-2">Pot: <span className="font-bold text-purple-700">{lotteryPot} SOL</span> </p>

            <div className="flex items-center justify-center mb-2">
                {/* Left Trophy Icon */}
                <FontAwesomeIcon
                icon={faTrophy}
                style={{ color: "#FFD43B" }}
                size="2x"
                width={25}
                />

                {/* Recent Winner Text */}
                <p className="text-lg mx-4">Recent Winner</p>

                {/* Right Trophy Icon */}
                <FontAwesomeIcon
                icon={faTrophy}
                style={{ color: "#FFD43B" }}
                size="2x"
                width={25}
                />
            </div>

            <p className="text-md mb-4">
              {lotteryHistory?.length &&
              shortenPk(
                lotteryHistory[lotteryHistory.length - 1].winnerAddress.toBase58()
              )}
            </p>
 
            {/* Enter Button */}
            { connected && !isFinished && (
                    <button
                    className="bg-white text-purple-700 px-4 py-2 rounded-lg border border-solid border-purple-700 hover:bg-purple-100"
                    onClick={buyTicket}
                    >
                         Bet A Prize
                    </button>
            )}

            {/* Create Lottery Button (Separate Block) */}
            {connected && isLotteryAuthority && !isFinished && (
                    <div className="mt-6">
                        <button
                            className="bg-white text-purple-700 px-4 py-2 rounded-lg border border-solid border-purple-700 hover:bg-purple-100"
                            onClick={pickWinner}
                        >
                            Pick Winner
                        </button>
                    </div>
            )}

            {/* Create Lottery Button (Separate Block) */}
            {connected && canClaim && (
                    <div className="mt-6">
                        <button
                        className="bg-white text-purple-700 px-4 py-2 rounded-lg border border-solid border-purple-700 hover:bg-purple-100"
                        onClick={claimPrize}
                        >
                        Claim Prize
                    </button>
                    </div>
            )}


            {/* Create Lottery Button (Separate Block) */}
            {connected && (
                    <div className="mt-6">
                        <button
                        className="bg-white text-purple-700 px-4 py-2 rounded-lg border border-solid border-purple-700 hover:bg-purple-100"
                        onClick={createLottery}
                        >
                        Create Lottery
                    </button>
                    </div>
            )}

          </div>
        )}
      </div>
    );
  }