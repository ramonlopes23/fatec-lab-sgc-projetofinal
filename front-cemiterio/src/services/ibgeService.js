const MUNICIPIOS_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";

export const getMunicipios = async () => {
    const response = await fetch(MUNICIPIOS_URL);
    if (!response.ok) throw new Error(`IBGE HTTP ${response.status}`);
    return response.json();
};
