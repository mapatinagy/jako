const Home = () => {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Fishing Shop</h1>
        <p className="text-xl text-gray-600">Your one-stop shop for fishing equipment, animal feed, and plants</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Fishing Equipment</h2>
          <p className="text-gray-600">Discover our wide range of high-quality fishing gear for both beginners and professionals.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Animal Feed</h2>
          <p className="text-gray-600">Premium nutrition for your pets and livestock, carefully selected for their well-being.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Plants</h2>
          <p className="text-gray-600">Beautiful and healthy plants to bring life to your garden and home.</p>
        </div>
      </section>
    </div>
  );
};

export default Home; 