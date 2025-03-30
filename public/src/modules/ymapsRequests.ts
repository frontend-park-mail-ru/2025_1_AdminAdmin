const URLparams = {
  geoSuggest: {
    BASE_URL: 'https://suggest-maps.yandex.ru/v1/suggest',
    API_KEY: process.env.GEOSUGGEST_API_KEY,
    DEFAULT_PARAMS: {
      lang: 'ru',
      ll: '37.6173,55.7558',
      print_address: '1',
      org_address_kind: 'house',
      attrs: 'uri',
    },
  },
  geoCoder: {
    BASE_URL: 'https://geocode-maps.yandex.ru/v1/',
    API_KEY: process.env.GEOCODER_API_KEY,
    format: 'json',
  },
};

interface Highlight {
  begin: number;
  end: number;
}

interface Title {
  text: string;
  hl?: Highlight[];
}

interface Subtitle {
  text: string;
}

interface Distance {
  text: string;
  value: number;
}

interface AddressComponent {
  name: string;
  kind: string[];
}

interface Address {
  formatted_address: string;
  component: AddressComponent[];
}

interface I_Suggest {
  title: Title;
  subtitle?: Subtitle;
  tags?: string[];
  distance?: Distance;
  address?: Address;
  uri: string;
}

interface GeoSuggestResponse {
  status: number;
  results: I_Suggest[];
}

interface GeoCoderResponse {
  status: number;
  result?: string;
  error?: string;
}

export type { GeoSuggestResponse, I_Suggest, Highlight, Address, Distance, Subtitle, Title };

/**
 * Выполняет HTTP-запрос к API геосаджеста.
 * @param value Запрос
 * @returns {Promise<GeoSuggestResponse>}
 */
export const geoSuggestRequest = async (value: string): Promise<GeoSuggestResponse> => {
  const params = new URLSearchParams({
    apikey: URLparams.geoSuggest.API_KEY.trim(),
    text: value,
    ...URLparams.geoSuggest.DEFAULT_PARAMS,
  });

  try {
    const response = await fetch(`${URLparams.geoSuggest.BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);

    const data = await response.json();
    return { status: response.status, results: data?.results || [] };
  } catch (error) {
    return { status: 503, results: error.message };
  }
};

/**
 * Выполняет HTTP-запрос к API геокодера.
 * @param uri
 * @returns {Promise<GeoCoderResponse>}
 */
export const geoCoderRequest = async (uri: string): Promise<GeoCoderResponse> => {
  const params = new URLSearchParams({
    apikey: URLparams.geoCoder.API_KEY.trim(),
    uri: uri,
    format: URLparams.geoCoder.format,
  });

  try {
    const response = await fetch(`${URLparams.geoCoder.BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);

    const data = await response.json();

    const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    const position = geoObject?.Point?.pos || null;

    return {
      status: response.status,
      result: position,
    };
  } catch (error) {
    return { status: 503, error: error.message };
  }
};
