angular.module('starter.services', [])

.factory('BlankFactory', [function () {

}])

.service('localStorage', ['$http',function ($http) {
    var loaded = false;
    var lastRefresh = window.localStorage['lastRefresh'];
    var clubs = window.localStorage['clubs'];
    var startupScreen = 'favorite';
    if(!getCacheEnabled())
        reset();
    loadAll();
    
    function loadAll(){
        
        if(isNull(lastRefresh)){
            lastRefresh = moment();
        }else{
            lastRefresh = moment(lastRefresh+"");
        }
       
        if(isNull(clubs) || !isUpdated()){
            clubs = [];
        }else{
            clubs = JSON.parse(clubs);
        }
        
        loaded = true;
            
    }
    
    
    
    function getLastRefresh(){
       
        return lastRefresh;
    }
    function getClasses(club){
        if(isNull(window.localStorage[club]))
            return [];
        return JSON.parse(window.localStorage[club]);
    }
    function getClubs(){
        if( isNull(window.localStorage['clubs']))
            return [];
        return JSON.parse(window.localStorage['clubs']);
    }
    function isUpdated(){
        var now = moment();
        if(getCacheEnabled()){
            if(Math.abs(now.diff(getLastRefresh(),'days'))<=7){
                return true;
            }
        }else{
            var last = getLastRefresh();
            if(now.year() === last.year() && last.month() === now.month() && last.date() === now.date()){
                return true;
            }
        }
        return false;
    }
    function getCacheEnabled(){
         if( isNull(window.localStorage['clubs']))
            return false;
         return JSON.parse(window.localStorage['cacheEnabled']);
    }
    
    function isNull(str){
         if(str === undefined || str === null)
            return true;
         return false;
    }
    
    function setCacheEnabled(isEnabled){
        console.log("change cache setting",isEnabled);
        
        window.localStorage['cacheEnabled'] = JSON.stringify(isEnabled);
        setLastRefresh();
    }
    
    function setLastRefresh(){
        lastRefresh = moment();
        window.localStorage['lastRefresh'] = lastRefresh.format();
        
    }
    
    function setClasses(club,arr){
       window.localStorage[club] = JSON.stringify(arr);
        setLastRefresh();
    }
    function setClubs(arr){
        // clubs = arr;
        window.localStorage['clubs'] = JSON.stringify(arr);
        setLastRefresh();
    }
    function reset(){
        var cacheEnabled = getCacheEnabled();
        console.log("Restting cache ",cacheEnabled);
         window.localStorage.clear();
         setCacheEnabled(cacheEnabled);
    }
    function refresh(){
        reset();
        loadAll();
        console.log("Before Loading:",getClubs())
        loadClubs(new Object(),$http,null,null,this);
    }
    return {
        lastRefresh:getLastRefresh,
        cacheEnabled:getCacheEnabled,
        classes:getClasses,
        clubs:getClubs,
        setClasses:setClasses,
        setClubs:setClubs,
        setCacheEnabled:setCacheEnabled,
        refresh:refresh,
        reset:reset,
        startupScreen:startupScreen
    } 
}])
///	Sharing service is used to share date between diffrent controllers in the application. There is a datastore, where anything can be 
/// added and accessed.

.service('sharingService', function ($cordovaSQLite) {
	var DataStore = new Object();
	DataStore.Title = '';
	DataStore.currentClass = {};
    DataStore.currentEmirate = {};
    DataStore.db = {};


	var getDataStore = function () {
		return DataStore;
	};



	return {
		getDataStore: getDataStore
        
        
	};

})
.service('PtrService', ['$timeout', '$ionicScrollDelegate', function($timeout, $ionicScrollDelegate) {

  /**
   * Trigger the pull-to-refresh on a specific scroll view delegate handle.
   * @param {string} delegateHandle - The `delegate-handle` assigned to the `ion-content` in the view.
   */
  this.triggerPtr = function(delegateHandle) {

    $timeout(function() {

      var scrollView = $ionicScrollDelegate.$getByHandle(delegateHandle).getScrollView();

      if (!scrollView) return;

      scrollView.__publish(
        scrollView.__scrollLeft, -scrollView.__refreshHeight,
        scrollView.__zoomLevel, true);

      var d = new Date();

      scrollView.refreshStartTime = d.getTime();

      scrollView.__refreshActive = true;
      scrollView.__refreshHidden = false;
      if (scrollView.__refreshShow) {
        scrollView.__refreshShow();
      }
      if (scrollView.__refreshActivate) {
        scrollView.__refreshActivate();
      }
      if (scrollView.__refreshStart) {
        scrollView.__refreshStart();
      }

    });

  }
}])
