import DBHelper from './dbhelper';
let restaurant;
let reviews;
let offlineReview;
var map;

if ('serviceWorker' in navigator)  {
  navigator.serviceWorker.register('./sw.js').then(function() {
      console.log('Registration worked!');
  }).catch(function() {
      console.log('Registration failed!');
  });
  navigator.serviceWorker.ready.then(function(registration) {
        var form = document.getElementById('review_form');
        form.addEventListener('submit', function (e) {
        e.preventDefault();
        let reviews = submitReview();  
        if(reviews){
          DBHelper.saveReview(reviews).catch(ex => {
            DBHelper.addReviewsToOfflineCache(reviews);
            console.log(`Failed to add review to database`);
            registration.sync.register('offline').then(() => {
                console.log('Sync registered');
            }); 
          });
        }  
      }, false); 
  
    });
 
}
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      addEventListeners()
      const mapContainer=document.getElementById('map-container');
      const url = `https://maps.googleapis.com/maps/api/staticmap?center=${restaurant.latlng.lat},${restaurant.latlng.lng}&zoom=16&size=600x500&key=AIzaSyDoChqwzBlFzWs0zw9QYGX-3DugvL-Zg-c`
      mapContainer.style.backgroundImage=`url("${url}")`;     
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
  fetchReviewFromURL();
}

const addEventListeners = () => {
  let map_button = document.getElementById('map-button');
  map_button.addEventListener('click' , function(){
    swap_map();
  });
}

const swap_map = () => {  
  document.getElementById('map-button').style.display = 'none';   
  document.getElementById('map').style.display = 'block';  
}
/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

const fetchReviewFromURL = () => {
  
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    console.error(error);
  } else {
    DBHelper.fetchReviewById(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      fillReviewsHTML();
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = restaurant.name;
  image.title = restaurant.name;

  const filename = DBHelper.imageUrlForRestaurant(restaurant);

  image.src  = `/images/${filename}.jpg`;
  //depending on dpi since images are never above 400px
  image.setAttribute('srcset', `/images/${filename}_800.jpg 2x, /images/${filename}.jpg 1x`);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  const rowTH = document.createElement('tr');
  const dayTh = document.createElement('th');
  const timeTH = document.createElement('th');

  dayTh.innerHTML = "Days";
  timeTH.innerHTML= "Opening Hours";

  rowTH.appendChild(dayTh);
  rowTH.appendChild(timeTH);
  hours.appendChild(rowTH);

  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews_content');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (reviews.length == 0) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute("id", "empty");
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
  
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');

  const header = document.createElement('div');
  header.className = "header-review";

  const name = document.createElement('p');
  name.innerHTML = review.name;
  header.appendChild(name);

  const date = document.createElement('p');
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' , hour:'numeric', minute:'numeric'};
  date.innerHTML = new Date(review.createdAt).toLocaleDateString("en-US" , dateOptions);
  header.appendChild(date);

  li.appendChild(header);

  const rating = document.createElement('p');
  rating.className = "rating-review";
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const submitReview = () => {
  let restaurant_id = getParameterByName('id');
  if (!restaurant_id) { 
    error = 'No restaurant id in URL'
    console.error(error);
    return;
  } else {
    let reviews = validation();  
    if(reviews){
      reviews['restaurant_id'] = parseInt(restaurant_id);
      document.getElementById('review_form').reset();
      addReviewToDom(reviews);
      return reviews;
    }
    else
     return false; 
  }
}

const validation = () => {
  let reviews = {};  
  reviews['name'] = document.getElementById('name').value;
  reviews['rating'] = parseInt(document.getElementById('rate').value);
  reviews['comments'] = document.getElementById('comment').value;
  reviews['createdAt'] = new Date().getTime();
  reviews['updatedAt'] = new Date().getTime();
  
  if(reviews['name'] == "" || reviews['comments'] == "" ){
    document.getElementById('validation-error').style.display="block";
    return false;
  }
  else 
   return reviews;
}

const addReviewToDom = (reviews) => {
  if (self.reviews.length == 0) {
    const container = document.getElementById('reviews_content');
    const ul = document.createElement('ul');
    const li = createReviewHTML(reviews);
    const p = document.getElementById('empty');

    p.innerHTML = '';
    ul.setAttribute("id", "reviews-list");
    ul.appendChild(li);
    container.appendChild(ul);
  }
  else{
    const ul = document.getElementById('reviews-list');
    const li = createReviewHTML(reviews);
    ul.appendChild(li);
  }
}


