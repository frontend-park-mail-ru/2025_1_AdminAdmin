(() => {
  var e = Handlebars.template;
  (Handlebars.templates = Handlebars.templates || {})['logo.hbs'] = e({
    compiler: [8, '>= 4.3.0'],
    main: function (e, l, a, n, o) {
      var t =
        e.lookupProperty ||
        function (e, l) {
          if (Object.prototype.hasOwnProperty.call(e, l)) return e[l];
        };
      return (
        "<div class='logo'>\r\n  <img src='" +
        e.escapeExpression(
          'function' ==
            typeof (a =
              null != (a = t(a, 'image') || (null != l ? t(l, 'image') : l))
                ? a
                : e.hooks.helperMissing)
            ? a.call(null != l ? l : e.nullContext || {}, {
                name: 'image',
                hash: {},
                data: o,
                loc: { start: { line: 2, column: 12 }, end: { line: 2, column: 21 } },
              })
            : a,
        ) +
        "' alt='logo' />\r\n</div>"
      );
    },
    useData: !0,
  });
})();
