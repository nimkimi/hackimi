import IntroBanner from '@/components/IntroBanner';

export default function Home() {
  const dotenv = require('dotenv');
  dotenv.config();
  return (
    <div className="flex min-h-screen flex-col">
      <IntroBanner />
    </div>
  );
}
