export default {
  addressInputs: {
    flat: {
      id: 'form__line__flat__input',
      placeholder: 'Кв./Офис',
      type: 'text',
      maxLength: 6,
    },
    doorPhone: {
      id: 'form__line__door_phone__input',
      placeholder: 'Домофон',
      type: 'text',
      maxLength: 10,
    },
    porch: {
      id: 'form__line__porch__input',
      placeholder: 'Подъезд',
      type: 'number',
      min: 1,
      max: 20,
    },
    floor: {
      id: 'form__line__floor__input',
      placeholder: 'Этаж',
      type: 'number',
      min: 1,
      max: 100,
    },
  },
  commentInput: {
    id: 'order_page_comment_input',
    placeholder: 'Комментарий курьеру',
    type: 'text',
  },
};
