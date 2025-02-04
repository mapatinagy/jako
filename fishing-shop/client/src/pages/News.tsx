const News = () => {
  // This will be replaced with real data from the backend later
  const news = [
    {
      id: 1,
      title: 'New Fishing Equipment Arrived',
      date: '2024-02-04',
      excerpt: 'Check out our latest collection of professional fishing gear...',
    },
    {
      id: 2,
      title: 'Spring Plants Sale',
      date: '2024-02-03',
      excerpt: 'Get ready for spring with our amazing selection of garden plants...',
    },
    {
      id: 3,
      title: 'Premium Pet Food Now Available',
      date: '2024-02-02',
      excerpt: 'We\'ve expanded our pet food selection with premium brands...',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Latest News</h1>
      
      <div className="space-y-6">
        {news.map((article) => (
          <article key={article.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{article.date}</p>
            <p className="text-gray-600">{article.excerpt}</p>
            <button className="mt-4 text-primary-600 hover:text-primary-700">
              Read more →
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default News; 