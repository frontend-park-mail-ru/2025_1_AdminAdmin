(() => {
  var t = Handlebars.template;
  (Handlebars.templates = Handlebars.templates || {})['button.hbs'] = t({
    compiler: [8, '>= 4.3.0'],
    main: function (t, n, l, e, a) {
      var o,
        r = null != n ? n : t.nullContext || {},
        u = t.hooks.helperMissing,
        s = 'function',
        i = t.escapeExpression,
        t =
          t.lookupProperty ||
          function (t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n)) return t[n];
          };
      return (
        '<button class="button" id="' +
        i(
          typeof (o = null != (o = t(l, 'id') || (null != n ? t(n, 'id') : n)) ? o : u) == s
            ? o.call(r, {
                name: 'id',
                hash: {},
                data: a,
                loc: { start: { line: 1, column: 27 }, end: { line: 1, column: 33 } },
              })
            : o,
        ) +
        '">\r\n\t' +
        i(
          typeof (o = null != (o = t(l, 'text') || (null != n ? t(n, 'text') : n)) ? o : u) == s
            ? o.call(r, {
                name: 'text',
                hash: {},
                data: a,
                loc: { start: { line: 2, column: 1 }, end: { line: 2, column: 9 } },
              })
            : o,
        ) +
        '\r\n</button>'
      );
    },
    useData: !0,
  });
})();
