const VIA_CEP_BASE_URL = "https://viacep.com.br/ws";

export const getAddressByCep = async (cep) => {
    const response = await fetch(`${VIA_CEP_BASE_URL}/${cep}/json/`);
    if (!response.ok) throw new Error(`ViaCEP HTTP ${response.status}`);
    return response.json();
};
