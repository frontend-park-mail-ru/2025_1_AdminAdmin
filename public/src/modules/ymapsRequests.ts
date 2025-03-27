const API_KEY = 'ce676c0d-0aa1-4e6b-af0b-d299e5fee694';

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
  const queryUrl = new URL(
    `https://suggest-maps.yandex.ru/v1/suggest?apikey=${API_KEY}&text=${value}&lang=ru&ll=37.6173,55.7558&print_address=1&org_address_kind=house&attrs=uri`,
  );

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
