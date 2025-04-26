import { AppSurveyRequests } from '@modules/ajax';
import { Button } from '@components/button/button';
import Slider from '@components/slider/slider';
import template from './CSATForm.hbs';
import CSATQuestion from '@components/CSATquestion/CSATQuestion.hbs';
import './../../../index.scss';

/**
 * Форма с вопросами для клиентов
 */
class CSATForm {
  /**
   * Конструктор класса
   */
  constructor() {
    this.questions = { defaultQuestions: [], focusQuestions: {} };
    this.formData = [];
  }

  /**
   * Получение вопросов
   */
  async getData() {
    try {
      const data = await AppSurveyRequests.Get();

      const defaultQuestions = data.filter((item) => !item.focus_id);

      const focusQuestions = data.reduce((acc, item) => {
        if (item.focus_id) {
          if (!acc[item.focus_id]) {
            acc[item.focus_id] = [];
          }
          acc[item.focus_id].push(item);
        }
        return acc;
      }, {});

      this.questions.defaultQuestions = defaultQuestions;
      this.questions.focusQuestions = focusQuestions;
    } catch (error) {
      console.error('Ошибка при получении вопросов для CSAT формы:', error);
    }
  }

  /**
   * Создание элементов вопросов
   * @param {Array<object>} items - информация о вопросах
   * @returns {Array<object>} - элементы с вопросами
   */
  getSliderChildren(items) {
    const elements = [];

    items.forEach((item) => {
      const div = document.createElement('div');
      div.innerHTML = CSATQuestion(item);

      elements.push({ content: div.innerHTML, ...item });
    });

    return elements;
  }

  /**
   * Наполнение фрейма вопросами
   * @param {HTMLIFrameElement} frame - iframe элемент
   * @param {object} params - параметры
   * @param {Array<HTMLElement>} params.questionElements - элементы опросника
   * @param {HTMLElement} params.focusElement - целевой элемент
   */
  setFrame(frame, { questionElements, focusElement }) {
    const cssLink = document.createElement('link');
    cssLink.href = 'index.scss';
    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    cssLink.id = 'frame-stylesheet';

    frame.srcdoc = template();
    frame.style.opacity = 0;
    frame.style.bottom = '-60px';
    frame.style.pointerEvents = 'all';

    frame.onload = () => {
      frame.contentWindow.document.head.appendChild(cssLink);

      const frameStylesheet = frame.contentDocument.querySelector('#frame-stylesheet');

      const form = frame.contentDocument.querySelector('.csat-form');

      frameStylesheet.onload = async () => {
        setTimeout(() => {
          frame.style.opacity = 1;

          if (focusElement) {
            frame.style.bottom = 0;

            form.style.zIndex = 101;

            focusElement.parentElement.style.boxShadow = 'rgb(0 0 0 / 28%) 0px 0px 30px 15px';

            form.style.left = '10px';
            form.style.bottom = '10px';
            return;
          }

          frame.style.bottom = '-20px';
        }, 200);
      };

      const slider = new Slider(form, {
        frame,
        formData: this.formData,
        children: questionElements,
        focusId: focusElement?.id,
      });

      slider.render();

      const action = document.createElement('div');
      action.className = 'question__navigation-buttons';
      form.appendChild(action);

      const backButton = new Button(action, {
        id: 'form-back-button',
        onSubmit: () => slider.prev(),
      });

      backButton.render();

      const prevBtn = form.querySelector('#form-back-button');
      prevBtn.style.opacity = 0;

      const nextButton = new Button(action, {
        id: 'form-next-button',
        onSubmit: async () => {
          if (slider.active === questionElements.length - 1) {
            try {
              // await api.sendCSATQuestions(slider.formData);

              frame.style.opacity = 0;
              frame.style.bottom = '-60px';
              frame.style.pointerEvents = 'none';

              setTimeout(() => {
                if (focusElement) {
                  frame.remove();
                } else {
                  form.remove();
                }
              }, 300);

              if (focusElement) {
                focusElement.parentElement.style.boxShadow = '';
              }

              return;
            } catch (error) {
              console.error(
                'Ошибка при отправке CSAT вопросов или переходе к следующему слайду:',
                error,
              );
            }
          }

          slider.next();
        },
      });

      nextButton.render();

      const closeButton = new Button(form, {
        id: 'csat-close-button',
        style: 'clear',
        icon: 'close',
        onClick: () => {
          if (focusElement) {
            focusElement.parentElement.style.boxShadow = '';
          }

          frame.style.opacity = 0;
          frame.style.bottom = '-60px';
          frame.style.pointerEvents = 'none';
          setTimeout(() => {
            if (focusElement) {
              frame.remove();
            }

            form.remove();
          }, 300);
        },
      });

      closeButton.render();
    };
  }

  /**
   * Рендеринг компонента
   */
  async render() {
    await this.getData();

    const defaultChildren = this.getSliderChildren(this.questions.defaultQuestions);

    const frame = document.querySelector('iframe');

    if (defaultChildren.length > 0) {
      this.setFrame(frame, { questionElements: defaultChildren, focus: false });
    }

    /*        Object.entries(this.questions.focusQuestions).forEach(([focusId, questions]) => {
            if (!questions) {
                return;
            }

            const newFrame = document.createElement('iframe');
            newFrame.style.opacity = 0;

            const focusElement = document.getElementById(focusId);
            focusElement.appendChild(newFrame);

            if (!focusElement) return;

            const focusChildren = this.getSliderChildren(questions);

            const focusFrame = focusElement.querySelector('iframe');

            if (focusChildren.length > 0) {
                this.setFrame(focusFrame, { questionElements: focusChildren, focusElement });
            }
        });*/
  }
}

export default new CSATForm();
