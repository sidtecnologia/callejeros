import { MapPin, Phone, Clock, Globe } from 'lucide-react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';

const BusinessModal = () => {
  const { isBusinessModalOpen, setBusinessModalOpen } = useShop();

  return (
    <Modal 
      isOpen={isBusinessModalOpen} 
      onClose={() => setBusinessModalOpen(false)} 
      title="Información del Negocio"
    >
      <div className="text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden shadow-lg">
           <img src="/img/favicon.png" alt="Logo Grande" className="w-full h-full object-cover" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Comida Rápida</h2>
          <p className="text-gray-500">La mejor comida de Bucaramanga.</p>
        </div>

        <div className="space-y-4 text-left bg-gray-50 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <MapPin className="text-primary mt-1" size={20} />
            <div>
              <p className="font-semibold">Dirección</p>
              <a href="https://maps.google.com/?q=Carrera+27+%23+10-50+Bucaramanga" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                Carrera 27 # 10-50, Bucaramanga, Santander
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="text-primary mt-1" size={20} />
            <div>
              <p className="font-semibold">Horario</p>
              <p className="text-gray-600">Lun - Dom: 17:00 - 23:00</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="text-primary mt-1" size={20} />
            <div>
              <p className="font-semibold">Contacto</p>
              <a href="tel:+573227671829" className="text-gray-600 hover:text-primary">+57 322 767 1829</a>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setBusinessModalOpen(false)}
          className="w-full py-3 rounded-xl bg-gray-200 font-semibold hover:bg-gray-300 transition"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default BusinessModal;