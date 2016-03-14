angular.module('starter.services')
.factory('ClassFinder', ['$http','localStorage','$cordovaNetwork',
    '$ionicPopup','sharingService','$ionicLoading','$cordovaSocialSharing','$cordovaLocalNotification'
    ,function ( $http,localStorage,$cordovaNetwork,$ionicPopup,sharingService,
    $ionicLoading,$cordovaSocialSharing,$cordovaLocalNotification) {
        var apiUrl = "http://www.fitnessfirstme.com/en-GB/uae/classes/timetable/ClassTimes";
        
        function loadClassTimesFromApi($scope,data,club,clazz){
            getClassTimes(data.morning, $scope.times,null,club,clazz);
            getClassTimes(data.afternoon, $scope.times,null,club,clazz);
            getClassTimes(data.evening, $scope.times,null,club,clazz);
        }
        function getClassTimes(timespan,targetArr,date,club,clazz){
            for(var i=0;i<timespan.length;++i){
                for(var j=0;j<timespan[i].classes.length;++j){
                    if((club != undefined && club != null &&  timespan[i].classes[j].clubId != club)
                    || clazz != undefined && clazz != null &&  timespan[i].classes[j].classTypeTag != clazz)
                        continue;
                    targetArr.push(timespan[i].classes[j]);
                    timespan[i].classes[j].dayShort = timespan[i].dayShort;
                    timespan[i].classes[j].day = timespan[i].day;
                }
            }
        }
        /*
        * Emulate single call for a club..
        */
        function loadAllClassesFromApi(allClubs,$ionicLoading,data){
                var allClubsClasses= {};
                for(var i=0;i<allClubs.length;++i){
                    var currentClub = allClubs[i].id;
                    allClubsClasses[currentClub] = {};
                    for(var timespan in data){
                        if(timespan != 'morning' && timespan != 'afternoon' && timespan != 'evening')
                            continue;
                        allClubsClasses[currentClub][timespan] = JSON.parse(JSON.stringify(data[timespan]));
                        var currentTimespan = allClubsClasses[currentClub][timespan]
                        for(var z=0;z<currentTimespan.length;++z){
                            var myClassesOnly = [];
                            var classes = currentTimespan[z].classes;
                            for(var j=0;j<classes.length;++j){
                                if(classes[j].clubId === currentClub){
                                    myClassesOnly.push(classes[j]);
                                }
                            }
                            currentTimespan[z].classes = myClassesOnly;
                        }
                    }
                }
                return allClubsClasses;
        }
        function fillClasses(timespan,targetArr){
            for(var j=0;j<timespan.classes.length;++j){
                timespan.classes[j].day = timespan.day;
                timespan.classes[j].dayShort = timespan.dayShort;
                targetArr.push(timespan.classes[j]);
            }
        }
        function getClasses(timespan,targetArr,date){
            if(date == undefined || date == null || 'Today' === date){
                date = new Date().getDayName();
            }
            for(var i=0;i<timespan.length;++i){
                if(timespan[i].dayShort.toUpperCase()  === date.toUpperCase()){
                fillClasses(timespan[i],targetArr);
                }
            }
        }
        function loadClassesFromApi($scope, $http,$ionicLoading,date,data,next){
                getClasses(data.morning, $scope.classes,date);
                getClasses(data.afternoon, $scope.classes,date);
                getClasses(data.evening, $scope.classes,date);
                if(next != null){
                    next($scope, $http,$ionicLoading);
                }
        }
        function loadClassesFromCache($scope, $http,$ionicLoading,localStorage,date,clubArr,next){
                $scope.classes = [];
                for(var i=0;i<clubArr.length;++i){
                    var data = {};
                    data = localStorage.classes(clubArr[i].id);
                    getClasses(data.morning, $scope.classes,date);
                    getClasses(data.afternoon, $scope.classes,date);
                    getClasses(data.evening, $scope.classes,date);
                }
                if(next != null){
                    next($scope, $http,$ionicLoading);
                }
        }
        return {
            loadClasses : function ($scope,club,clubArr,date,next) {
                console.log("Loading classes");
                if(!isCached(clubArr,localStorage)){
                    var myurl = apiUrl;
                    $http({method: 'POST',url: myurl,data:{'clubs':club}})
                        .success(function (data, status) {
                            $scope.classes = [];
                            if(data != null && data != undefined){
                                loadClassesFromApi($scope, $http,$ionicLoading,date,data,next)
                                localStorage.setClasses(club, data);
                            }
                        });
                }else{
                    loadClassesFromCache($scope, $http,$ionicLoading,localStorage,date,clubArr,next)
                }
            },
            loadOtherTiming : function ($scope,club,clazz){
                $scope.times = [];
                if(localStorage.classes(club).length == 0){
                    var myurl = apiUrl;
                    $http({
                        method: 'POST',
                        url: myurl,data:{'clubs':club,'classes':clazz}}).success(function (data, status) {
                        if(data != null && data != undefined){
                            loadClassTimesFromApi($scope,data);
                        }
                    });
                }else{
                    loadClassTimesFromApi($scope,localStorage.classes(club),club,clazz);
                }
                console.log( $scope.times);
            },
            loadClubClasses : function ($scope, clubStr,clubs) {
                console.log("Loading classes");
                var obj = {};
                var myurl = apiUrl;
                $http({
                    method: 'POST',
                    url: myurl,data:{'clubs':clubStr}}).success(function (data, status) {
                    $scope.classes = [];
                    if(data != null && data != undefined){
                        // loadClassesFromApi(obj, null,$ionicLoading,null,data,null);
                        obj = loadAllClassesFromApi(clubs,$ionicLoading,data);
                        for(var club in obj){
                            localStorage.setClasses(club, obj[club]);
                        }
                        console.log("All Classes Loaded");
                    }
                });    
            },
            doCreateAlarm : function($scope, clazz) {
                try {
                    var alarmTime = moment(clazz.startTimestamp,"YYYYMMDDHHmm");
                    var slots = clazz.timeText.split('-');
                    if(slots[0].indexOf('PM') != -1)
                        alarmTime.add(12,'hour');
                    if($scope.choice.val === 'A')
                        alarmTime.subtract(30, 'minute');
                    if($scope.choice.val === 'B')
                        alarmTime.subtract(1, 'hour');
                    if($scope.choice.val === 'C')
                        alarmTime.subtract(2, 'hour');
                        
                    console.log(alarmTime.toDate());
                    console.log(clazz.startTimestamp);
                    clazz.at = alarmTime.toDate();
                    var alarmOptions = {
                        id: clazz.classId,
                        at: alarmTime.toDate(),
                        message: clazz.title + ' will start at ' + createStartString(clazz.timeText),
                        title: "Fitness First",
                        badge: 1,
                        // every: $scope.choice.weekly?'week':'0',
                        data:  clazz
                    };
                    $cordovaLocalNotification.schedule(alarmOptions).then(function () {
                        console.error("Could set Alaram");
                        appAlert($ionicPopup, 'You will be alerted at',alarmTime.toDate());
                    });
                } catch (e) {
                    console.error("Couldn't set Alaram");
                    console.error(e);
                    appAlert($ionicPopup, 'error creating alarm', e.message);
                }
            },
            shareViaWhatsApp : function (currentClass){
                $cordovaSocialSharing.shareViaWhatsApp("I'm attending Class: "+ currentClass.title +"at "+ currentClass.timeText, null, null)
                .then(function(result) {
                console.log("success"+result);
                }, function(err) {
                // An error occurred. Show a message to the user
                    console.log("err"+err);
                });
            },
            shareViaFacebook : function (currentClass){
                $cordovaSocialSharing.shareViaFacebook("I'm attending Class: "+ currentClass.title +"at "+ currentClass.timeText, null, "http://fitnessfirstme.com")
                .then(function(result) {
                console.log("success"+result);
                }, function(err) {
                // An error occurred. Show a message to the user
                    console.log("err"+err);
                });
            },
            shareViaTwitter : function (currentClass){
                $cordovaSocialSharing.shareViaTwitter("I'm attending Class: "+ currentClass.title +"at "+ currentClass.timeText, null, null)
                .then(function(result) {
                console.log("success"+result);
                }, function(err) {
                // An error occurred. Show a message to the user
                    console.log("err"+err);
                });
            }
        }    
        
    }]);