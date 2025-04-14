import { SuggestsContainer } from '@components/suggestsContainer/suggestsContainer';
import { Button } from '@components/button/button';
import template from './mapModal.hbs';
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapControls,
  YMapListener,
  YMapMarker,
  YMapGeolocationControl,
  YMapZoomControl,
} from '@//lib/ymaps';

import {
  geoCoderRequest,
  geoCoderRequestByCoords,
  geoSuggestRequest,
} from '@modules/ymapsRequests';
import debounce from '@modules/debounce';
import { toasts } from '@modules/toasts';
import mapLocationImg from '@assets/map_location.png';

/**
 * Класс, представляющий модальное окно карты.
 */
export default class MapModal {
  private suggestsContainer: SuggestsContainer;
  private submitBtn: Button;
  private readonly onSubmit: (address: string) => void;
  private readonly closeEventHandler: (event: Event) => void;
  private readonly debouncedOnInput: (value: string) => void;
  private map: any;
  private marker: any;
  private markerElement: HTMLImageElement;
  private controls: any;

  /**
   * Конструктор класса
   * @constructor
   */
  constructor(onSubmit: (address: string) => void) {
    this.onSubmit = onSubmit;
    this.debouncedOnInput = debounce(this.onInput.bind(this), 250);
  }

  /**
   * Получение HTML элемента формы
   * @returns {HTMLElement | null}
   */
  private get self(): HTMLElement | null {
    return document.querySelector('.map_modal');
  }

  private get input(): HTMLInputElement | null {
    return document.getElementById('map_modal__input') as HTMLInputElement;
  }

  get closeElem(): HTMLElement | null {
    return document.querySelector('.map_modal__close_icon');
  }

  /**
   * Рендеринг модального окна
   */
  render() {
    const modalHTML = template();

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const searchContainer = document.querySelector<HTMLElement>('.map_modal__search_container');

    this.suggestsContainer = new SuggestsContainer(
      searchContainer,
      this.handleSuggestClick.bind(this),
    );
    this.suggestsContainer.render();

    const formLineSearch = document.getElementById('form__line_search');

    this.submitBtn = new Button(formLineSearch, {
      id: 'form__line__search_button',
      text: 'ОК',
      disabled: true,
      style: 'dark big',
      onSubmit: async () => {
        const newAddress = this.input.value;
        this.submitBtn.disable();
        this.onSubmit(newAddress);
      },
    });

    this.submitBtn.render();
    document.body.style.overflow = 'hidden';

    if (this.input) {
      this.input.addEventListener('input', (event) =>
        this.debouncedOnInput((event.target as HTMLInputElement).value),
      );
      this.input.addEventListener('blur', this.onBlur.bind(this));
      this.input.addEventListener('focus', this.immitateInput.bind(this));
    }

    this.createMap();

    this.markerElement = document.createElement('img');
    this.markerElement.src = mapLocationImg;
    this.markerElement.className = 'map_modal__marker';
  }

