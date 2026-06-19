export const BUSINESS_CONFIG_DEFAULTS = {
  name: "Mi Negocio",
  description: "",
  phone: "",
  phoneRaw: "",
  address: "",
  mapsUrl: "",
  whatsapp: "",
  nequi: { number: "", qrUrl: "" },
  delivery: { cost: 0 },
  banners: [],
  schedule: {
    label: "Lunes a Domingo: 8:00 am - 8:00 pm",
    shifts: [{ open: "08:00", close: "20:00" }],
    timezone: "America/Bogota",
  },
};