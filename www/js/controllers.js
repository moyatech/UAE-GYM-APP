angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) { 
})
.controller('ClubFinderCtrl', function ($rootScope,$scope, $http, $state,$ionicLoading,$cordovaSQLite,sharingService, $ionicPlatform,localStorage,$cordovaNetwork,$ionicPopup) {
    $scope.toggleGroup = function(group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };

    $scope.isGroupShown = function(group) {
        return $scope.shownGroup === group;
    };
    $ionicPlatform.ready(function() {
        var isOffline = $cordovaNetwork.isOffline()
        console.log("isOffline: ",isOffline);
    });
    loadClubs($scope, $http,$cordovaSQLite,sharingService,localStorage,$cordovaNetwork,$ionicPopup);
})


.controller('ClubCtrl', function ($scope, $http, $state,$ionicModal,$ionicLoading,$cordovaSQLite,sharingService,localStorage) {
    $scope.days = loadCalendarDays();
     $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  
   $scope.showClasses = function(clubId) {
    
  };
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };
  $scope.getDetails = function(item){
      sharingService.getDataStore().currentClass = item;
      console.log(sharingService.getDataStore().currentClass);
      $state.go("app.class");
  }
    $scope.clubName = $state.params.clubName;
    loadClasses($scope, $http, $state.params.clubId,[{id:$state.params.clubId}],null,null,$ionicLoading,$cordovaSQLite,sharingService,localStorage);
    $scope.CurrentDay  = 0;
    $scope.refreshClasses = function(dayId,dayName) {
        $scope.CurrentDay = dayId;
        
         loadClasses($scope, $http, $state.params.clubId,[{id:$state.params.clubId}],dayName,null,$ionicLoading,$cordovaSQLite,sharingService,localStorage)
    };
})
.controller('ClassCtrl', function ($scope, $http, $state,$ionicPopover,$cordovaSocialSharing, $cordovaLocalNotification,$ionicPopup,$ionicScrollDelegate,sharingService,PtrService,localStorage) {
    console.log("Class");
    
    $scope.currentClass = sharingService.getDataStore().currentClass;
    $scope.hamada = $scope.currentClass.title;
    console.log( $scope.currentClass);
    loadOtherTiming($scope,$http,$scope.currentClass.clubId,$scope.currentClass.classTypeTag,localStorage);
    $scope.whatsappShare = function (){
        $cordovaSocialSharing.shareViaWhatsApp("I'm attending Class: "+ $scope.currentClass.title +"at "+ $scope.currentClass.timeText, null, null)
        .then(function(result) {
        console.log("success"+result);
        }, function(err) {
        // An error occurred. Show a message to the user
            console.log("err"+err);
        });
    };
    $scope.facebookShare = function (){
        $cordovaSocialSharing.shareViaFacebook("I'm attending Class: "+ $scope.currentClass.title +"at "+ $scope.currentClass.timeText, null, "http://fitnessfirstme.com")
        .then(function(result) {
        console.log("success"+result);
        }, function(err) {
        // An error occurred. Show a message to the user
            console.log("err"+err);
        });
    };
     $scope.twitterShare = function (){
        $cordovaSocialSharing.shareViaTwitter("I'm attending Class: "+ $scope.currentClass.title +"at "+ $scope.currentClass.timeText, null, null)
        .then(function(result) {
        console.log("success"+result);
        }, function(err) {
        // An error occurred. Show a message to the user
            console.log("err"+err);
        });
    };
    $scope.remindMe = function ($event) {
		// $scope.popover.show($event);
        $scope.choice = {};
        $scope.choice.weekly = false;
        var myPopup = $ionicPopup.show({
    template: '<div class="list"> <ion-list> <ion-radio ng-model="choice.val" value="A">30 Minutes Before</ion-radio> <ion-radio ng-model="choice.val" value="B">1 Hour Before</ion-radio>'+
            '<ion-radio ng-model="choice.val" value="C">2 Hours Before</ion-radio> <ion-checkbox ng-model="choice.weekly">Weekly Repeate</ion-checkbox>'+
        '</ion-list>',
    title: 'Settings',
    // subTitle: 'Repea',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Create</b>',
        type: 'button-positive',
        onTap: function(e) {
          console.log($scope.choice);
          console.log(e);
           remindMe($scope, sharingService, $cordovaLocalNotification,  $scope.currentClass, $ionicPopup);
        }
      }
    ]
  });

  myPopup.then(function(res) {
    console.log('Tapped!', res);
  });
	}
     $scope.getDetails = function(item){
         console.log("Getting Deatils.");
        // $window.location.reload(true)
      sharingService.getDataStore().currentClass = item;
        $scope.currentClass = item;
         $ionicScrollDelegate.scrollTop();
         
  };
})
.controller('ClassFinderCtrl', function ($scope, $http, $state,$ionicModal,$cordovaSocialSharing,$cordovaSQLite,$ionicLoading,sharingService,localStorage) {
    console.log("Details");
     
    $scope.emirates = emirates;
    $scope.days = loadCalendarDays();
    
    // $scope.currentEmirate = emirates[0];
    $scope.currentEmirate =  sharingService.getDataStore().currentEmirate;
    console.log(sharingService.getDataStore().currentEmirate);
    $scope.CurrentDay = 0;
    showLoading($ionicLoading);
   getEmirateClubs($scope, $http, emirates[0],null,$ionicLoading,$cordovaSQLite,sharingService,localStorage);
    $scope.getDetails = function(item){
      sharingService.getDataStore().currentClass = item;
      console.log(sharingService.getDataStore().currentClass);
      $state.go("app.class");
  }
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  
   $scope.showClasses = function(clubId) {
    
  };
 $scope.refreshClassesByDay = function(dayId,dayName) {
    
        $scope.CurrentDay = dayId;
        showLoading($ionicLoading);
        
         getEmirateClubs($scope, $http, $scope.currentEmirate,dayName,$ionicLoading,null,null,localStorage);
    };
     $scope.refreshClassesByRegion = function(region) {
       $scope.currentEmirate = region;
       showLoading($ionicLoading);
        getEmirateClubs($scope, $http, $scope.currentEmirate,loadCalendarDays()[$scope.CurrentDay].name,$ionicLoading,null,null,localStorage);
    };
})
.controller('SettingsCtrl', function ($scope, $http, $state,$ionicModal,$cordovaSocialSharing,$cordovaSQLite,$ionicLoading,sharingService,localStorage) {
})
.controller('CacheCtrl', function ($scope, $http, $state,$ionicModal,$cordovaSocialSharing,$cordovaSQLite,$ionicLoading,sharingService,localStorage) {
    $scope.$on( "$ionicView.beforeEnter", function( scopes, states ) {
        console.log("onEnter",localStorage.cacheEnabled());
        $scope.enableCache = {value:localStorage.cacheEnabled()};
    });
    
    $scope.updateCacheSetting=function(){
        localStorage.setCacheEnabled($scope.enableCache.value);
        console.log("LocalStorage vaue:",localStorage.cacheEnabled());
    };
    $scope.refreshCache = function (){
        console.log("Refreshing...");
        localStorage.refresh();
    }
    $scope.resetCache = function(){
        localStorage.reset();
        console.log("onReset",localStorage.cacheEnabled());
    }
});
