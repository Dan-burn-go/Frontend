import Header from '../components/layout/Header';

const HotspotsPage = () => {
  return (
    <div className="flex flex-col w-full min-h-dvh bg-gray-50">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">Hotspots</h1>
      </div>
    </div>
  );
};

export default HotspotsPage;
