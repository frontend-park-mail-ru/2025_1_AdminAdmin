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

interface GeoObject {
  metaDataProperty: {
    GeocoderMetaData: {
      precision: string;
      text: string;
      kind: string;
      Address: {
        country_code: string;
        formatted: string;
        postal_code?: string;
        Components: { kind: string; name: string }[];
      };
      AddressDetails: {
        Country: {
          AddressLine: string;
          CountryNameCode: string;
          CountryName: string;
          AdministrativeArea?: {
            AdministrativeAreaName: string;
            Locality?: {
              LocalityName: string;
              Thoroughfare?: {
                ThoroughfareName: string;
                Premise?: {
                  PremiseNumber: string;
                  PostalCode?: { PostalCodeNumber: string };
                };
              };
            };
          };
        };
      };
    };
  };
  name: string;
  description: string;
  boundedBy: {
    Envelope: {
      lowerCorner: string;
      upperCorner: string;
    };
  };
  uri: string;
  Point: { pos: string };
}

interface GeoCoderResponse {
  status: number;
  result?: GeoObject;
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
    return { status: 503, results: error.error };
  }
};

/**
 * Базовый метод запроса к API геокодера.
 * @param params Параметры запроса
 * @returns {Promise<GeoCoderResponse>}
 */
const geoCoderRequestBase = async (params: URLSearchParams): Promise<GeoCoderResponse> => {
  try {
    const response = await fetch(`${URLparams.geoCoder.BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);

    const data = await response.json();
    const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

    return {
      status: response.status,
      result: geoObject,
    };
  } catch (error) {
    return { status: 503, error: error.error };
  }
};

/**
 * Выполняет HTTP-запрос к API геокодера по URI.
 * @param uri URI-адрес
 * @returns {Promise<GeoCoderResponse>}
 */
export const geoCoderRequest = async (uri: string): Promise<GeoCoderResponse> => {
  const params = new URLSearchParams({
    apikey: URLparams.geoCoder.API_KEY.trim(),
    uri: uri,
    format: URLparams.geoCoder.format,
  });

  return geoCoderRequestBase(params);
};

/**
 * Выполняет HTTP-запрос к API геокодера по координатам.
 * @param longitude Долгота (ll[0])
 * @param latitude Широта (ll[1])
 * @returns {Promise<GeoCoderResponse>}
 */
export const geoCoderRequestByCoords = async (
  longitude: number,
  latitude: number,
): Promise<GeoCoderResponse> => {
  const params = new URLSearchParams({
    apikey: URLparams.geoCoder.API_KEY.trim(),
    geocode: `${longitude},${latitude}`,
    kind: 'house',
    lang: 'ru_RU',
    format: URLparams.geoCoder.format,
  });

  return geoCoderRequestBase(params);
};
