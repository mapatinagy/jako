const Imprint = () => {
  return (
    <div className="max-w-3xl mx-auto prose">
      <h1 className="text-3xl font-bold mb-8">Imprint</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
        <p>
          Fishing Shop Ltd.<br />
          123 Fishing Street<br />
          Fishtown, FT 12345<br />
          Hungary
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p>
          Phone: +1 234 567 890<br />
          Email: info@fishingshop.com<br />
          Website: www.fishingshop.com
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Legal Information</h2>
        <p>
          Registration Number: 12345678<br />
          VAT ID: HU12345678<br />
          Commercial Register: Fishtown District Court
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Responsible for Content</h2>
        <p>
          John Doe<br />
          Managing Director<br />
          Fishing Shop Ltd.
        </p>
      </section>
    </div>
  );
};

export default Imprint; 