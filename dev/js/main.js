//import DBHelper from 'dbhelper';
import DBHelper from './dbhelper';
let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**  
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  addEventListeners()
  fetchNeighborhoods();
  fetchCuisines();
});

const addEventListeners = () => {
  let neighborhood = document.getElementById('neighborhoods-select');
  neighborhood.addEventListener('change' , function(){
    updateRestaurants();
  });

  let cuisine = document.getElementById('cuisines-select');
  cuisine.addEventListener('change' , function(){
    updateRestaurants();
  });

  let static_map = document.getElementById('static-map');
  static_map.addEventListener('click' , function(){
    swap_map();
  });

  let map_button = document.getElementById('map-button');
  map_button.addEventListener('click' , function(){
    swap_map();
  });
}

const swap_map = () => {  
  document.getElementById('static-map').style.display = 'none';   
  document.getElementById('map-button').style.display = 'none';   
  document.getElementById('map').style.display = 'block';  
}
/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */

const updateRestaurants = () => {
  
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if(self.markers)
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  observeImg();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img js-lazy-image';
  image.alt = restaurant.name;
  image.title = restaurant.name;

  const filename = DBHelper.imageUrlForRestaurant(restaurant);
  
  
  //depending on dpi since images are never above 400px
  image.setAttribute('data-src',`/images/${filename}.jpg`);
  image.setAttribute('data-srcset',`/images/${filename}_800.jpg`);
  
  li.append(image);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', `View ${restaurant.name} Details`);
  li.append(more)

  return li
}
let observer ;
const observeImg=() =>{
  const images = document.querySelectorAll('.js-lazy-image');
  const config = {
    // If the image gets within 50px in the Y axis, start the download.
    rootMargin: '50px 0px',
    threshold: 0.01,
  };
  if (!'IntersectionObserver' in window) {
    images.forEach(image => loadImage(image));
    return 
  } 
  
  observer = new IntersectionObserver(onIntersection, config);
  images.forEach(image => {
    observer.observe(image);
  });
}
const onIntersection= (images)=> {
  // Loop through the entries
  images.forEach(image => {
    // Are we in viewport?
    if (image.intersectionRatio > 0) {

      // Stop watching and load the image
      observer.unobserve(image.target); 
      loadImage(image.target);
    }
  });
}
const loadImage = (image) => {
  if (!'devicePixelRatio' in window) {
    if(window.devicePixelRatio >= 2)
    image.src = image.dataset.src;
    return 
  } 
  image.src = image.dataset.srcset;
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
