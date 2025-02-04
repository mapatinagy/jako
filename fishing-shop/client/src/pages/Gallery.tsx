const Gallery = () => {
  // This will be replaced with real data from the backend later
  const images = [
    { id: 1, title: 'Fishing Rod', category: 'Equipment' },
    { id: 2, title: 'Pet Food', category: 'Animal Feed' },
    { id: 3, title: 'Garden Plants', category: 'Plants' },
    // Add more items as needed
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Our Gallery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {/* Image placeholder - will be replaced with real images */}
              <div className="flex items-center justify-center h-48 bg-gray-200">
                <span className="text-gray-400">{image.title}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{image.title}</h3>
              <p className="text-sm text-gray-600">{image.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery; 