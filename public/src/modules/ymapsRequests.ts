const BASE_URL = 'https://suggest-maps.yandex.ru/v1/suggest';
const API_KEY = process.env.GEOSUGGEST_API_KEY || ''; // Убедимся, что API-ключ не undefined
const DEFAULT_PARAMS = {
  lang: 'ru',
  ll: '37.6173,55.7558',
  print_address: '1',
  org_address_kind: 'house',
  attrs: 'uri',
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
  uri?: string;
}

interface GeoSuggestResponse {
  status: number;
  results: I_Suggest[];
}

export type { GeoSuggestResponse, I_Suggest, Highlight, Address, Distance, Subtitle, Title };

/**
 * Выполняет HTTP-запрос к API геосаджеста.
 * @returns {Promise<GeoSuggestResponse>}
 * @param value
 */

export const geoSuggestRequest = async <T = any>(value: string): Promise<GeoSuggestResponse> => {
  const queryParams = new URLSearchParams({
    apikey: API_KEY.trim(), // Очищаем от лишних пробелов/символов
    text: value,
    ...DEFAULT_PARAMS, // Добавляем остальные параметры
  });

  const queryUrl = `${BASE_URL}?${queryParams.toString()}`; // Собираем URL вручную

  try {
    const response = await fetch(queryUrl.toString());
    const contentType = response.headers.get('Content-Type') || '';

    let body: any;
    try {
      if (contentType.includes('application/json')) {
        body = await response.json();
      }
    } catch {
      body = null;
    }

    return { status: response.status, results: body?.results };
  } catch (err) {
    return { status: 503, results: err.message };
  }
};
