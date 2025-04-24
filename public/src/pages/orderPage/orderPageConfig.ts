import {
  ValidateFlat,
  ValidateDoorPhone,
  ValidatePorch,
  ValidateFloor,
  ValidateCourierComment,
} from '@modules/validation';

export default {
  addressInputs: {
    flat: {
      id: 'form__line__flat__input',
      placeholder: 'Кв./Офис',
      type: 'text',
      required: true,
      maxLength: 20,
      movePlaceholderOnInput: true,
      validator: ValidateFlat,
    },
    doorPhone: {
      id: 'form__line__door_phone__input',
      placeholder: 'Домофон',
      type: 'text',
      required: true,
      maxLength: 20,
      movePlaceholderOnInput: true,
      validator: ValidateDoorPhone,
    },
    porch: {
      id: 'form__line__porch__input',
      placeholder: 'Подъезд',
      type: 'text',
      required: true,
      maxLength: 20,
      movePlaceholderOnInput: true,
      validator: ValidatePorch,
    },
    floor: {
      id: 'form__line__floor__input',
      placeholder: 'Этаж',
      type: 'number',
      required: true,
      min: 1,
      max: 100,
      movePlaceholderOnInput: true,
      validator: ValidateFloor,
    },
  },
  commentInput: {
    id: 'order_page_comment_input',
    placeholder: 'Комментарий курьеру',
    required: false,
    type: 'text',
    validator: ValidateCourierComment,
  },
};
