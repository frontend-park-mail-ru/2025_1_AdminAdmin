(() => {
  var a = Handlebars.template;
  (Handlebars.templates = Handlebars.templates || {})['restaurantList.hbs'] = a({
    compiler: [8, '>= 4.3.0'],
    main: function (a, e, t, r, n) {
      return '<div class="restaurant__container">\r\n\r\n</div>';
    },
    useData: !0,
  });
})();
