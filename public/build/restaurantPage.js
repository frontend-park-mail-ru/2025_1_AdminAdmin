(()=>{var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{})["restaurantPage.hbs"]=a({compiler:[8,">= 4.3.0"],main:function(a,n,t,l,r){var e,s=a.lambda,i=a.escapeExpression,u=a.lookupProperty||function(a,n){if(Object.prototype.hasOwnProperty.call(a,n))return a[n]};return'<div class="restaurant-page" data-id="'+i(s(null!=(e=null!=n?u(n,"restaurantDetail"):n)?u(e,"id"):e,n))+'">\r\n    <img src="'+i(s(null!=(e=null!=n?u(n,"restaurantDetail"):n)?u(e,"image"):e,n))+'" alt="'+i(s(null!=(e=null!=n?u(n,"restaurantDetail"):n)?u(e,"name"):e,n))+'" class="card-image">\r\n    <div class="restaurant-content">\r\n        <h1 class="restaurant-title">'+i(s(null!=(e=null!=n?u(n,"restaurantDetail"):n)?u(e,"name"):e,n))+'</h1>\r\n        <div class="restaurant-additional-info">'+i(s(null!=(e=null!=n?u(n,"restaurantDetail"):n)?u(e,"additionalInfo"):e,n))+'</div>\r\n        <h2>Ratings and Reviews</h2>\r\n        <div class="restaurant-details">\r\n            <div class="restaurant-rating">'+i(s(null!=(e=null!=n?u(n,"restaurantDetail"):n)?u(e,"rating"):e,n))+' ⭐</div>\r\n            <div class="restaurant-hours-address">\r\n                <div class="restaurant-hours">'+i("function"==typeof(t=null!=(t=u(t,"openStatus")||(null!=n?u(n,"openStatus"):n))?t:a.hooks.helperMissing)?t.call(null!=n?n:a.nullContext||{},{name:"openStatus",hash:{},data:r,loc:{start:{line:10,column:46},end:{line:10,column:60}}}):t)+'</div>\r\n                <div class="restaurant-address">'+i(s(null!=(e=null!=n?u(n,"restaurantDetail"):n)?u(e,"address"):e,n))+"</div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n"},useData:!0})})();