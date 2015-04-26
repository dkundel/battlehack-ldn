var InternetCtrl = function(API) {
  this.api = API;
  this.queryText = "";
  this.userText = "";
  this.provider = this.api.providers[0];
};

InternetCtrl.prototype.doRequest = function() {
  var self = this;
  this.api.getQuery(this.provider, this.userText, function(data) {
    self.queryText = data.content;
    console.log(data);
  });
}

var SmsCtrl = function(API) {
  this.api = API;
  this.queryText = "";
  this.userText = "";
  this.provider = this.api.providers[0];
};

SmsCtrl.prototype.sendSMS = function() {
  var self = this;
  this.api.getQuerySMS(this.provider, this.userText, function() {
    self.queryText = "SMS should arrive in any moment now!";
  },
  function(err) {
    self.queryText = err;
  });
}

angular.module('starter.controllers', ['ui.router'])
.controller('InternetCtrl', ['API', InternetCtrl])
.controller('SmsCtrl', ['API', SmsCtrl]);
