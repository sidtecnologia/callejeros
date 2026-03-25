import { useState, useMemo, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import SuccessModal from './components/SuccessModal';
import BusinessModal from './components/BusinessModal';
import InstallPrompt from './components/InstallPrompt';
import BannerCarousel from './components/BannerCarousel';
import Toasts from './components/Toast';
import { Loader2 } from 'lucide-react';

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const Categories = ({ categories, selected, onSelect }) => (
  <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide">
    <button
      onClick={() => onSelect('Todo')}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm transition-all ${selected === 'Todo' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200'}`}
    >
      <span className="font-semibold">Todo</span>
    </button>
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm transition-all ${selected === cat ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200'}`}
      >
        <span className="font-semibold whitespace-nowrap">{cat}</span>
      </button>
    ))}
  </div>
);

const StoreContent = () => {
  const { products, loading, error } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todo');
  const [activeProduct, setActiveProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('p');

      if (productId) {
        const targetProduct = products.find(p => String(p.id) === String(productId));
        if (targetProduct) {
          setActiveProduct(targetProduct);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [products]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todo' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const featuredBase = useMemo(() => products.filter(p => p.featured), [products]);
  const [featured, setFeatured] = useState(() => shuffleArray(featuredBase));

  useEffect(() => {
    setFeatured(shuffleArray(featuredBase));
  }, [featuredBase]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'Todo') {
      setFeatured(shuffleArray(featuredBase));
    }
  };

  const offers = useMemo(() => products.filter(p => p.isOffer), [products]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-primary">
      <Loader2 className="animate-spin w-12 h-12" />
      <p className="font-semibold animate-pulse">Cargando menú...</p>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;

  const showSections = searchTerm === '' && selectedCategory === 'Todo';

  const banners = [
    'https://njyzsddgysrvatnkgcyl.supabase.co/storage/v1/object/public/images/baner/baner1.webp',
    'https://njyzsddgysrvatnkgcyl.supabase.co/storage/v1/object/public/images/baner/baner2.webp',
    'https://njyzsddgysrvatnkgcyl.supabase.co/storage/v1/object/public/images/baner/baner3.webp',
    'https://njyzsddgysrvatnkgcyl.supabase.co/storage/v1/object/public/images/baner/baner4.webp',
    'https://njyzsddgysrvatnkgcyl.supabase.co/storage/v1/object/public/images/baner/baner5.webp'
  ];

  return (
    <div className="min-h-screen pb-20">
      <Navbar onSearch={setSearchTerm} onOpenCart={() => setIsCartOpen(true)} />

      <main className="max-w-6xl mx-auto px-3 py-4">
        <BannerCarousel images={banners} speed={48} />

        <Categories
          categories={categories}
          selected={selectedCategory}
          onSelect={handleSelectCategory}
        />

        <div className="mt-4">
          {showSections ? (
            <>
              {featured.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    Destacados
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {featured.map(p => (
                      <ProductCard key={p.id} product={p} onClick={setActiveProduct} />
                    ))}
                  </div>
                </section>
              )}

              {offers.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-yellow-400 rounded-full"></span>
                    Ofertas
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {offers.map(p => (
                      <ProductCard key={p.id} product={p} onClick={setActiveProduct} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section>
              <h2 className="text-lg font-bold mb-4 text-gray-700">Resultados ({filteredProducts.length})</h2>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No se encontraron productos.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map(p => (
                    <ProductCard key={p.id} product={p} onClick={setActiveProduct} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <footer className="bg-white border-t mt-8 py-6 text-center text-gray-500 text-xs">
        <p>&copy; {new Date().getFullYear()} TECSIN. Todos los derechos reservados.</p>
      </footer>

      <ProductModal
        product={activeProduct}
        isOpen={!!activeProduct}
        onClose={() => setActiveProduct(null)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(details) => setSuccessOrder(details)}
      />

      <SuccessModal
        isOpen={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        orderDetails={successOrder}
      />

      <BusinessModal />
      <InstallPrompt />
      <Toasts />
    </div>
  );
};

const App = () => (
  <ShopProvider>
    <StoreContent />
  </ShopProvider>
);

export default App;