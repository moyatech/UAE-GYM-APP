var EARTH_RADIUS_M = 6371.0 * 1000.0;
var emirates = [
    {region:'Abu Dhabi',code:'ADB',lat:24.46667,lng:54.36667},
    // {region:'Dubai'    ,code:'DXB',lat:25.0657 ,lng:55.17128},//23.5, 54.5
    {region:'Dubai'    ,code:'DXB',lat:23.5 ,lng:54.5},//, 
    {region:'Sharjah',code:'SHJ',lat:25.433333,lng:55.383333},//, 
    // {region:'Sharjah',code:'SHJ',lat:25.33737,lng:55.41206},//25.433333, 55.383333
    {region:'Ras Al Khaimah',code:'RAK',lat:25.78953,lng:55.9432},
    {region:'Fujairah' ,code:'FUJ',lat:25.59246,lng:56.26176}
    /*{region:'Ajman'    ,code:'AJM',lat:25.41111,lng:55.43504}*/
    /*,{name:'Umm al Qaywayn',shortName:'ADB',lat:25.56473,lng:55.55517}*/
    ];

function getNearestEmirate(latitude,longitude){
    var result = null;
     for(var i=0;i<emirates.length;++i){
         var city = emirates[i];
         
         if(result == null){
             result = emirates[i];
         }else {
             var resultDistance = getDistance(latitude, longitude, result.lat, result.lng);
             var cityDistance = getDistance(latitude, longitude, city.lat, city.lng);
             if ( cityDistance < resultDistance ) //if this city is closer than earlier result
               result = city;
          }
     }
     return result;
}

function getDistance(latitude1,longitude1,latitude2,longitude2){
  
      var dLat = toRad(latitude2 - latitude1);
      var dLon = toRad(longitude2 - longitude1);
      var lat1 = toRad(latitude1);
      var lat2 = toRad(latitude2);
      var sqrtHaversineLat = Math.sin(dLat / 2);
      var sqrtHaversineLon = Math.sin(dLon / 2);
      var a = sqrtHaversineLat * sqrtHaversineLat + sqrtHaversineLon * sqrtHaversineLon
              * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
      return (EARTH_RADIUS_M * c);
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}
function initGeoLocation($cordovaGeolocation,sharingService){
 var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
      var lat  = position.coords.latitude
      var long = position.coords.longitude
      console.log("lat: "+lat," long: "+long);
       sharingService.getDataStore().currentEmirate =  getNearestEmirate(lat,long);
       console.log(sharingService.getDataStore().currentEmirate);
    }, function(err) {
     console.log("error geo: "+err);
    });
}


function initDataBase($cordovaSQLite,sharingService){
     console.log("opening fitness 2 db");
    var db = $cordovaSQLite.openDB(
    { name: "my.db", bgType: 1 },function(db) {
    console.log("DB is Opened...., Creating tables");
   
    });
    console.log("Getting db",db.execute);
    if(sharingService != null && sharingService != undefined)
        sharingService.getDataStore().db = db;
      $cordovaSQLite.execute(db,'DROP TABLE IF EXISTS kvstore');
     $cordovaSQLite.execute(db,'CREATE TABLE IF NOT EXISTS kvstore (ikey text primary key, ivalue text)').then(
        function(res) {
            
            // $cordovaSQLite.execute(db,'CREATE TABLE IF NOT EXISTS kvstore (ikey text primary key, ivalue text)').then(
            
            console.info("Table Created: " + res);
        }, function (err) {
            console.log("error while opening");
            console.error(JSON.stringify(err));
        });
   return db;
}