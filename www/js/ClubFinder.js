angular.module('starter.services')
.factory('ClubFinderFactory', ['$http','localStorage','$cordovaNetwork',
    '$ionicPopup','$ionicLoading','sharingService','ClassFinder'
    ,function ( $http,localStorage,$cordovaNetwork,$ionicPopup,$ionicLoading,sharingService,ClassFinder) {
        // var ClassFinder = {};
        var clubsApiUrl = baseUrl+"classes/timetable/Clubs.json";
        
        
        var __debug = true;
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
        function loadEmirateClubsFromApi($scope,emirate,day,data){
            for(var i =0;i<data.length;++i){
                if(data[i].region === emirate.region ){
                    $scope.clubs.push({clubId:data[i].id,id:data[i].id,clubName:data[i].name});
                }
            }
            var clubString = getClubStringList($scope.clubs);
            ClassFinder.loadClasses($scope,clubString,$scope.clubs,day,groupByClassType);
        }
        function loadAllClubsFromApi($scope,data){
            var clubs = [];
            for(var i =0;i<data.length;++i){
                for(var j=0;j<data[i].clubs.length;++j){
                    ClassFinder.loadClubClasses($scope,data[i].clubs[j].id,[data[i].clubs[j]]);
                    clubs.push(data[i].clubs[j]);
                }
            }
            // var clubString = getClubStringList(clubs);
            
        }
        return {
            loadAllClubs : function($scope){
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
                            loadAllClubsFromApi($scope,$scope.cities);
                        }
                    },function(err){
                        console.log("err",JSON.stringify(err));
                    });
                }else{
                    loadClubsFromApi($scope,$scope.cities);
                }
                console.log("after getting live data");
            },
            getEmirateClubs : function ($scope,emirate,day){
                if(localStorage.clubs().length == 0 ){
                    var myurl = clubsApiUrl;
                    $scope.clubs = [];
                    $http({method: 'GET',url: myurl}).success(function (data, status) {
                        if(data != null && data != undefined){
                            loadEmirateClubsFromApi($scope,emirate,day,data);
                            localStorage.setClubs(data);
                        }
                    });
                }else{
                    $scope.clubs =[];
                    loadEmirateClubsFromApi($scope,emirate,day,localStorage.clubs());
                }
                return  $scope.clubs;
            }
    }
}])
