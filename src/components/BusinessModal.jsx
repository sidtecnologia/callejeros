import { MapPin, Phone, Clock } from 'lucide-react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';

const DAYS = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
];

const formatTime = (time) => {
  if (!time || typeof time !== 'string') return '';

  const [hour, minute] = time.split(':').map(Number);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return time;
  }

  const suffix = hour >= 12 ? 'p. m.' : 'a. m.';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
};

const getSchedule = (schedule) => {
  const shifts = schedule?.shifts;

  if (!shifts) return [];

  if (Array.isArray(shifts)) {
    return [
      {
        key: 'legacy',
        label: 'Horario',
        shifts: shifts.filter(
          (shift) => shift?.open && shift?.close
        ),
      },
    ];
  }

  return DAYS.map((day) => ({
    ...day,
    shifts: Array.isArray(shifts[day.key])
      ? shifts[day.key].filter(
          (shift) => shift?.open && shift?.close
        )
      : [],
  }));
};

const BusinessModal = () => {
  const {
    isBusinessModalOpen,
    setBusinessModalOpen,
    businessConfig,
  } = useShop();

  const BC = businessConfig || {};
  const schedule = getSchedule(BC.schedule);

  return (
    <Modal
      isOpen={isBusinessModalOpen}
      onClose={() => setBusinessModalOpen(false)}
      title="Información del Negocio"
    >
      <div className="text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden shadow-lg">
          <img
            src="/img/favicon.png"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {BC.name}
          </h2>

          {BC.description && (
            <p className="text-gray-500 mt-1">
              {BC.description}
            </p>
          )}
        </div>

        <div className="space-y-4 text-left bg-gray-50 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <MapPin
              className="text-primary mt-1 flex-shrink-0"
              size={20}
            />

            <div className="min-w-0">
              <p className="font-semibold">Dirección</p>

              {BC.mapsUrl ? (
                <a
                  href={BC.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline text-sm break-words"
                >
                  {BC.address || 'Ver ubicación en el mapa'}
                </a>
              ) : (
                <p className="text-gray-600 text-sm">
                  {BC.address || 'Dirección no disponible'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock
              className="text-primary mt-1 flex-shrink-0"
              size={20}
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold mb-2">Horario de atención</p>

              {schedule.length > 0 ? (
                <div className="space-y-2">
                  {schedule.map((day) => (
                    <div
                      key={day.key}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span className="font-medium text-gray-700 min-w-[85px]">
                        {day.label}
                      </span>

                      <div className="flex-1 text-right">
                        {day.shifts.length > 0 ? (
                          <div className="space-y-0.5">
                            {day.shifts.map((shift, index) => (
                              <p
                                key={`${day.key}-${index}`}
                                className="text-gray-600"
                              >
                                {formatTime(shift.open)} –{' '}
                                {formatTime(shift.close)}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Cerrado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : BC.schedule?.label ? (
                <p className="text-gray-600 text-sm">
                  {BC.schedule.label}
                </p>
              ) : (
                <p className="text-gray-400 text-sm">
                  Horario no disponible
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone
              className="text-primary mt-1 flex-shrink-0"
              size={20}
            />

            <div>
              <p className="font-semibold">Contacto</p>

              {BC.phoneRaw || BC.phone ? (
                <a
                  href={`tel:${BC.phoneRaw || BC.phone}`}
                  className="text-gray-600 hover:text-primary text-sm"
                >
                  {BC.phone}
                </a>
              ) : (
                <p className="text-gray-400 text-sm">
                  No disponible
                </p>
              )}
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