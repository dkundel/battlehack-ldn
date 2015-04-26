var ConfigService = function() {
  this.SERVER_BASE_URL = "http://honeybadger.ngrok.com/";
  this.PHONE_NUM = '+447903576934';
};

var APIService = function($http, $cordovaSms, Config) {
  this.http = $http;
  this.sms = $cordovaSms;
  this.config = Config;
  this.providers = [
    {
      name: 'Wikipedia',
      prefix: 'w'
    },
    {
      name: 'Google',
      prefix: 'g'
    },
    {
      name: 'Yelp',
      prefix: 'y'
    }
  ]
};

APIService.prototype.getQuery = function(provider, body, onSuccess) {
  this.http({
    method: 'GET',
    url: this.config.SERVER_BASE_URL + 'api/queries/run',
    params: {
      Body: provider.prefix + ":" + body
    }
  }).
  success(function(data, status, headers, config) {
    if(onSuccess) onSuccess(data);
  }).
  error(function(data, status, headers, config) {
    console.error('ERROR API QUERY');
  });
};

APIService.prototype.getQuerySMS = function(provider, body, onSuccess, onError) {
  this.sms.send(this.config.PHONE_NUM, provider.prefix + ":" + body)
  .then(function() {
    if(onSuccess) onSuccess();
  }, function(error) {
    console.error('ERROR SENDING SMS');
      if(onError) onError(error);
  });
};

angular.module('starter.services', ['ui.router'])
.service('Config', [ConfigService])
.service('API', ['$http', '$cordovaSms', 'Config', APIService]);
