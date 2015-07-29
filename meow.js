/*
maintains a Scratch project in memory,
with JSON serialization support
*/

var http = require('http');

function Meow() {
  this.scripts = [];
  this.lists = [];
  this.variables = [];
}

Meow.prototype.serialize = function() {
  // I extracted this from the Scratch Wiki; when it breaks, you can blame veggie

  return {
    "lists": this.lists,
    "variables": this.variables,
    "objName": "Stage",
    "costumes": [{
      "costumeName": "backdrop1",
      "baseLayerID": 1,
      "baseLayerMD5": "510da64cf172d53750dffd23fbf73563.png",
      "bitmapResolution": 1,
      "rotationCenterX": 240,
      "rotationCenterY": 180
    }],
    "currentCostumeIndex": 0,
    "penLayerMD5": "279467d0d49e152706ed66539b577c00.png",
    "tempoBPM": 60,
    "videoAlpha": 0.5,
    "scripts" : this.scripts,
    "children": [],
    "info": {
      "scriptCount": 0,
      "flashVersion": "MAC 11,8,800,94",
      "spriteCount": 0,
      "swfVersion": "v341",
      "videoOn": false,
      "projectID": "11175527",
      "userAgent": "Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/30.0.1552.0 Safari\/537.36",
      "hasCloudData": false
    }
  };
};

Meow.prototype.addScript = function(blocks) {
  this.scripts.push(new ScriptTuple(blocks, this.scripts.length * 950, 0));
};

Meow.prototype.addList = function(name) {
  this.lists.push(new ListTuple(name));
};

Meow.prototype.addVariable = function(name, value) {
  this.variables.push(new VariableTuple(name, value));
};

function ScriptTuple(blocks, x, y) {
  this.blocks = blocks || [];
  this.x = x || 0;
  this.y = y || 0;
}

ScriptTuple.prototype.toJSON = function() {
  return [this.x, this.y, this.blocks];
};

function ListTuple(name) {
  this.listName = name;
  this.contents = [];
  this.isPersistent = false;
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.visible = false;
}

ListTuple.prototype.classicTTY = function() {
  this.x = 5;
  this.y = 5;
  this.width = 470;
  this.height = 350;
  this.visible = true;
};

function VariableTuple(name, value) {
  this.name = name;
  this.value = value;
  this.isPersistent = false;
}

module.exports.ListTuple = ListTuple;

module.exports.instance = function() {
  return (new Meow());
};
