import template from './stepProgressBar.hbs';

interface StepProps {
  id: string;
  image: { src: string; alt?: string };
  text: string;
  completed?: boolean;
}

export interface StepProgressBarProps {
  steps: StepProps[];
  lastCompleted?: number; // Индекс последнего завершенного шага
}

export class StepProgressBar {
  private parent: HTMLElement;
  private readonly props: StepProgressBarProps;
  private stepElements: HTMLElement[] = [];

  /**
   * Создает экземпляр прогресс бара
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться прогресс бар
   * @param {StepProgressBarProps} props
   */
  constructor(parent: HTMLElement, props: StepProgressBarProps) {
    this.parent = parent;
    this.props = {
      steps: props.steps.map((step, index) => ({
        ...step,
        completed: index <= (props.lastCompleted ?? 0),
      })),
      lastCompleted: props.lastCompleted ?? 0,
    };
  }

  private updateProgressLine(): void {
    const totalSteps = this.props.steps.length;
    const nextStepIndex = Math.min(this.props.lastCompleted + 1, totalSteps - 1);
    const percentage = (nextStepIndex / (totalSteps - 1)) * 100;
    this.self.style.setProperty('--progress', `${percentage}%`);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.step-progress-bar');
    if (!element) {
      throw new Error(`Error: can't step progress bar`);
    }
    return element as HTMLElement;
  }

  /**
   * Отображает прогресс бар на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Error: categories template not found');
    }
    this.props.steps.forEach((props) => {
      if (document.getElementById(props.id)) {
        // Существует элемент с таким id
        throw new Error(`Error: this id=${props.id} is already in use`);
      }
    });

    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    this.props.steps.forEach((props) => {
      // Добавялем в массив элементов чтобы не искать каждый раз
      this.stepElements.push(document.getElementById(props.id));
    });
    this.updateProgressLine();
  }

  /**
   * Завершает текущий шаг и переходит к следующему (если он есть)
   */
  public next(): void {
    if (this.props.lastCompleted + 1 < this.props.steps.length) {
      this.props.lastCompleted += 1;
      this.props.steps[this.props.lastCompleted].completed = true;
      this.stepElements[this.props.lastCompleted].classList.add('completed');
      this.updateProgressLine();
    }
  }

  /**
   * Отменяет предыдущий завершенный шаг (если он есть) и откатывает к нему
   * 1-ый шаг всегда активный
   */
  public prev(): void {
    if (this.props.lastCompleted >= 1) {
      this.props.steps[this.props.lastCompleted].completed = false;
      this.stepElements[this.props.lastCompleted].classList.remove('completed');
      this.props.lastCompleted -= 1;
      this.updateProgressLine();
    }
  }

  /**
   * Ищет нужный шаг и выполняет или отменяет шаги
   */
  public goto(index: number): void {
    if (index >= 0 && index < this.props.steps.length) {
      while (this.props.lastCompleted > index) {
        this.prev();
      }
      while (this.props.lastCompleted < index) {
        this.next();
      }
    }
    this.updateProgressLine();
  }

  public getLastCompletedIndex(): number {
    return this.props.lastCompleted;
  }

  public remove(): void {
    this.stepElements = [];
    const stepProgressBarElement = this.self;
    if (stepProgressBarElement) {
      this.parent.removeChild(stepProgressBarElement);
    }
  }
}
