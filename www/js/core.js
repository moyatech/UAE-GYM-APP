(function () {
	var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
	Date.prototype.getDayName = function () {
		return days[this.getDay()];
	};
})();
var country = "uae";
var lang = "en-GB"
var baseUrl = "http://www.fitnessfirstme.com/"+lang+"/"+country+"/";

var clubsApiUrl = baseUrl+"classes/timetable/Clubs/";

var __debug = false;

function loadClubs($scope, $http,$cordovaSQLite,sharingService,localStorage,$cordovaNetwork,$ionicPopup) {
    if(__debug)
        console.log("Loading Clubs");
    $scope.cities = localStorage.clubs();
    if(__debug)
        console.log("Checking Local Storage , Found "+$scope.cities.length);
    console.log("Cordova Network :" + $cordovaNetwork);
    // console.log("Cordova Network, Is Offline :" + $cordovaNetwork.isOffline());
    
    
    if( $scope.cities.length == 0){   
         
        if(__debug)
            console.log("Loading Live Data from URL: "+clubsApiUrl);
        var myurl = clubsApiUrl;
        $http({method: 'GET',url: myurl}).then(function (resp) {
            loadClubsFromApi($scope,resp.data);
            if(__debug)
                console.log("Loading All Classes");
            
            localStorage.setClubs(resp.data);
            
            if(localStorage.cacheEnabled()){
                loadAllClubsFromApi($scope,$http,null,$scope.cities,localStorage);
            }
        },function(err){
            console.log("err",JSON.stringify(err));
        });
    }else{
        loadClubsFromApi($scope,$scope.cities);
    }
    console.log("after getting live data");
}

function loadClubsFromApi($scope,data){
        
    console.log("loadig classes");
    $scope.clubs = data;
    $scope.cities = [];
    var tmpCities = [];
    for(var i=0;i<data.length;++i){
        if( tmpCities[data[i].region] == undefined || tmpCities[data[i].region] == null){
            tmpCities[data[i].region] = {name: data[i].region,clubs:[]}
        }
        tmpCities[data[i].region].clubs.push({name:data[i].name,id:data[i].id}); 
    }

    for(var item in tmpCities){
        $scope.cities.push(tmpCities[item]);
    }
    console.log("cities",$scope.cities);
    return  $scope.cities;
            
}
function saveForLater(){
    // try{
    //             var query = "update kvstore set ivalue = ? where ikey = ?";
    //             var  db = $cordovaSQLite.openDB("my.db",1 );
    //             $cordovaSQLite.execute(db, query, ['cache',JSON.stringify( $scope.cities)]).then(function(res) {
    //                 console.log("result: " ,JSON.stringify( res));
    //             }, function (err) {
    //                 console.error("err",JSON.stringify(err));
    //             });
    //         }catch(e){}
}



function loadClasses($scope, $http,club,clubArr,date,next,$ionicLoading,$cordovaSQLite,sharingService,localStorage) {
	
    console.log("Loading classes");
    if(!isCached(clubArr,localStorage)){
        var myurl = "http://www.fitnessfirstme.com/en-GB/uae/classes/timetable/ClassTimes";
        $http({
            method: 'POST',
            url: myurl,data:{'clubs':club}}).success(function (data, status) {
            $scope.classes = [];
            if(data != null && data != undefined){
                loadClassesFromApi($scope, $http,$ionicLoading,date,data,next)
                localStorage.setClasses(club, data);
            }
        });
    }else{
        // $scope, $http,$ionicLoading,localStorage,date,clubArr,next
       loadClassesFromCache($scope, $http,$ionicLoading,localStorage,date,clubArr,next)
    }
}

