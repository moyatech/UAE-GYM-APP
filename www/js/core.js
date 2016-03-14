(function () {
	var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
	Date.prototype.getDayName = function () {
		return days[this.getDay()];
	};
})();
var country = "uae";
var lang = "en-GB"
var baseUrl = "http://www.fitnessfirstme.com/"+lang+"/"+country+"/";

var __debug = false;

function isGroupShown ($scope,group) {
    return $scope.shownGroup === group;
};

function isCached(clubArr,localStorage){
    for(var i=0;i<clubArr.length;++i){
        if(localStorage.classes(clubArr[i].id).length == 0)
            return false;
    }
    return true;
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
	$ionicLoading.show({
		template: '<div >' + msg + '<br/><ion-spinner icon="lines" class="spinner-energized"></ion-spinner></div>',
		duration: 10000
	});
}
function isNull(varVal) {
	return !varVal || varVal == null || varVal == undefined || varVal == '';
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