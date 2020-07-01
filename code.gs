// Uses OAuth library 
// Add from menu Resources\Libraries... by id: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF


var CLIENT_ID = '48759';
var CLIENT_SECRET = 'ce5651b5b7badf11dc44e16d33c509033025d0c0';

// First time - run onOpen()

// custom menu
function install() { 
  onOpen();
}

function onOpen() {
  var ui = DocumentApp.getUi();

  ui.createMenu('Strava App')
    .addItem('Sync data', 'scanTable')
    .addToUi();

  var service = getStravaService();
  //service.reset();
  if (!service.hasAccess()) {
    Logger.log("App has no access yet.");
    
    // open this url to gain authorization from github
    var authorizationUrl = service.getAuthorizationUrl();
    showAuthDialog(authorizationUrl);
    
    Logger.log("Open the following URL and re-run the script: %s",
        authorizationUrl);
  }
}

function scanTable() {
  var d=DocumentApp.getActiveDocument();
  var body=d.getBody();
  var numChildren=body.getNumChildren();
  
  var activities = getActivities(new Date().getTime()/1000-31*24*60*60, new Date().getTime()/1000); //from last 31 day
  //Logger.log(activities);
  
  for(var i=0;i<numChildren;i++) { 
    var child=body.getChild(i);
    if(child.getType()==DocumentApp.ElementType.TABLE) {
      var table = child.asTable();
      var numRows=table.getNumRows();
      for(var ri=0;ri<numRows;ri++) {
        var row=table.getRow(ri);
        var strDate = row.getCell(0).getText() ;
        var parts = strDate.split('.');
        var date = new Date(Date.UTC(parts[2],parts[1]-1,parts[0]));
        
        Logger.log('Date: %s %s',strDate, date);
        var activity = findActivityForDate(activities, date);
        Logger.log(activity);
        Logger.log(activity.id);
        
        if (activity.id) {
          //var descriprion = '<a href="https://www.strava.com/activities/'+activity.id+'">c</a>\n';
          row.getCell(2).clear();
          var text = row.getCell(2).editAsText();
          
          var title = activity.type+' - '+  activity.name+'\n';
          var descriprion = 'Дистанция: '+(activity.distance/1000).toFixed(1)+'км, время:'+ Math.floor(activity.elapsed_time/60/60)+":"+Math.floor(activity.elapsed_time/60%60)+'ч\n';
          descriprion += 'ЧСС сред. '+ activity.average_heartrate+', макс. '+ activity.max_heartrate+'\n';
          descriprion += 'Темп сред. '+ speedToPace(activity.average_speed)+'/км, макс. '+ speedToPace(activity.max_speed)+'/км \n';
          descriprion += 'Скорость сред. '+ speedToKmh(activity.average_speed).toFixed(1)+'км/ч, макс. '+ speedToKmh(activity.max_speed).toFixed(1)+' км/ч \n';
          descriprion += '\n'+activity.description+'\n';
          
          
          text.setText(title)
            .setLinkUrl('https://www.strava.com/activities/'+activity.id);
          text
            .appendText(descriprion);
        }
      }
    }
  }
  
}

function speedToKmh(speedMS) {
  return speedMS*3.6;
}

function speedToPace(speedMS) {
  var pace = 50/3/speedMS;
  return Math.floor(pace)+':'+Math.round(pace*60%60).toString().padStart(2, '0');
}


function findActivityForDate(activities, date){
  var found = {};
  
   activities.forEach(function(activity) {
     if (activity.start_date_local.substring(0, 10) == date.toISOString().substring(0,10)) {
       Logger.log('Found date: %s ? %s', activity.start_date_local , date.toISOString());
       found = getActivityDetailsAPI(activity.id);
     }
   });
   return found;
}

// call the Strava API
function getActivities(dateFrom, dateTo) {
  
  // set up the service
  var service = getStravaService();
   if (!service.hasAccess()) {
    Logger.log("App has no access yet.");
    
    // open this url to gain authorization from github
    var authorizationUrl = service.getAuthorizationUrl();
    showAuthDialog(authorizationUrl);
    
    Logger.log("Open the following URL and re-run the script: %s",
        authorizationUrl);
     return;
  }
  
  if (service.hasAccess()) {
    Logger.log('App has access.');
    
    var endpoint = 'https://www.strava.com/api/v3/athlete/activities';
    var params = '?after='+dateFrom+'&before='+dateTo+'&per_page=200';
    
    var headers = {
      Authorization: 'Bearer ' + service.getAccessToken()
    };
    
    var options = {
      headers: headers,
      method : 'GET',
      muteHttpExceptions: true
    };
    
    Logger.log('%s \n%s', endpoint + params, options);
    var httpResponse = UrlFetchApp.fetch(endpoint + params, options);
    var responseCode = httpResponse.getResponseCode()
    Logger.log(responseCode);
    
    if (responseCode == 401) { // service.hasAccess() doesn't check all cases, so 401 is possible 
      Logger.log('Need Strava authorisation');
      showAuthDialog(service.getAuthorizationUrl());
      return;
    }
    
    var response = JSON.parse(httpResponse);
    
    //Logger.log(response);
    return response;
    
  } else {
    Logger.log("App has no access yet.");
    
    // open this url to gain authorization from github
    var authorizationUrl = service.getAuthorizationUrl();
    
    Logger.log("Open the following URL and re-run the script: %s",
        authorizationUrl);
  }
  
}

// call the Strava API
function getActivityDetailsAPI(id) {
  
  // set up the service
  var service = getStravaService();
  
  if (service.hasAccess()) {
    
    var endpoint = 'https://www.strava.com/api/v3/activities/'+id;
    Logger.log('details '+id+' request: '+endpoint);
    
    var headers = {
      Authorization: 'Bearer ' + service.getAccessToken()
    };
    
    var options = {
      headers: headers,
      method : 'GET',
      muteHttpExceptions: true
    };
    
    var response = JSON.parse(UrlFetchApp.fetch(endpoint, options));
    Logger.log(response);
    
    return response;
    
  }
  else {
    Logger.log("App has no access yet.");
    
    // open this url to gain authorization from github
    var authorizationUrl = service.getAuthorizationUrl();
    showAuthDialog(authorizationUrl);
    Logger.log("Open the following URL and re-run the script: %s",
        authorizationUrl);
  }
}


// configure the service
function getStravaService() {
  return OAuth2.createService('Strava')
    .setAuthorizationBaseUrl('https://www.strava.com/oauth/authorize')
    .setTokenUrl('https://www.strava.com/oauth/token')
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('activity:read_all');
}

// handle the callback
function authCallback(request) {
  var stravaService = getStravaService();
  var isAuthorized = stravaService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function showAuthDialog(authUrl) {
  var page = '<a href="'+authUrl+'" target="_blank">Login to Strava</a> and try again<br><br>';
  page += '<input type="button" value="Close" onclick="google.script.host.close()" />';
  
  var html = HtmlService.createHtmlOutput(page)
      .setWidth(400)
      .setHeight(100);
  DocumentApp.getUi().showModalDialog(html, 'Strava login');
}
