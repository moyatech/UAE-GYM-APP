angular.module('starter.services')
.factory('ReminderFactory', ['$http','localStorage','$cordovaNetwork',
    '$ionicPopup','sharingService','$ionicLoading','$cordovaSocialSharing','$cordovaLocalNotification'
    ,function ( $http,localStorage,$cordovaNetwork,$ionicPopup,sharingService,
    $ionicLoading,$cordovaSocialSharing,$cordovaLocalNotification) {
        
        return{
            createReminder : function(reminderTime,reminderId,reminderTitle, reminderMessage,isWeekly) {
                    try {       
                        var alarmOptions = {
                            id: reminderId,
                            at: reminderTime,
                            message:reminderMessage,
                            title: reminderTitle,
                            badge: 1,
                             every:isWeekly?'week':'0',
                            data:  reminderId
                        };
                        return $cordovaLocalNotification.schedule(alarmOptions)
                    } catch (e) {
                        return null;
                    }
            },
            getAllReminders : function (){
                console.log("Getting all remindersss.....");
                  return $cordovaLocalNotification.getAllScheduled();
            }
                
        }
        
    }]);
    
    /*
    {"badge":1,"id":47414,"data":"47414","title":"Fitness First","text":"CORB will start at 8:00AM ","at":1457492400,"sound":"res://platform_default"}
    */