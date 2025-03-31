import { SuggestsContainer } from '../../components/suggestsContainer/suggestsContainer';
import { Button } from '../../components/button/button';
import template from './mapModal.hbs';
import { YMap, YMapDefaultSchemeLayer } from '../../lib/ymaps';
import { geoCoderRequest, geoSuggestRequest } from '../../modules/ymapsRequests';
import debounce from '../../modules/debounce';
import { YMapDefaultMarker } from '@yandex/ymaps3-default-ui-theme';

/**
 * Класс, представляющий модальное окно карты.
 */
export default class MapModal {
  private suggestsContainer: SuggestsContainer;
  private submitBtn: Button;
  private readonly closeEventHandler: (event: Event) => void;
  private readonly debouncedOnInput: (value: string) => void;
  private map: any;
  private marker: any;

  /**
   * Конструктор класса
   * @constructor
   */
  constructor() {
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

  get window(): HTMLElement | null {
    return document.querySelector('.map_modal__content');
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
      this.handleAddressSelect.bind(this),
    );
    this.suggestsContainer.render();

    const formLineSearch = document.getElementById('form__line_search');

    this.submitBtn = new Button(formLineSearch, {
      id: 'form__line__search_button',
      text: 'ОК',
      disabled: true,
      style: 'dark big',
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
  }

  private createMap() {
    this.map = new YMap(document.getElementById('map'), {
      location: {
        center: [37.588144, 55.733842],
        zoom: 10,
      },
    });

    this.map.addChild(new YMapDefaultSchemeLayer({}));
    this.map.addChild(new ymaps3.YMapDefaultFeaturesLayer({ zIndex: 1800 }));

    const mapListener = new ymaps3.YMapListener({
      layer: 'any',
      onClick: this.handleMapClick.bind(this),
    });

    this.map.addChild(mapListener);

    document.querySelector('.ymaps3x0--map-copyrights')?.remove();
  }

  private handleMapClick(event: { event: { coordinates: [number, number] } }) {
    console.log(event);
    if (!event || !event.event || !event.event.coordinates) return;
    const [lon, lat] = event.event.coordinates;

    if (this.marker) {
      this.map.removeChild(this.marker);
    }

    this.marker = new YMapDefaultMarker({
      coordinates: [lon, lat],
      color: 'red',
      iconName: 'checkpoint',
    });

    this.map.addChild(this.marker);
  }

  private immitateInput() {
    const event = new Event('input', { bubbles: true });
    this.input.dispatchEvent(event);
  }

  private async handleAddressSelect(address: string, tags: string[], uri: string): Promise<void> {
    this.input.value = address;

    const finalTags = ['house', 'business', 'office', 'hotel'];
    const isFinalAddress = tags.some((tag) => finalTags.includes(tag));

    if (!isFinalAddress) {
      this.input.focus();
      return;
    }

    setTimeout(() => this.suggestsContainer.clear(), 100);
    this.submitBtn.enable();
    const geoCoderResponse = await geoCoderRequest(uri);
    if (geoCoderResponse.status !== 200 || !geoCoderResponse.result) {
      console.error(`Ошибка API: ${geoCoderResponse.status}`);
      return;
    }

    const point = geoCoderResponse.result.split(' ').map(Number);
    const [lon, lat] = point;

    this.map.setLocation({
      center: point,
      zoom: 18,
      duration: 100,
      easing: 'ease-in-out',
    });

    if (this.marker) {
      this.map.removeChild(this.marker);
    }

    this.marker = new YMapDefaultMarker({
      coordinates: [lon, lat],
      color: 'red',
      iconName: 'checkpoint',
    });

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

      for (let suggest of suggests) {
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
    this.input.removeEventListener('input', (event) =>
      this.debouncedOnInput((event.target as HTMLInputElement).value),
    );
    this.input.removeEventListener('blur', this.onBlur.bind(this));
    this.input.removeEventListener('focus', this.immitateInput.bind(this));
    this.self.removeEventListener('click', this.closeEventHandler);
    this.submitBtn.remove();
    this.suggestsContainer.clear();
    this.map.destroy();
    this.self.remove();
  }
}
