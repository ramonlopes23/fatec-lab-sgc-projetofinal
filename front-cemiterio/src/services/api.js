import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const createFalecidoAndSep = async (falecidoData = {}, sepData = {}) => {

    const falPayload = { ...falecidoData };

    if (falPayload.residencia instanceof File) {
      falPayload.residenciaPreview = await fileToDataUrl(falPayload.residencia);
      delete falPayload.residencia;
    }

    let createdFalecido = null;

    if (falPayload.id) {
      try {
        const { data } = await api.get(`/falecidos/${falPayload.id}`);
        createdFalecido = data || null;
      } catch {
        const resp = await api.post("/falecidos", falPayload);
        createdFalecido = resp.data;
      }
      
    } else {
      const resp = await api.post("/falecidos", falPayload);
      createdFalecido = resp.data;
    }

    if(!createdFalecido || createdFalecido.id ===undefined){
        throw new Error("Falecido não foi criado corretamente; impossivel criar sepultamento")
}

    
    const sepPayload = { ...sepData, falecidoId: createdFalecido.id };
    const { data: createdSep } = await api.post("/sepultamentos", sepPayload);

    return { falecido: createdFalecido, sepultamento: createdSep };
};

export { fileToDataUrl };
export { createFalecidoAndSep };
export default api;