import { Dropdown } from '@//components/dropdown/dropdown';
import { StatisticCardStar } from '@//components/statisticCardStar/statisticCardStar';
import template from './surveyStatisticPage.hbs';
import { AppSurveyRequests } from '@modules/ajax';

interface AnswerProps {
  id: string;
  value: number; // Выбирается в зависимости от типа
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
  async render(): Promise<void> {
    try {
      const responses = await AppSurveyRequests.GetStats();
      this.props = transformBackendData(responses);
    } catch (error) {
      console.error(error);
    }

    if (!template) {
      throw new Error('Error: profile page template not found');
    }
    try {
      // Генерируем HTML
      const html = template();
      this.parent.insertAdjacentHTML('beforeend', html);

      // Заполняем
      const surveyContainer = this.self.querySelector('.survey-container') as HTMLElement;
      this.props.surveysProps.forEach((surveyProps) => {
        const dropdownComponent = new Dropdown(surveyContainer, {
          id: surveyProps.id,
          text: surveyProps.title,
        });
        dropdownComponent.render();
        this.components.surveyDropdown.push(dropdownComponent);

        // Рендерим карточки статистики внутри дропдауна
        const dropdownBodyElement = dropdownComponent.self.querySelector(
          '.dropdown__body',
        ) as HTMLElement;
        surveyProps.questionsProps.forEach((questionProps) => {
          const dropdownStatisticCardStarComponent = new Dropdown(dropdownBodyElement, {
            id: `question-${questionProps.id}__dropdown`,
            text: questionProps.title,
          });
          dropdownStatisticCardStarComponent.render();
          this.components.questionDropdown.push(dropdownStatisticCardStarComponent);

          const dropdownStatisticCardStarBodyElement =
            dropdownStatisticCardStarComponent.self.querySelector('.dropdown__body') as HTMLElement;

          // Вычисляем totalAmount (количество записей)
          const totalAmount = questionProps.answersProps.length;

          // Вычисляем average (сумма всех value / totalAmount)
          const sumValues = questionProps.answersProps.reduce(
            (sum, answer) => sum + answer.value,
            0,
          );
          const average = sumValues / totalAmount;

          // Формируем массив answers
          const answers = questionProps.answersProps.map((answer) => {
            // Подсчитываем количество записей с тем же value
            const amount = questionProps.answersProps.filter(
              (a) => a.value === answer.value,
            ).length;
            return {
              value: String(answer.value),
              amount: amount, // Количество записей с тем же value
            };
          });

          const statisticCardStarComponent = new StatisticCardStar(
            dropdownStatisticCardStarBodyElement,
            {
              id: `statistic-card-${questionProps.id}`,
              average: average,
              amount: totalAmount,
              answers: answers,
            },
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

function transformBackendData(backendData: any): SurveyStatisticPageProps {
  // Группируем данные по QuestionId
  const groupedByQuestion = backendData.Stats.reduce((acc: Record<string, any>, stat: any) => {
    if (!acc[stat.QuestionId]) {
      acc[stat.QuestionId] = {
        id: stat.QuestionId,
        title: stat.QuestionTitle,
        type: stat.QuestionType,
        answersProps: [],
      };
    }
    acc[stat.QuestionId].answersProps.push({
      id: stat.Label,
      value: stat.Value,
    });
    return acc;
  }, {});

  // Преобразуем группированные данные в массив вопросов
  const questionsProps: QuestionProps[] = Object.values(groupedByQuestion);

  // Создаем объект SurveyProps
  const surveyProps: SurveyProps = {
    id: 'survey1', // ID опроса (можно задать динамически, если есть)
    title: 'Опрос о качестве сервиса', // Заголовок опроса (можно задать динамически)
    questionsProps: questionsProps,
  };

  // Формируем финальную структуру
  const surveyStatisticPageProps: SurveyStatisticPageProps = {
    surveysProps: [surveyProps],
  };

  return surveyStatisticPageProps;
}
