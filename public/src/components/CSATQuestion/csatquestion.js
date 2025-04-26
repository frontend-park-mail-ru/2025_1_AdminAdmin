import { Button } from '@components/button/button';
import template from './csatquestion.hbs';
import { AppSurveyRequests } from '@modules/ajax';
import { toasts } from '@modules/toasts';

export default class CSATQuestion {
  question = null;
  ratingButtons = [];
  selectedButton = null;

  constructor(parent, question) {
    this.parent = parent;
    this.question = question;
  }

  render() {
    const html = template(this.question);
    this.parent.insertAdjacentHTML('beforeend', html);
    const ButtonsContainer = this.self.querySelector('.question__content__ratings');

    if (this.question.QuestionType === 'CSAT') {
      // Используем 5 смайликов
      const emojis = ['😡', '😕', '😐', '🙂', '😄'];
      emojis.forEach((emoji, index) => {
        const value = index + 1;
        const ratingButton = new Button(ButtonsContainer, {
          id: `ratingButton-q-${this.question.Id}-${value}`,
          text: emoji,
          onSubmit: async () => {
            try {
              await AppSurveyRequests.SendVote(this.question.Id, value);
              if (this.selectedButton !== null) {
                this.ratingButtons[this.selectedButton].button.self.style.backgroundColor = '';
                this.ratingButtons[this.selectedButton].button.self.style.color = '#D9D9D9';
              }

              ratingButton.self.style.backgroundColor = '#FF4D00';
              ratingButton.self.style.color = 'white';
              this.selectedButton = value - 1;
            } catch (error) {
              toasts.error(error.message);
            }
          },
        });

        ratingButton.render();
        this.ratingButtons.push({ button: ratingButton, value });
      });
    } else {
      // Обычные кнопки с числами (1–10)
      for (let i = 1; i <= 10; i++) {
        const value = i;
        const ratingButton = new Button(ButtonsContainer, {
          id: `ratingButton-q-${this.question.Id}-${value}`,
          text: value,
          onSubmit: async () => {
            try {
              await AppSurveyRequests.SendVote(this.question.Id, value);
              if (this.selectedButton !== null) {
                this.ratingButtons[this.selectedButton].button.self.style.backgroundColor = '';
                this.ratingButtons[this.selectedButton].button.self.style.color = '#D9D9D9';
              }

              ratingButton.self.style.backgroundColor = '#FF4D00';
              ratingButton.self.style.color = 'white';
              this.selectedButton = value - 1;
            } catch (error) {
              toasts.error(error.message);
            }
          },
        });

        ratingButton.render();
        this.ratingButtons.push({ button: ratingButton, value });
      }
    }
  }

  get self() {
    const element = document.getElementById(this.question.Id);
    if (!element) {
      throw new Error(`Error: can't find question with id ${this.question.Id}`);
    }
    return element;
  }

  show() {
    this.self.style.display = 'block';
  }

  hide() {
    this.self.style.display = 'none';
  }
}