function isCached(clubArr,localStorage){
    for(var i=0;i<clubArr.length;++i){
        if(localStorage.classes(clubArr[i].id).length == 0)
            return false;
    }
    return true;
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

function groupByClassType($scope,$http,$ionicLoading){
    $scope.groupedClasses = [];
    var tmp = [];
    for(var i=0;i<$scope.classes.length;++i){
        if(tmp[$scope.classes[i].title] == undefined || tmp[$scope.classes[i].title] == null){
            tmp[$scope.classes[i].title] = {name: $scope.classes[i].title,classes:[]};
        }
        tmp[$scope.classes[i].title].classes.push($scope.classes[i]);
    }
    for(var group in tmp){
        $scope.groupedClasses.push(tmp[group]);
    }
    if($ionicLoading != null)
    $ionicLoading.hide();
}

function getEmirateClubs($scope, $http,emirate,day,$ionicLoading,$cordovaSQLite,sharingService,localStorage){
    if(localStorage.clubs().length == 0 ){
        var myurl = "http://www.fitnessfirstme.com/en-GB/uae/classes/timetable/Clubs/"
        $scope.clubs = [];
        $http({method: 'GET',url: myurl}).success(function (data, status) {
            if(data != null && data != undefined){
                loadEmirateClubsFromApi($scope,$http,$ionicLoading,emirate,day,data,$cordovaSQLite,sharingService,localStorage);
                localStorage.setClubs(data);
            }
        });
    }else{
        $scope.clubs =[];
        loadEmirateClubsFromApi($scope,$http,$ionicLoading,emirate,day,localStorage.clubs(),$cordovaSQLite,sharingService,localStorage);
    }
    return  $scope.clubs;
}
function loadEmirateClubsFromApi($scope,$http,$ionicLoading,emirate,day,data,$cordovaSQLite,sharingService,localStorage){
    for(var i =0;i<data.length;++i){
        if(data[i].region === emirate.region ){
            $scope.clubs.push({clubId:data[i].id,id:data[i].id,clubName:data[i].name});
        }
    }
    var clubString = getClubStringList($scope.clubs);
    loadClasses($scope,$http,clubString,$scope.clubs,day,groupByClassType,$ionicLoading,$cordovaSQLite,sharingService,localStorage);
}

function loadAllClubsFromApi($scope,$http,$ionicLoading,data,localStorage){
    var clubs = [];
    for(var i =0;i<data.length;++i){
        for(var j=0;j<data[i].clubs.length;++j){
            loadClubClasses($scope,$http,data[i].clubs[j].id,[data[i].clubs[j]],$ionicLoading,localStorage);
            clubs.push(data[i].clubs[j]);
        }
    }
    // var clubString = getClubStringList(clubs);
    
}
function loadClubClasses($scope, $http,clubStr,clubs,$ionicLoading,localStorage) {
    console.log("Loading classes");
    var obj = {};
    var myurl = "http://www.fitnessfirstme.com/en-GB/uae/classes/timetable/ClassTimes";
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
}


function getClubStringList(clubArr){
    var list= "1"
    for(var i =0;i<clubArr.length;++i){
        if(clubArr[i].clubId != undefined)
            list=list+","+clubArr[i].clubId;
        else
            list=list+","+clubArr[i].id;
    }
    return list;
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
function fillClasses(timespan,targetArr){
    for(var j=0;j<timespan.classes.length;++j){
        timespan.classes[j].day = timespan.day;
        timespan.classes[j].dayShort = timespan.dayShort;
        targetArr.push(timespan.classes[j]);
    }
}

function loadCalendarDays() {
	var today = new Date();
	var day1 = { "id": 0, "name": "Today" };
	var days = [];
	days.push(day1);

	for (var i = 1; i < 7 ; i++) {
		today.setDate(today.getDate() + 1);
		var day = { "id": i, "name": today.getDayName() };
		days.push(day);
	}
	return days;
}
function showLoading($ionicLoading) {
	var msg = 'loading';
	// try {
	// 	if (!isNull(MSG))
	// 		msg = MSG[USER_LANG].LOADING;
	// } catch (e) {

	// }
	$ionicLoading.show({
		template: '<div >' + msg + '<br/><ion-spinner icon="lines" class="spinner-energized"></ion-spinner></div>',
		duration: 10000
	});
}
function isNull(varVal) {
	return !varVal || varVal == null || varVal == undefined || varVal == '';
}

function loadOtherTiming($scope,$http,club,clazz,localStorage){
    $scope.times = [];
    if(localStorage.classes(club).length == 0){
        var myurl = "http://www.fitnessfirstme.com/en-GB/uae/classes/timetable/ClassTimes";
        $http({
            method: 'POST',
            url: myurl,data:{'clubs':club,'classes':clazz}}).success(function (data, status) {
            if(data != null && data != undefined){
                loadClassTimesFromApi($scope,data);
                // localStorage.setClasses(data);
            }
        });
    }else{
        loadClassTimesFromApi($scope,localStorage.classes(club),club,clazz);
    }
    console.log( $scope.times);
}
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
function appAlert($ionicPopup, head, msg) {
	$ionicPopup.alert({
		title: head,
		template: msg
	});
}
function getAlarmDate(programItem) {
	return new Date(new Date(programItem.start).getTime() - 10 * 60 * 1000);
}

function createStartString(timeText) {
	var index = timeText.indexOf("-");
	
	return timeText.substring(0, index);
}

function remindMe($scope, sharingService, $cordovaLocalNotification, clazz, $ionicPopup) {
	doCreateAlarm($scope, sharingService, $cordovaLocalNotification, clazz, $ionicPopup);
}
function doCreateAlarm($scope, sharingService, $cordovaLocalNotification, clazz, $ionicPopup) {
	try {

		var alarmTime = moment(clazz.startTimestamp,"YYYYMMDDHHmm");
        if($scope.choice.val === 'A')
            alarmTime.subtract(30, 'minute');
        if($scope.choice.val === 'B')
            alarmTime.subtract(1, 'hour');
        if($scope.choice.val === 'C')
            alarmTime.subtract(2, 'hour');
            
        console.log(alarmTime.toDate());
        console.log(clazz.startTimestamp);
            
		var alarmOptions = {
			id: clazz.classId,
			at: alarmTime.toDate(),
			message: clazz.title + ' will start at ' + createStartString(clazz.timeText),
			title: "Fitness First",
			badge: 1,
            // every: $scope.choice.weekly?'week':'0',
			data:  clazz.classId
		};
		$cordovaLocalNotification.schedule(alarmOptions, $scope).then(function () {
			appAlert($ionicPopup, 'You will be alerted at',alarmTime.toDate());
		});
	} catch (e) {
		appAlert($ionicPopup, 'error creating alarm', e.message);
	}
}


    //{region:'Umm Al Quwain',code:'UAQ'};
