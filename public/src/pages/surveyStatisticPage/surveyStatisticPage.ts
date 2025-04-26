import { Dropdown } from '@//components/dropdown/dropdown';
import { StatisticCardStar } from '@//components/statisticCardStar/statisticCardStar';
import template from './surveyStatisticPage.hbs';

interface AnswerProps {
  id: string;
  value: number | string; // Выбирается в зависимости от типа
}

interface QuestionProps {
  id: string;
  title: string;
  type: string;
  answersProps: AnswerProps[];
}

interface SurveyProps {
  id: string;
  title: string;
  questionsProps: QuestionProps[];
}

interface SurveyStatisticPageProps {
  surveysProps: SurveyProps[];
}

export class SurveyStatisticPage {
  protected parent: HTMLElement;
  protected props: SurveyStatisticPageProps;
  protected components = {
    surveyDropdown: [] as Dropdown[],
    questionDropdown: [] as Dropdown[],
    statisticCardStar: [] as StatisticCardStar[],
  };

  /**
   * Создает экземпляр страницы статистики.
   * @constructor
   * @param props - Словарь данных для определения свойств страницы.
   */
  constructor(parent: HTMLElement, props: SurveyStatisticPageProps) {
    if (!parent) {
      throw new Error('SurveyStatisticPage: no parent!');
    }
    this.parent = parent;
    this.props = props;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.survey-statistic-page__body');
    if (!element) {
      throw new Error(`Error: can't find surveyStatisticPage`);
    }
    return element as HTMLElement;
  }

  /**
   * Рендерит страницу статистики.
   */
  render(): void {
    if (!template) {
      throw new Error('Error: profile page template not found');
    }
    try {
      // Генерируем HTML
      const html = template();
      this.parent.insertAdjacentHTML('beforeend', html);
      // Заполняем
      // Рендерим дропдауны для каждого опроса
      const surveyContainer = this.self.querySelector('survey-container') as HTMLElement;
      this.props.surveysProps.forEach((surveyProps) => {
        const dropdownComponent = new Dropdown(surveyContainer, {
          id: surveyProps.id,
          text: surveyProps.title,
        });
        dropdownComponent.render();
        this.components.surveyDropdown.push(dropdownComponent);
        // Рендерим карточки статистики внутри дропдауна
        const dropdownBodyElement = dropdownComponent.self.querySelector(
          'dropdown__body',
        ) as HTMLElement;
        surveyProps.questionsProps.forEach((questionProps) => {
          const dropdownStatisticCardStarComponent = new Dropdown(dropdownBodyElement, {
            id: `question-${questionProps.id}__dropdown`,
            text: questionProps.title,
          });
          dropdownStatisticCardStarComponent.render();
          this.components.questionDropdown.push(dropdownStatisticCardStarComponent);
          const dropdownStatisticCardStarBodyElement =
            dropdownStatisticCardStarComponent.self.querySelector('dropdown__body') as HTMLElement;
          const statisticCardStarComponent = new StatisticCardStar(
            dropdownStatisticCardStarBodyElement,
            questionProps.answersProps,
          );
          statisticCardStarComponent.render();
          this.components.statisticCardStar.push(statisticCardStarComponent);
        });
      });
    } catch (error) {
      console.error(error);
      console.error('Error rendering survey statistic page:', error);
    }
  }

  /**
   * Удаляет страницу со страницы.
   */
  remove(): void {
    const element = this.self;
    this.components.statisticCardStar.forEach((statisticCardStarComponent) =>
      statisticCardStarComponent.remove(),
    );
    this.components.questionDropdown.forEach((dropdownComponent) => dropdownComponent.remove());
    this.components.surveyDropdown.forEach((dropdownComponent) => dropdownComponent.remove());
    if (element) element.remove();
  }
}
