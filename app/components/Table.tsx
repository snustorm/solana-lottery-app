'use client'
import { useAppContext } from "../context/context";

export default function LotteryHistory() {

    const {
        lotteryHistory
    } = useAppContext();

    return (
      <div className="overflow-x-auto w-full max-w-3xl mt-6 rounded-lg">
        <table className="table-auto w-full text-left bg-white shadow-lg rounded-lg">
          <thead className="bg-purple-700 text-gray-200">
            <tr>
              <th className="px-4 py-2">Lottery</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Amount(SOL)</th>
            </tr>
          </thead>
          <tbody>
            {lotteryHistory.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-center" colSpan={4}>
                  No data available
                </td>
              </tr>
            ) : (
                lotteryHistory.map((lottery, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{lottery.lotteryId}</td>
                  <td className="border px-4 py-2">{lottery.winnerAddress.toBase58()}</td>
                  <td className="border px-4 py-2">{lottery.winnerId}</td>
                  <td className="border px-4 py-2">{lottery.prize}</td>
                </tr>

              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
  