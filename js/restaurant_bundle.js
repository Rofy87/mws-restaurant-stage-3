!function a(i,u,c){function l(t,e){if(!u[t]){if(!i[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(s)return s(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var o=u[t]={exports:{}};i[t][0].call(o.exports,function(e){return l(i[t][1][e]||e)},o,o.exports,a,i,u,c)}return u[t].exports}for(var s="function"==typeof require&&require,e=0;e<c.length;e++)l(c[e]);return l}({1:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r,o=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}(),a=e("idb"),u=(r=a)&&r.__esModule?r:{default:r};var i=function(){function i(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i)}return o(i,null,[{key:"DBOpen",value:function(){return u.default.open("mws",2,function(e){switch(e.oldVersion){case 0:e.createObjectStore("restaurants",{keyPath:"id"});case 1:e.createObjectStore("reviews",{keyPath:"id"}).createIndex("restaurant","restaurant_id"),e.createObjectStore("offlineReviews",{keyPath:"createdAt"}).createIndex("restaurant","restaurant_id")}})}},{key:"getRestaurantsFromCache",value:function(){return i.DBOpen().then(function(e){return e.transaction("restaurants","readonly").objectStore("restaurants").getAll()})}},{key:"addRestaurantsToCache",value:function(r){i.DBOpen().then(function(e){var t=e.transaction(["restaurants"],"readwrite"),n=t.objectStore("restaurants");return r.forEach(function(e){return n.put(e)}),t.complete}).then(function(){console.log("Restaurants were added to Cache")}).catch(function(e){console.log("Failed to Add  Restaurant to Cache")})}},{key:"getReviewsFromCache",value:function(t){return i.DBOpen().then(function(e){return e.transaction("reviews","readonly").objectStore("reviews").index("restaurant").getAll(parseInt(t))})}},{key:"getReviewsFromOfflineCache",value:function(t){return i.DBOpen().then(function(e){return e.transaction("offlineReviews","readonly").objectStore("offlineReviews").index("restaurant").getAll(parseInt(t))})}},{key:"getAllReviewsFromOfflineCache",value:function(){return i.DBOpen().then(function(e){return e.transaction("offlineReviews","readonly").objectStore("offlineReviews").getAll()})}},{key:"addReviewsToCache",value:function(r){i.DBOpen().then(function(e){var t=e.transaction(["reviews"],"readwrite"),n=t.objectStore("reviews");return r.forEach(function(e){return n.put(e)}),t.complete}).then(function(){console.log("Reviews were added to Cache")}).catch(function(e){console.log("Failed to Add Reviews to Cache")})}},{key:"addReviewsToOfflineCache",value:function(n){i.DBOpen().then(function(e){var t=e.transaction(["offlineReviews"],"readwrite");return t.objectStore("offlineReviews").put(n),t.complete}).then(function(){console.log("added to Offline Cache")}).catch(function(e){console.log("Failed to Add to Offline Cache")})}},{key:"saveReview",value:function(e){return fetch(i.REVIEW_DATABASE_URL(),{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(e)}).then(function(e){return e.json()}).then(function(e){var t=[];t.push(e),i.addReviewsToCache(t),console.log("Reviews were added to database")})}},{key:"clearOfflineReviews",value:function(){i.DBOpen().then(function(e){e.transaction(["offlineReviews"],"readwrite").objectStore("offlineReviews").clear()}).then(function(){console.log("Offline Reviews were deleted")}).catch(function(e){console.log("Failed to delete offline Reviews")})}},{key:"sendReview",value:function(e){return fetch(i.REVIEW_DATABASE_URL(),{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(e)}).then(function(e){return e.json()}).then(function(e){i.clearOfflineReviews(),console.log("Reviews were added to database")}).catch(function(e){console.log("Failed to add review to database")})}},{key:"sendOfflineReviewsToDatabse",value:function(){return i.getAllReviewsFromOfflineCache().then(function(e){e.forEach(function(e){return i.sendReview(e)})}).catch(function(e){console.log("Coudnt Open Offline Cache")})}},{key:"RESTAURANT_DATABASE_URL",value:function(){return"http://localhost:1337/restaurants"}},{key:"REVIEWS_DATABASE_URL",value:function(e){return"http://localhost:1337/reviews/?restaurant_id="+e}},{key:"REVIEW_DATABASE_URL",value:function(){return"http://localhost:1337/reviews/"}},{key:"fetchRestaurants",value:function(n){i.getRestaurantsFromCache().then(function(e){0<e.length?n(null,e):fetch(i.RESTAURANT_DATABASE_URL()).then(function(e){return e.json()}).then(function(e){var t=e;i.addRestaurantsToCache(t),n(null,t)}).catch(function(e){n("Request From Database failed.",null)})}).catch(function(e){n("Checking Cache failed",null)})}},{key:"fetchRestaurantById",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.find(function(e){return e.id==r});n?o(null,n):o("Restaurant does not exist",null)}})}},{key:"fetchReviewById",value:function(t,n){fetch(i.REVIEWS_DATABASE_URL(t)).then(function(e){return e.json()}).then(function(e){var t=e;i.addReviewsToCache(t),n(null,t)}).catch(function(e){n("Reviews Request failed. Cache mode",null),Promise.all([i.getReviewsFromCache(t),i.getReviewsFromOfflineCache(t)]).then(function(e){var t;n(null,(t=[]).concat.apply(t,function(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}(e)))}).catch(function(e){n("getting cache reviews  failed",null)})})}},{key:"fetchRestaurantByCuisine",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.cuisine_type==r});o(null,n)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.neighborhood==r});o(null,n)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,o,a){i.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t;"all"!=r&&(n=n.filter(function(e){return e.cuisine_type==r})),"all"!=o&&(n=n.filter(function(e){return e.neighborhood==o})),a(null,n)}})}},{key:"fetchNeighborhoods",value:function(o){i.fetchRestaurants(function(e,n){if(e)o(e,null);else{var r=n.map(function(e,t){return n[t].neighborhood}),t=r.filter(function(e,t){return r.indexOf(e)==t});o(null,t)}})}},{key:"fetchCuisines",value:function(o){i.fetchRestaurants(function(e,n){if(e)o(e,null);else{var r=n.map(function(e,t){return n[t].cuisine_type}),t=r.filter(function(e,t){return r.indexOf(e)==t});o(null,t)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e){return e.id}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:i.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}]),i}();n.default=i},{idb:3}],2:[function(e,t,n){"use strict";var r,o=e("./dbhelper"),a=(r=o)&&r.__esModule?r:{default:r};"serviceWorker"in navigator&&(navigator.serviceWorker.register("./sw.js").then(function(){console.log("Registration worked!")}).catch(function(){console.log("Registration failed!")}),navigator.serviceWorker.ready.then(function(n){document.getElementById("review_form").addEventListener("submit",function(e){e.preventDefault();var t=v();t&&a.default.saveReview(t).catch(function(e){a.default.addReviewsToOfflineCache(t),console.log("Failed to add review to database"),n.sync.register("offline").then(function(){console.log("Sync registered")})})},!1)})),window.initMap=function(){c(function(e,t){if(e)console.error(e);else{i();var n=document.getElementById("map-container"),r="https://maps.googleapis.com/maps/api/staticmap?center="+t.latlng.lat+","+t.latlng.lng+"&zoom=16&size=600x500&key=AIzaSyDoChqwzBlFzWs0zw9QYGX-3DugvL-Zg-c";n.style.backgroundImage='url("'+r+'")',self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),h(),a.default.mapMarkerForRestaurant(self.restaurant,self.map)}}),l()};var i=function(){document.getElementById("map-button").addEventListener("click",function(){u()})},u=function(){document.getElementById("map-button").style.display="none",document.getElementById("map").style.display="block"},c=function(n){if(self.restaurant)n(null,self.restaurant);else{var e=m("id");e?a.default.fetchRestaurantById(e,function(e,t){(self.restaurant=t)?(s(),n(null,t)):console.error(e)}):(error="No restaurant id in URL",n(error,null))}},l=function(){var e=m("id");e?a.default.fetchReviewById(e,function(e,t){(self.reviews=t)?d():console.error(e)}):(error="No restaurant id in URL",console.error(error))},s=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant;document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;var t=document.getElementById("restaurant-img");t.className="restaurant-img",t.alt=e.name,t.title=e.name;var n=a.default.imageUrlForRestaurant(e);t.src="/images/"+n+".jpg",t.setAttribute("srcset","/images/"+n+"_800.jpg 2x, /images/"+n+".jpg 1x"),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&f()},f=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.operating_hours,t=document.getElementById("restaurant-hours"),n=document.createElement("tr"),r=document.createElement("th"),o=document.createElement("th");for(var a in r.innerHTML="Days",o.innerHTML="Opening Hours",n.appendChild(r),n.appendChild(o),t.appendChild(n),e){var i=document.createElement("tr"),u=document.createElement("td");u.innerHTML=a,i.appendChild(u);var c=document.createElement("td");c.innerHTML=e[a],i.appendChild(c),t.appendChild(i)}},d=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.reviews,t=document.getElementById("reviews_content"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),0==e.length){var r=document.createElement("p");return r.innerHTML="No reviews yet!",r.setAttribute("id","empty"),void t.appendChild(r)}var o=document.getElementById("reviews-list");e.forEach(function(e){o.appendChild(p(e))}),t.appendChild(o)},p=function(e){var t=document.createElement("li"),n=document.createElement("div");n.className="header-review";var r=document.createElement("p");r.innerHTML=e.name,n.appendChild(r);var o=document.createElement("p");o.innerHTML=new Date(e.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric"}),n.appendChild(o),t.appendChild(n);var a=document.createElement("p");a.className="rating-review",a.innerHTML="Rating: "+e.rating,t.appendChild(a);var i=document.createElement("p");return i.innerHTML=e.comments,t.appendChild(i),t},h=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant,t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)},m=function(e,t){t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null},v=function(){var e=m("id");if(e){var t=y();return!!t&&(t.restaurant_id=parseInt(e),document.getElementById("review_form").reset(),g(t),t)}return error="No restaurant id in URL",void console.error(error)},y=function(){var e={};return e.name=document.getElementById("name").value,e.rating=parseInt(document.getElementById("rate").value),e.comments=document.getElementById("comment").value,e.createdAt=(new Date).getTime(),e.updatedAt=(new Date).getTime(),""==e.name||""==e.comments?!(document.getElementById("validation-error").style.display="block"):e},g=function(e){if(0==self.reviews.length){var t=document.getElementById("reviews_content"),n=document.createElement("ul"),r=p(e);document.getElementById("empty").innerHTML="",n.setAttribute("id","reviews-list"),n.appendChild(r),t.appendChild(n)}else{var o=document.getElementById("reviews-list"),a=p(e);o.appendChild(a)}}},{"./dbhelper":1}],3:[function(e,p,t){"use strict";!function(){function i(n){return new Promise(function(e,t){n.onsuccess=function(){e(n.result)},n.onerror=function(){t(n.error)}})}function a(n,r,o){var a,e=new Promise(function(e,t){i(a=n[r].apply(n,o)).then(e,t)});return e.request=a,e}function e(e,n,t){t.forEach(function(t){Object.defineProperty(e.prototype,t,{get:function(){return this[n][t]},set:function(e){this[n][t]=e}})})}function t(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return a(this[n],e,arguments)})})}function n(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return this[n][e].apply(this[n],arguments)})})}function r(e,r,t,n){n.forEach(function(n){n in t.prototype&&(e.prototype[n]=function(){return e=this[r],(t=a(e,n,arguments)).then(function(e){if(e)return new u(e,t.request)});var e,t})})}function o(e){this._index=e}function u(e,t){this._cursor=e,this._request=t}function c(e){this._store=e}function l(n){this._tx=n,this.complete=new Promise(function(e,t){n.oncomplete=function(){e()},n.onerror=function(){t(n.error)},n.onabort=function(){t(n.error)}})}function s(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new l(n)}function f(e){this._db=e}e(o,"_index",["name","keyPath","multiEntry","unique"]),t(o,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),r(o,"_index",IDBIndex,["openCursor","openKeyCursor"]),e(u,"_cursor",["direction","key","primaryKey","value"]),t(u,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(u.prototype[n]=function(){var t=this,e=arguments;return Promise.resolve().then(function(){return t._cursor[n].apply(t._cursor,e),i(t._request).then(function(e){if(e)return new u(e,t._request)})})})}),c.prototype.createIndex=function(){return new o(this._store.createIndex.apply(this._store,arguments))},c.prototype.index=function(){return new o(this._store.index.apply(this._store,arguments))},e(c,"_store",["name","keyPath","indexNames","autoIncrement"]),t(c,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),r(c,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),n(c,"_store",IDBObjectStore,["deleteIndex"]),l.prototype.objectStore=function(){return new c(this._tx.objectStore.apply(this._tx,arguments))},e(l,"_tx",["objectStoreNames","mode"]),n(l,"_tx",IDBTransaction,["abort"]),s.prototype.createObjectStore=function(){return new c(this._db.createObjectStore.apply(this._db,arguments))},e(s,"_db",["name","version","objectStoreNames"]),n(s,"_db",IDBDatabase,["deleteObjectStore","close"]),f.prototype.transaction=function(){return new l(this._db.transaction.apply(this._db,arguments))},e(f,"_db",["name","version","objectStoreNames"]),n(f,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(a){[c,o].forEach(function(e){a in e.prototype&&(e.prototype[a.replace("open","iterate")]=function(){var e,t=(e=arguments,Array.prototype.slice.call(e)),n=t[t.length-1],r=this._store||this._index,o=r[a].apply(r,t.slice(0,-1));o.onsuccess=function(){n(o.result)}})})}),[o,c].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,n){var r=this,o=[];return new Promise(function(t){r.iterateCursor(e,function(e){e?(o.push(e.value),void 0===n||o.length!=n?e.continue():t(o)):t(o)})})})});var d={open:function(e,t,n){var r=a(indexedDB,"open",[e,t]),o=r.request;return o&&(o.onupgradeneeded=function(e){n&&n(new s(o.result,e.oldVersion,o.transaction))}),r.then(function(e){return new f(e)})},delete:function(e){return a(indexedDB,"deleteDatabase",[e])}};void 0!==p?(p.exports=d,p.exports.default=p.exports):self.idb=d}()},{}]},{},[1,2]);
//# sourceMappingURL=maps/restaurant_bundle.js.map
