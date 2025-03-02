(() => {
  var n = Handlebars.template;
  (Handlebars.templates = Handlebars.templates || {})['header.hbs'] = n({
    compiler: [8, '>= 4.3.0'],
    main: function (n, t, r, a, s) {
      return '\x3c!--<div class="logo">\r\n        Delivery\r\n</div>\r\n<div class="search-form">\r\n    <form action="">\r\n        <label>\r\n            <input class="search-form-input" placeholder="Поиск по ресторанам" type="text" />\r\n        </label>\r\n        <button class="search-form-button">Найти</button>\r\n    </form>\r\n</div>\r\n<button class="address-button">Выберите адрес доставки</button>\r\n<button class="login-button">Войти</button>\r\n<button class="logout-button">Выйти</button>--\x3e\r\n\r\n<div class=\'header\'>\r\n  <div class=\'logo\'>\r\n  </div>\r\n  <div class=\'header__buttons\'>\r\n  </div>\r\n</div>';
    },
    useData: !0,
  });
})();
