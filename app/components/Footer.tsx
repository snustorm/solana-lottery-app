export default function Footer() {
    return (
      <footer className="bg-white border-t border-gray-200 p-4 mt-10">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Solana Lottery Dapp. All rights reserved.</p>
        </div>
      </footer>
    );
  }