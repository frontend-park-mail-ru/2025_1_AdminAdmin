(()=>{var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{})["restaurantCard.hbs"]=n({compiler:[8,">= 4.3.0"],main:function(n,a,l,e,t){var i,s=null!=a?a:n.nullContext||{},c=n.hooks.helperMissing,d="function",o=n.escapeExpression,n=n.lookupProperty||function(n,a){if(Object.prototype.hasOwnProperty.call(n,a))return n[a]};return'<div class="restaurant-card" data-id="'+o(typeof(i=null!=(i=n(l,"id")||(null!=a?n(a,"id"):a))?i:c)==d?i.call(s,{name:"id",hash:{},data:t,loc:{start:{line:1,column:38},end:{line:1,column:44}}}):i)+'">\n    <img src="'+o(typeof(i=null!=(i=n(l,"image")||(null!=a?n(a,"image"):a))?i:c)==d?i.call(s,{name:"image",hash:{},data:t,loc:{start:{line:2,column:14},end:{line:2,column:23}}}):i)+'" alt="'+o(typeof(i=null!=(i=n(l,"name")||(null!=a?n(a,"name"):a))?i:c)==d?i.call(s,{name:"name",hash:{},data:t,loc:{start:{line:2,column:30},end:{line:2,column:38}}}):i)+'" class="card-image">\n    <div class="restaurant-card-content">\n        <h2 class="restaurant-card-title">'+o(typeof(i=null!=(i=n(l,"name")||(null!=a?n(a,"name"):a))?i:c)==d?i.call(s,{name:"name",hash:{},data:t,loc:{start:{line:4,column:42},end:{line:4,column:50}}}):i)+'</h2>\n        <div class="restaurant-card-info">\n            <div class="restaurant-rating"> '+o(typeof(i=null!=(i=n(l,"rating")||(null!=a?n(a,"rating"):a))?i:c)==d?i.call(s,{name:"rating",hash:{},data:t,loc:{start:{line:6,column:44},end:{line:6,column:54}}}):i)+' ⭐</div>\n            <div class="restaurant-distance"> '+o(typeof(i=null!=(i=n(l,"distance")||(null!=a?n(a,"distance"):a))?i:c)==d?i.call(s,{name:"distance",hash:{},data:t,loc:{start:{line:7,column:46},end:{line:7,column:58}}}):i)+'</div>\n            <div class="restaurant-time"> '+o(typeof(i=null!=(i=n(l,"time")||(null!=a?n(a,"time"):a))?i:c)==d?i.call(s,{name:"time",hash:{},data:t,loc:{start:{line:8,column:42},end:{line:8,column:50}}}):i)+'</div>\n        </div>\n        <div class="restaurant-additional-info">'+o(typeof(i=null!=(i=n(l,"additionalInfo")||(null!=a?n(a,"additionalInfo"):a))?i:c)==d?i.call(s,{name:"additionalInfo",hash:{},data:t,loc:{start:{line:10,column:48},end:{line:10,column:66}}}):i)+"</div>\n    </div>\n</div>\n"},useData:!0})})();