function ClubFinder($scope, $http,$cordovaSQLite,sharingService,localStorage,$cordovaNetwork,$ionicPopup){
    
    
    this.loadAllClubs = function(){
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
}