//import { Categories, CategoriesProps } from '../../components/categories/categories'; // Решили отказаться от категорий тк страница целиком помещается на экран
import { Address, AddressProps } from '../../components/address/address';
//import { CategoryProps } from '../../components/category/category';
import { FormInput } from '../../components/formInput/formInput';
import { Button, ButtonProps } from '../../components/button/button';
import { ProfileTableProps, ProfileTable } from '../../components/profileTable/profileTable';
import { ProfileForm } from '../../components/profileForm/profileForm';

import template from './profilePage.hbs';
import { ProfileFormConfig, config } from '../../components/profileForm/profileFormConfig';

interface PhoneNumberProps {
  countryCode: string;
  phoneNumber: string;
}

interface ProfileDataProps {
  id: string;
  lastname: string;
  firstname: string;
  phoneNumber: PhoneNumberProps;
  login: string;
  password: string;
}

interface ProfilePageProps {
  id: string;
  //categories?: CategoriesProps;
  data?: ProfileDataProps;
  addresses?: Array<AddressProps>;
  orders?: ProfileTableProps;
}

/**
 * Класс страницы профиля
 */
export default class ProfilePage {
  private parent: HTMLElement;
  private props: ProfilePageProps;
  private components: {
    profileForm?: ProfileForm;
    addresses: Array<Address>;
    //categories?: Categories,
    addAddressButton?: Button;
    ordersTable?: ProfileTable;
  };
  // Поля необязательные чтобы можно было создать пустой объект

  /**
   * Создает экземпляр страницы профиля
   * @param parent - Родительский элемент, в который будет рендериться страница профиля
   * @param id - Идентификатор профиля, который нужно отобразить
   */
  constructor(parent: HTMLElement) {
    let id = 'helloworld';
    if (!parent) {
      throw new Error('ProfilePage: no parent!');
    }
    this.parent = parent;
    this.props = {
      id: id,
      // Прибиваю временные значения
      /*categories: {
                categoriesList: [
                    {
                        id: 'category1',
                        name: 'Мои данные',
                    } as CategoryProps,
                    {
                        id: 'category2',
                        name: 'Мои адреса',
                    } as CategoryProps,
                    {
                        id: 'category3',
                        name: 'Мои заказы',
                    } as CategoryProps,
                ],
            } as CategoriesProps,
            */
      data: {
        id: 'user1',
        lastname: 'user1_lastname',
        firstname: 'user1_firstname',
        phoneNumber: {
          countryCode: '+7',
          phoneNumber: '1234567890',
        } as PhoneNumberProps,
        login: 'user1_login',
        password: 'user1_password',
      } as ProfileDataProps,
      addresses: [
        {
          id: 'address1',
          text: 'г. Москва ул. Пушкина д.1',
        } as AddressProps,
        {
          id: 'address2',
          text: 'г. Москва ул. Пушкина д.2',
        } as AddressProps,
        {
          id: 'address3',
          text: 'г. Москва ул. Пушкина д.3',
        } as AddressProps,
      ],
      orders: {
        id: `${id}-orders`,
        rows: [
          {
            id: `${id}-order-1`,
            status: false,
            create_date: '03.01.2024',
            price: 309,
            products_amount: 2,
            restaurant: {
              name: 'Burger King',
            },
          },
          {
            id: `${id}-order-2`,
            status: true,
            create_date: '01.01.2024',
            price: 3099,
            products_amount: 10,
            restaurant: {
              name: 'Burger King',
            },
          },
        ],
      } as ProfileTableProps,
    } as ProfilePageProps;
    this.components = {
      addresses: [],
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.profile-page__body');
    if (!element) {
      throw new Error(`Error: can't find profile-page`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Рендерит информацию о ресторане.
   * Запрашивает данные ресторана по ID и отображает их на странице.
   */
  async render(): Promise<void> {
    if (!template) {
      throw new Error('Error: profile page template not found');
    }
    try {
      // Генерируем HTML
      const html = template(this.props.data);
      this.parent.insertAdjacentHTML('beforeend', html);
      // Заполняем
      // Если оставляем категории то тут рендерим категории, у них свой враппер
      // Рендерим блок изменения данных профиля
      const profileFormElement = this.self.querySelector('.profile-data__body') as HTMLElement;
      const profileFormComponent = new ProfileForm(profileFormElement, config);
      profileFormComponent.render();
      this.components.profileForm = profileFormComponent;
      // Ренденрим блок изменения/удаления/добавления адресов
      const profileAddressBody = this.self.querySelector('.profile-address__body') as HTMLElement;
      const profileAddressesWrapper = profileAddressBody.querySelector(
        '.profile-address__addresses__wrapper',
      ) as HTMLElement;
      this.props.addresses.forEach((props) => {
        const addressComponent = new Address(profileAddressesWrapper, props);
        addressComponent.render();
        this.components.addresses.push(addressComponent);
      });
      const addAddressButtonProps = {
        id: 'profile-page__address-add',
        text: 'Добавить',
        onSubmit: () => console.log('TODO: Добавить модалку добавления адреса'),
      } as ButtonProps;
      const addAddressButtonComponent = new Button(profileAddressBody, addAddressButtonProps);
      addAddressButtonComponent.render();
      this.components.addAddressButton = addAddressButtonComponent;
      // Рендерим блок таблицы заказов
      const profileTableWrapper = this.self.querySelector(
        '.profile-orders__table__wrapper',
      ) as HTMLElement;
      const ordersTableComponent = new ProfileTable(profileTableWrapper, this.props.orders);
      ordersTableComponent.render();
      this.components.ordersTable = ordersTableComponent;
    } catch (error) {
      console.error('Error rendering restaurant page:', error);
    }
  }

  /*
    handleCategory(categoryName: string): void {
        this.self.querySelector('.product-cards__header').textContent = `Категория: ${categoryName}`;
    }
    */

  /**
   * Удаляет страницу профиля
   */
  remove(): void {
    const element = this.self;
    this.components.addAddressButton.remove();
    //this.components.categories.remove();
    this.components.profileForm.remove();
    this.components.ordersTable.remove();
    this.components.addresses.forEach((component) => {
      component.remove();
    });
    element.remove();
  }
}
