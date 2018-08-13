
/**
 * Common database helper functions.
 */
import idb from 'idb'; 
export default class DBHelper {

  static DBOpen() {
    const dbPromise = idb.open('mws', 2, upgradeDB => {  

      switch (upgradeDB.oldVersion) {
        case 0:
          const restaurantsStore = upgradeDB.createObjectStore('restaurants', { keyPath: 'id'});
        case 1:
          const reviewsStore = upgradeDB.createObjectStore('reviews', { keyPath: 'id'});
          reviewsStore.createIndex('restaurant', 'restaurant_id');
          const offlineStore = upgradeDB.createObjectStore('offlineReviews', {keyPath: 'createdAt'}); 
          offlineStore.createIndex('restaurant', 'restaurant_id');
          
      }
    });
    return dbPromise;
  }


  static getRestaurantsFromCache(){
    return DBHelper.DBOpen().then(db=> {
      var transaction = db.transaction('restaurants', 'readonly');
      var objectStore = transaction.objectStore('restaurants');
       return objectStore.getAll();
    });
  }

  static addRestaurantsToCache(items){
    DBHelper.DBOpen().then(db => {
      var transaction = db.transaction(['restaurants'], 'readwrite');
      var objectStore = transaction.objectStore('restaurants');
      items.forEach(item => objectStore.put(item));
      return transaction.complete;
    }).then(function(){
        console.log("Restaurants were added to Cache");
    }).catch(ex=>{
      console.log("Failed to Add  Restaurant to Cache")
    });
  }

  static getReviewsFromCache(id){

    return DBHelper.DBOpen().then(db=> {
      var transaction = db.transaction('reviews', 'readonly');
      var objectStore = transaction.objectStore('reviews');
      var reviewIndex = objectStore.index('restaurant');
      return reviewIndex.getAll(parseInt(id));
    });
  }

  static getReviewsFromOfflineCache(id){
    return DBHelper.DBOpen().then(db=> {
      var transaction = db.transaction('offlineReviews', 'readonly');
      var objectStore = transaction.objectStore('offlineReviews');
      var reviewIndex = objectStore.index('restaurant');
      return reviewIndex.getAll(parseInt(id));
    });
  
  }

  static getAllReviewsFromOfflineCache(){
    return DBHelper.DBOpen().then(db=> {
      var transaction = db.transaction('offlineReviews', 'readonly');
      var objectStore = transaction.objectStore('offlineReviews');
      return objectStore.getAll();
    });
  
  }

  static addReviewsToCache(items){
    DBHelper.DBOpen().then(db => {
      var transaction = db.transaction(['reviews'], 'readwrite');
      var objectStore = transaction.objectStore('reviews');
      items.forEach(item => objectStore.put(item));
      return transaction.complete;
    }).then(function(){
        console.log("Reviews were added to Cache");
    }).catch(ex=>{
      console.log("Failed to Add Reviews to Cache")
    });

  }

  static addReviewsToOfflineCache(item){
    DBHelper.DBOpen().then(db => {
      var transaction = db.transaction(['offlineReviews'], 'readwrite');
      var objectStore = transaction.objectStore('offlineReviews');
      objectStore.put(item);
      return transaction.complete;
    }).then(function(){
        console.log("added to Offline Cache");
    }).catch(ex=>{
      console.log("Failed to Add to Offline Cache")
    });

  }

  /**
   * Save review .
   */
  static saveReview(data ) {

       return fetch(DBHelper.REVIEW_DATABASE_URL(), {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(function(response) {
      return response.json()
    }).then(function(json) {
      const reviews = []
      reviews.push(json);
      DBHelper.addReviewsToCache(reviews);
      console.log("Reviews were added to database")
    })
  }


  static clearOfflineReviews( ) {

    DBHelper.DBOpen().then(db => {
      var transaction = db.transaction(['offlineReviews'], 'readwrite');
      var objectStore = transaction.objectStore('offlineReviews');
      objectStore.clear();
    }).then(function(){
        console.log("Offline Reviews were deleted");
    }).catch(ex=>{
      console.log("Failed to delete offline Reviews")
    });

  }

  static sendReview(data ) {

    return fetch(DBHelper.REVIEW_DATABASE_URL(), {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(function(response) {
      return response.json()
    }).then(function(json) {
      //console.log(json)
      DBHelper.clearOfflineReviews();
      console.log("Reviews were added to database")
    }).catch(ex => {
      console.log(`Failed to add review to database`);
    })
  }

  static sendOfflineReviewsToDatabse(){
    return DBHelper.getAllReviewsFromOfflineCache().then(reviews => {
      reviews.forEach(data => {
       return DBHelper.sendReview(data)
     });
    }).catch(ex=>{
      console.log("Coudnt Open Offline Cache")
    });

  }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static  RESTAURANT_DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static  REVIEWS_DATABASE_URL(id) {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews/?restaurant_id=${id}`;
  }
  static  REVIEW_DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews/`;
  }


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    
    DBHelper.getRestaurantsFromCache().then(restaurants => {
      
      if(restaurants.length > 0){
        callback(null, restaurants);
        return;
      }
      fetch(DBHelper.RESTAURANT_DATABASE_URL())
      .then(function(response) {
        return response.json()
      }).then(function(json) {
          const restaurants = json;
          DBHelper.addRestaurantsToCache(restaurants);
          
          callback(null, restaurants); 
      }).catch(ex => {
        const error = (`Request From Database failed.`);
        callback(error, null);
      });  
    }).catch(ex => {
      const error = (`Checking Cache failed`);
      callback(error, null)
    }) ;
    
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch a review by restaurant ID.
   */
  static fetchReviewById(id, callback) {
      fetch(DBHelper.REVIEWS_DATABASE_URL(id)).then(function(response) {
        return response.json()
      }).then(function(json) {
          const reviews = json;
          DBHelper.addReviewsToCache(reviews);
          callback(null, reviews); 
      }).catch(ex => {
          const error = (`Reviews Request failed. Cache mode`);
          callback(error, null);
          Promise.all(
            [DBHelper.getReviewsFromCache(id), DBHelper.getReviewsFromOfflineCache(id)]
          ).then(reviews => {
              
              callback(null, [].concat(...reviews))
          }).catch(ex => {
            const error = (`getting cache reviews  failed`);
            callback(error, null)
          });
      });  
  }

   

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
  
    return restaurant.id;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
