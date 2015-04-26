var InternetCtrl = function(API, Config) {
  this.api = API;
  this.config = Config;
  this.queryText = "";
  this.userText = "";
  this.provider = this.api.providers[0];
  this.useSMS = false;
};

InternetCtrl.prototype.doRequest = function() {
  if(this.config.useSMS) this.sendSMS();
  else this.sendHTML();
};

InternetCtrl.prototype.sendHTML = function() {
    var self = this;
    this.api.getQuery(this.provider, this.userText, function(data) {
      self.queryText = data.content;
      console.log(data);
    });
}

InternetCtrl.prototype.sendSMS = function() {
  var self = this;
  this.api.getQuerySMS(this.provider, this.userText, function() {
    self.queryText = "SMS should arrive in any moment now!";
  },
  function(err) {
    self.queryText = err;
  });
}

var PayCtrl = function(API, Config) {
  this.api = API;
  this.config = Config;
  this.amount = 0;
  this.payee = "";
  this.queryText = this.config.PAYEES[0];
};

PayCtrl.prototype.pay = function() {
  if(this.config.useSMS) this.paySMS();
  else this.payHTML();
}

PayCtrl.prototype.payHTML = function() {
    var self = this;
    this.api.pay(this.payee, this.amount, function(data) {
      self.queryText = data.content;
      console.log(data);
    });
}

PayCtrl.prototype.paySMS = function() {
  var self = this;
  this.api.paySMS(this.payee, this.amount, function() {
    self.queryText = "SMS should arrive in any moment now!";
  },
  function(err) {
    self.queryText = err;
  });
}

var ConfigCtrl = function(Config) {
  this.config = Config;
  this.tel = this.config.MY_PHONE;
  this.useSMS = this.config.USE_SMS;
};

ConfigCtrl.prototype.save = function() {
  this.config.MY_PHONE = this.tel;
  this.config.USE_SMS = this.useSMS;
  this.config.updatePayees();
}

angular.module('starter.controllers', ['ui.router'])
.controller('InternetCtrl', ['API', 'Config', InternetCtrl])
.controller('PayCtrl', ['API', 'Config', PayCtrl])
.controller('ConfigCtrl', ['Config', ConfigCtrl]);
