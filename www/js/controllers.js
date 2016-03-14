angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) { 
})
.controller('ClubFinderCtrl', function ($scope,$http,$ionicPlatform, ClubFinderFactory,ReminderFactory) {
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
    console.log("Gettting all Reminders 101 ************************");
    try{
        ClubFinderFactory.loadAllClubs($scope);
         $ionicPlatform.ready(function() {
        console.log("Gettting all Reminders************************");
        console.log(JSON.stringify(ReminderFactory.getAllReminders()));
         });
    }catch(e){
        console.error(e);
    }
    
})

.controller('ClubCtrl', function ($scope,$state, ClassFinder,sharingService) {
    
    var clubId = $state.params.clubId;
    
    // Set Scope Data.
    $scope.days = loadCalendarDays();
    $scope.clubName = $state.params.clubName;
    $scope.CurrentDay  = 0;
    //Load Classes
    ClassFinder.loadClasses($scope,  clubId,[{id:clubId}],null,null);
    
    // Controller function definitions
 
    $scope.getDetails = function(item){
        sharingService.getDataStore().currentClass = item;
        console.log(sharingService.getDataStore().currentClass);
        $state.go("app.class");
    }
    
    $scope.refreshClasses = function(dayId,dayName) {
        $scope.CurrentDay = dayId;
        ClassFinder.loadClasses($scope,clubId ,[{id:clubId}],dayName,null);
    };
})

.controller('ClassCtrl', function ($scope,ClassFinder,sharingService ,$ionicPopup,$ionicScrollDelegate) {
    $scope.currentClass = sharingService.getDataStore().currentClass;
    $scope.hamada = $scope.currentClass.title;
    $scope.choice = {};
    $scope.choice.weekly = false;
    
    var popupTemplate = '<div class="list"> <ion-list> <ion-radio ng-model="choice.val" value="A">30 Minutes Before</ion-radio> <ion-radio ng-model="choice.val" value="B">1 Hour Before</ion-radio>'+
                '<ion-radio ng-model="choice.val" value="C">2 Hours Before</ion-radio> <ion-checkbox ng-model="choice.weekly">Weekly Repeate</ion-checkbox>'+
                '</ion-list>';
                
    $scope.whatsappShare = function (){
       ClassFinder.shareViaWhatsApp($scope.currentClass)
    };
    $scope.facebookShare = function (){
       ClassFinder.shareViaFacebook($scope.currentClass)
    };
     $scope.twitterShare = function (){
       ClassFinder.shareViaTwitter($scope.currentClass)
    };
    
    $scope.getDetails = function(item){
        console.log("Getting Deatils.");
        sharingService.getDataStore().currentClass = item;
        $scope.currentClass = item;
        $ionicScrollDelegate.scrollTop();
    };
    
    function setReminder(e){
        console.log($scope.choice);
        console.log(e);
        ClassFinder.doCreateAlarm($scope, $scope.currentClass);
    }
    
    $scope.remindMe = function ($event) {
        var myPopup = $ionicPopup.show({
            template: popupTemplate,
            title: 'Settings',
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Create</b>',type: 'button-positive',
                    onTap: setReminder
                }
            ]
        });
        myPopup.then(function(res) {
            console.log('Tapped!', res);
        });
    }
    /*
        FUNCTION CALLS
    */
    ClassFinder.loadOtherTiming($scope,$scope.currentClass.clubId,$scope.currentClass.classTypeTag);
})

.controller('ClassFinderCtrl', function ($scope,$state,$ionicLoading,sharingService,ClubFinderFactory) {
    $scope.emirates = emirates;
    $scope.days = loadCalendarDays();
    $scope.currentEmirate =  sharingService.getDataStore().currentEmirate;
    $scope.CurrentDay = 0;
    /*
        FUNCTION DEFINITION
    */
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

    $scope.refreshClassesByDay = function(dayId,dayName) {
        $scope.CurrentDay = dayId;
        showLoading($ionicLoading);
        ClubFinderFactory.getEmirateClubs($scope,$scope.currentEmirate,dayName);
    };
    $scope.refreshClassesByRegion = function(region) {
        $scope.currentEmirate = region;
        showLoading($ionicLoading);
        getEmirateClubs($scope, $scope.currentEmirate,loadCalendarDays()[$scope.CurrentDay].name);
    };
    /*
        FUNCTION CALLS
    */
    showLoading($ionicLoading);
    ClubFinderFactory.getEmirateClubs($scope,emirates[0],null);
})

.controller('SettingsCtrl', function ($scope,ReminderFactory) {
    $scope.showReminders = function(){
        console.log("Reminders 2..");
        ReminderFactory.getAllReminders();
        console.log(JSON.stringify(ReminderFactory.getAllReminders()));
    }
})
.controller('RemindersCtrl', function ($scope,ReminderFactory) {
    
    $scope.shouldShowDelete = false;
    $scope.toggleDelete = function (){
         $scope.shouldShowDelete = ! $scope.shouldShowDelete;
    }
    $scope.$on('$ionicView.beforeEnter', function(){ //This is fired twice in a row
        console.log("App view Reminder entered.");
        ReminderFactory.getAllReminders().then(function (result){
        
        console.log(result);
        try{
        for(var i=0;i<result.length;++i){
            result[i].data = JSON.parse(result[i].data);
        }
        }catch(err){
            console.error(err);
        }
        $scope.notifications = result;
    });
    });
    // $scope.notifications = [];
    //  $scope.notifications.push({title:'dummy',data:{title:'dummy title',timetext:'dummy time'}});
})

.controller('CacheCtrl', function ($scope, localStorage) {
    
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
