import { useState } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const Navbar = ({ onSearch, onOpenCart }) => {
  const { cart, setBusinessModalOpen } = useShop();
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setBusinessModalOpen(true)}
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden group-hover:scale-105 transition-transform">
            <img src="/img/favicon.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">
            Comida Rápida
          </h1>
        </div>

        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Buscar..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        <button 
          onClick={onOpenCart}
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ShoppingBag className="text-gray-700" size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;