  private createMap() {
    this.map = new YMap(document.getElementById('map'), {
      location: {
        center: [37.588144, 55.733842],
        zoom: 10,
      },
    });

    this.map.addChild(new YMapDefaultSchemeLayer({}));
    this.map.addChild(new YMapDefaultFeaturesLayer({ zIndex: 1800 }));

    this.controls = new YMapControls({
      position: 'left',
      orientation: 'vertical',
    });

    this.controls.addChild(
      new YMapGeolocationControl({
        onGeolocatePosition: async (position) => {
          await this.handleGeoCoderRequest([position[0], position[1]]);
        },
        onGeolocateError: () => {
          console.error('Geolocation failed');
        },
        source: 'geolocation-source',
        easing: 'linear',
        duration: 1000,
        zoom: 18,
        positionOptions: {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      }),
    );

    this.controls.addChild(
      new YMapZoomControl({
        easing: 'linear',
      }),
    );

    this.map.addChild(this.controls);

    const mapListener = new YMapListener({
      layer: 'any',
      onClick: this.clickCallback.bind(this),
    });

    this.map.addChild(mapListener);

    document.querySelector('.ymaps3x0--map-copyrights')?.remove();
  }

  private async clickCallback(object: any, event: { coordinates: [number, number] }) {
    if (this.map.zoom < 15) {
      return;
    }

    const [longitude, latitude] = event.coordinates;
    await this.handleGeoCoderRequest([longitude, latitude]);
  }

  private async handleGeoCoderRequest([longitude, latitude]: [number, number]) {
    const geoCoderResponse = await geoCoderRequestByCoords(longitude, latitude);
    if (geoCoderResponse.status !== 200) {
      console.error(`Ошибка API: ${geoCoderResponse.status}`);
      return;
    }

    if (!geoCoderResponse.result) {
      toasts.error('Поблизости ничего нет...');
      return;
    }

    const address = geoCoderResponse.result.metaDataProperty.GeocoderMetaData;
    this.input.value = address.text.split(', ').slice(1).join(', ');

    this.checkFinalAddresss([address.kind]);

    this.addNewMarker([longitude, latitude]);
  }

  private immitateInput() {
    const event = new Event('input', { bubbles: true });
    this.input.dispatchEvent(event);
  }

  private async handleSuggestClick(address: string, tags: string[], uri: string): Promise<void> {
    this.input.value = address;

    this.checkFinalAddresss(tags);

    setTimeout(() => this.suggestsContainer.clear(), 100);
    const geoCoderResponse = await geoCoderRequest(uri);
    if (geoCoderResponse.status !== 200 || !geoCoderResponse.result) {
      console.error(`Ошибка API: ${geoCoderResponse.status}`);
      return;
    }

    const point = geoCoderResponse.result.Point.pos.split(' ').map(Number);
    const [lon, lat] = point;

    this.map.setLocation({
      center: point,
      zoom: 18,
      duration: 100,
      easing: 'ease-in-out',
    });

    this.addNewMarker([lon, lat]);
  }

  private checkFinalAddresss(tags: string[]) {
    const finalTags = ['house', 'business', 'office', 'hotel'];
    const isFinalAddress = tags.some((tag) => finalTags.includes(tag));

    if (!isFinalAddress) {
      this.input.focus();
      return;
    }

    this.submitBtn.enable();
  }

  private addNewMarker([lon, lat]: [number, number]): void {
    if (this.marker) {
      this.map.removeChild(this.marker);
    }

    this.marker = new YMapMarker(
      {
        coordinates: [lon, lat],
      },
      this.markerElement,
    );

    this.map.addChild(this.marker);
  }

  private async onInput(value: string) {
    this.suggestsContainer.clear();
    this.submitBtn.disable();

    if (!value) {
      this.map.setLocation({
        center: [37.588144, 55.733842],
        zoom: 10,
      });
      if (this.marker) {
        this.map.removeChild(this.marker);
      }
      return;
    }

    try {
      const suggestsResponse = await geoSuggestRequest(value);

      if (suggestsResponse.status !== 200) {
        console.error(`Ошибка API: ${suggestsResponse.status}`);
        return;
      }

      const suggests = Array.isArray(suggestsResponse.results) ? suggestsResponse.results : [];

      if (!suggests.length) {
        console.warn('Пустой массив результатов');
        return;
      }

      for (const suggest of suggests) {
        this.suggestsContainer.show(suggest);
      }
    } catch (error) {
      console.error('Ошибка запроса:', error);
    }
  }

  private onBlur() {
    setTimeout(() => {
      this.suggestsContainer.clear();
    }, 200);
  }

  remove(): void {
    document.body.style.overflow = '';

    if (this.input) {
      this.input.removeEventListener('input', (event) =>
        this.debouncedOnInput((event.target as HTMLInputElement).value),
      );
      this.input.removeEventListener('blur', this.onBlur.bind(this));
      this.input.removeEventListener('focus', this.immitateInput.bind(this));
    }

    if (this.submitBtn) {
      this.submitBtn.remove();
    }

    if (this.suggestsContainer) {
      this.suggestsContainer.clear();
    }

    if (this.map) {
      try {
        this.map.destroy();
      } catch (error) {
        console.error('Ошибка при уничтожении карты:', error);
      }
      this.map = null;
    }

    if (this.self) {
      this.self.removeEventListener('click', this.closeEventHandler);
      this.self.remove();
    }
  }
}
