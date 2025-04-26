import { AppSurveyRequests } from '@modules/ajax';
import { Button } from '@components/button/button';
import template from './CSATForm.hbs';
import './../../../index.scss';
import CSATQuestion from '@components/CSATquestion/CSATQuesion.js';

/**
 * Форма с вопросами для клиентов
 */
export default class CSATForm {
  questionElements = [];
  activeQuestion = 0;
  backButton = null;
  nextButton = null;
  /**
   * Конструктор класса
   */
  constructor(parent) {
    this.parent = parent;
    this.questions = [];
  }

  removeForm = () => {
    const form = this.parent.querySelector('.csat-form');

    form.style.opacity = 0;
    form.style.bottom = '-60px';
    form.style.pointerEvents = 'none';
    setTimeout(() => {
      form.remove();
    }, 300);
  };

  prev() {
    if (this.activeQuestion === 0) return;

    this.questionElements[this.activeQuestion].hide();

    this.activeQuestion--;

    if (this.activeQuestion === 0) {
      this.backButton.hide();
    } else {
      this.backButton.show();
    }

    if (this.activeQuestion === this.questionElements.length - 1) {
      this.nextButton.hide();
    } else {
      this.nextButton.show();
    }

    this.questionElements[this.activeQuestion].show();
  }

  next() {
    if (this.activeQuestion === this.questionElements.length - 1) {
      return;
    }

    this.questionElements[this.activeQuestion].hide();

    this.activeQuestion++;

    if (this.activeQuestion === this.questionElements.length - 1) {
      this.nextButton.hide();
    } else {
      this.nextButton.show();
    }

    if (this.activeQuestion === 0) {
      this.backButton.hide();
    } else {
      this.backButton.show();
    }

    this.questionElements[this.activeQuestion].show();
  }

  /**
   * Рендеринг компонента
   */
  async render() {
    this.questions = await AppSurveyRequests.CreateSurvey();

    this.parent.insertAdjacentHTML('beforeend', template());
    const closeButton = document.querySelector('.csat-form__close_icon');
    closeButton.addEventListener('click', this.removeForm);

    const action = this.parent.querySelector('.question__navigation-buttons');

    this.backButton = new Button(action, {
      id: 'form-back-button',
      text: 'Назад',
      onSubmit: () => this.prev(),
    });
    this.backButton.render();

    // Кнопка "Далее"
    this.nextButton = new Button(action, {
      id: 'form-next-button',
      text: 'Далее',
      onSubmit: async () => {
        this.next();
      },
    });

    this.nextButton.render();

    if (this.questions.length > 0) {
      const questionsContainer = this.parent.querySelector('.csat-form__questions');
      let i = 0;
      this.backButton.hide();
      for (const question of this.questions) {
        const questionElement = new CSATQuestion(questionsContainer, question);
        questionElement.render();
        if (i === this.activeQuestion) {
          questionElement.show();
        } else {
          questionElement.hide();
        }
        this.questionElements.push(questionElement);
        i++;
      }
    }
  }

  /**
   * Удаление формы CSAT
   */
  remove() {
    const form = this.parent.querySelector('.csat-form');
    if (!form) return;

    this.backButton.remove();
    this.nextButton.remove();

    for (const questionEl of this.questionElements) {
      questionEl.remove();
    }

    this.questionElements = [];

    setTimeout(() => {
      form.remove();
    }, 300);
  }
}
