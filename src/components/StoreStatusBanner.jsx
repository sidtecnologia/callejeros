import { Clock, Phone } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/businessConfig';

const StoreStatusBanner = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 mb-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-amber-800">
        <div className="bg-amber-100 p-2 rounded-full">
          <Clock size={20} />
        </div>
        <div>
          <p className="font-bold text-sm text-left">¡Abriremos Pronto!</p>
          <p className="text-xs text-left">
            Nuestro horario es de {BUSINESS_CONFIG.schedule.label}. Puedes ver nuestros productos si lo deseas.
          </p>
        </div>
      </div>
      <a 
        href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
        className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors w-full sm:w-auto justify-center"
      >
        <Phone size={16} />
        Llamar al negocio
      </a>
    </div>
  );
};

export default StoreStatusBanner;