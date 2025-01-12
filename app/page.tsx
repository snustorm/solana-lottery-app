import LotteryCard from '@/app/components/LotteryCard';
import LotteryHistory from '@/app/components/Table';


export default function Home() {
  return (
    <div className="flex flex-col items-center  min-h-screen sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className=" w-full max-w-7xl flex flex-col items-center gap-4 text-center">

        <LotteryCard />

        {/* Lottery History Table */}
        <LotteryHistory />
        
      </main>
    </div>
  );
}
