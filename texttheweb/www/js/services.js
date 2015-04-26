var ConfigService = function($http) {
  this.SERVER_BASE_URL = "http://honeybadger.ngrok.com/";
  this.PHONE_NUM = '+447903571441';
  this.MY_PHONE = '447858909938';
  this.USE_SMS = false;
  this.PAYEES = [];
  this.http = $http;
  this.updatePayees();
};

ConfigService.prototype.updatePayees = function() {
  var self = this;
  this.http({
    method: 'GET',
    url: this.SERVER_BASE_URL + 'api/queries/run',
    params: {
      Body: "Pay:Payees",
      From: this.MY_PHONE
    }
  }).
  success(function(data, status, headers, config) {
    self.PAYEES = data.content.split(',');
  }).
  error(function(data, status, headers, config) {
    console.error('ERROR API PAYEES');
  });
}

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
      name: 'Amazon',
      prefix: 'a'
    },
    {
      name: 'Yelp',
      prefix: 'y'
    },
    {
      name: 'Dictionary',
      prefix: 'd'
    },
    {
      name: 'Word Reference',
      prefix: 's'
    }
  ]
};

APIService.prototype.getQuery = function(provider, body, onSuccess, onError) {
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
    if(onError) onError('ERROR API QUERY');
    console.error('ERROR API QUERY');
  });
};

APIService.prototype.getQuerySMS = function(provider, body, onSuccess, onError) {
  this.sms.send(this.config.PHONE_NUM, provider.prefix + ":" + body)
  .then(function() {
    if(onSuccess) onSuccess();
  }, function(error) {
    console.error('ERROR SENDING SMS QUERY');
    if(onError) onError('ERROR SENDING SMS QUERY');
  });
};

APIService.prototype.pay = function(payee, amount, onSuccess, onError) {
  this.http({
    method: 'GET',
    url: this.config.SERVER_BASE_URL + 'api/queries/run',
    params: {
      Body: "Pay:" + payee + ":" + amount,
      From: this.config.MY_PHONE
    }
  }).
  success(function(data, status, headers, config) {
    if(onSuccess) onSuccess(data);
  }).
  error(function(data, status, headers, config) {
    if(onError) onError('ERROR API PAY');
    console.error('ERROR API PAY');
  });
};

APIService.prototype.paySMS = function(payee, amount, onSuccess, onError) {
  this.sms.send(this.config.PHONE_NUM, "Pay:" + payee + ":" + amount)
  .then(function() {
    if(onSuccess) onSuccess();
  }, function(error) {
    console.error('ERROR SENDING SMS PAY');
      if(onError) onError('ERROR SENDING SMS PAY');
  });
};

angular.module('starter.services', ['ui.router'])
.service('Config', ['$http', ConfigService])
.service('API', ['$http', '$cordovaSms', 'Config', APIService]);
