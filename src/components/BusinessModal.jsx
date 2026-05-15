import { MapPin, Phone, Clock } from 'lucide-react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';

const BusinessModal = () => {
  const { isBusinessModalOpen, setBusinessModalOpen, businessConfig } = useShop();
  const BC = businessConfig;

  return (
    <Modal
      isOpen={isBusinessModalOpen}
      onClose={() => setBusinessModalOpen(false)}
      title="Información del Negocio"
    >
      <div className="text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden shadow-lg">
          <img src="/img/favicon.png" alt="Logo" className="w-full h-full object-cover" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">{BC.name}</h2>
          <p className="text-gray-500">{BC.description}</p>
        </div>

        <div className="space-y-4 text-left bg-gray-50 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <MapPin className="text-primary mt-1" size={20} />
            <div>
              <p className="font-semibold">Dirección</p>
              <a href={BC.mapsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                {BC.address}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="text-primary mt-1" size={20} />
            <div>
              <p className="font-semibold">Horario</p>
              <p className="text-gray-600 text-sm">{BC.schedule.label}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="text-primary mt-1" size={20} />
            <div>
              <p className="font-semibold">Contacto</p>
              <a href={`tel:${BC.phoneRaw}`} className="text-gray-600 hover:text-primary text-sm">
                {BC.phone}
              </a>
            </div>
          </div>
        </div>

        <button
          onClick={() => setBusinessModalOpen(false)}
          className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
};

export default BusinessModal;