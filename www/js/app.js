// Ionic Starter App

angular.module('starter', ['ionic', 'starter.controllers','starter.services','ngCordova'])

.run(function($ionicPlatform,$cordovaGeolocation,$cordovaSQLite,sharingService,$rootScope,$cordovaNetwork) {

    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        initGeoLocation($cordovaGeolocation,sharingService);
        //    getAllClubs()
        


    });
  
//    $rootScope.$on('$stateChangeStart', function (event, next, current) {
//     $ionicPlatform.ready(function() {
//         console.log("$stateChangeStart");
//      initDataBase($cordovaSQLite,sharingService);
//       console.log("$stateChangeStart");
//     });
    
//         });
  
})
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
    // $ionicConfigProvider.views.maxCache(0);
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.club', {
    url: '/club/:clubId/:clubName',
    views: {
      'menuContent': {
        templateUrl: 'templates/club.html',
        controller: 'ClubCtrl'
      }
    }
  })
  .state('app.class', {
    url: '/class',
    views: {
      'menuContent': {
        templateUrl: 'templates/class.html',
        controller: 'ClassCtrl'
      }
    }
  })
    .state('app.clubs', {
      url: '/club-finder',
      views: {
        'menuContent': {
          templateUrl: 'templates/club-finder.html',
          controller: 'ClubFinderCtrl'
        }
       }
    })
    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsCtrl'
        }
       }
    })
    .state('app.cache', {
      url: '/cache',
      views: {
        'menuContent': {
          templateUrl: 'templates/cache.html',
          controller: 'CacheCtrl'
        }
       }
    })
    .state('app.reminders', {
      url: '/reminders',
      views: {
        'menuContent': {
          templateUrl: 'templates/reminders.html',
          controller: 'RemindersCtrl'
        }
       }
    })
  .state('app.classFinder', {
      url: '/class-finder',
      views: {
        'menuContent': {
          templateUrl: 'templates/class-finder.html',
          controller: 'ClassFinderCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/club-finder');
});
