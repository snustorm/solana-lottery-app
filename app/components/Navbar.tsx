import Link from "next/link";
import { WalletButton } from "@/app/components/wallet/AppWalletProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
    return (
      <nav className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left Section: Dice Icon + Title */}
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faDice}
              className="text-lg"
            />
            <Link href="/" className="text-lg font-semibold">
              Solana Lottery Dapp
            </Link>
          </div>
  
          {/* Right Section: Links and Wallet Button */}
          <div className="space-x-4 flex items-center">
            <Link href="/" className="hover:text-gray-600">
              Home
            </Link>
            <Link href="/about" className="hover:text-gray-600">
              About
            </Link>
            <WalletButton />
          </div>
        </div>
      </nav>
    );
  }