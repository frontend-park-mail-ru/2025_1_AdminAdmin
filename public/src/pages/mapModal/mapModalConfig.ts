import { geoSuggestRequest } from '../../modules/ymapsRequests';
import { suggestsContainer } from '../../components/suggestsContainer/suggestsContainer';

export default {
  inputs: {
    searchInput: {
      id: 'form__line__search__input',
      placeholder: 'Введите улицу и дом',
      type: 'search',
      required: true,
      onInput: async (value: string) => {
        suggestsContainer.clear();
        if (!value) {
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
            console.log(suggest);
            suggestsContainer.show(suggest);
          }
        } catch (error) {
          console.error('Ошибка запроса:', error);
        }
      },
    },
  },
  buttons: {
    submitBtn: {
      id: 'form__line__search_button',
      text: 'ОК',
      disabled: true,
      style: 'dark big',
    },
  },
};
