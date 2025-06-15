
import Airdrop from '@/components/gamification/Airdrop';
import Header from '@/components/layout/Header';

const AirdropPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <Airdrop />
      </div>
    </div>
  );
};

export default AirdropPage;
