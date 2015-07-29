/*
front-end to the compiler
*/

var IR = (require('./IR'))(
  {
    filename: process.argv[2],
    ffi: ["@putchar", "@puts", "@getchar"]
  }
);

var meow = require("./meow").instance();
var backend = require("./backend");

backend.ffi["@putchar"] = [
  ["doIfElse",
    ["|", ["=", ["getParam", "param0", "r"], "13"], ["=", ["getParam", "param0", "r"], "10"]],
    [["append:toList:", "", "TTY"]],
    [["setLine:ofList:to:",
      ["lineCountOfList:", "TTY"],
      "TTY",
      ["concatenate:with:", ["getLine:ofList:", ["lineCountOfList:", "TTY"], "TTY"], ["letter:of:", ["+", ["getParam", "param0", "r"], 1], ["readVariable", "alphabet"]]]]]]
];

backend.ffi["@puts"] = [
  ["setVar:to:", "_temp0", 0],
  ["doUntil",
    ["=",
      ["getLine:ofList:", ["+", ["getParam", "param0", "r"], ["readVariable", "_temp0"]], "DATA"],
      "0"],
    [["call",
        "@putchar %s",
        ["getLine:ofList:", ["+", ["getParam", "param0", "r"], ["readVariable", "_temp0"]], "DATA"]],
      ["changeVar:by:", "_temp0", 1]]],
  ["call", "@putchar %s", 13]
];

backend.ffi["@getchar"] = [
  ["wait:elapsed:from:", 1],
  ["setVar:to:", "return value", 65]
];

var tty = new (require("./meow")).ListTuple("TTY");
tty.classicTTY();
meow.lists.push(tty);

meow.addList("Label Stack");

var rodata = new (require("./meow")).ListTuple(".rodata");
var rodataLength = 0;

IR.rootGlobal = {};

var rodataOffset = 1;

// TODO: respect constant status

for(var i = 0; i < IR.globals.length; ++i) {
  var global = IR.globals[i];

  if(Array.isArray(global.val)) {
    global.ptr = rodataLength + rodataOffset;
    rodataLength += global.val.length;
    rodata.contents = rodata.contents.concat(global.val);
  } else {
    global.ptr = rodataLength + rodataOffset;

    // we can just pretend that the native bytesize is GT or equal to this type size

    rodataLength += 1;
    rodata.contents = rodata.contents.concat([global.val]);
  }

  IR.rootGlobal[global.name] = global;
}

meow.lists.push(rodata);

var and4bit = new (require("./meow")).ListTuple("4-bit AND");

for(var i = 0; i < 256; ++i) {
  and4bit.contents.push(
    ((i & 0xF0) >> 4) & (i & 0x0F)
  );
}

meow.lists.push(and4bit);

var alphabet = "";
for(var i = 0; i < 256; ++i) {
  if(i >= 32 && i < 127) {
    c = String.fromCharCode(i);
    alphabet += c;
  } else {
    alphabet += ".";
  }
}

meow.addVariable("alphabet", alphabet);

for(var i = 0; i < IR.functions.length; ++i) {
  meow.addScript(backend.compileFunction(IR.functions[i], IR));
}

meow.addVariable("return value", 0);
meow.addVariable("_temp0", 0);

meow.addList("DATA");
meow.addVariable("sp");
meow.addVariable(".data");

var phi = new (require("./meow")).ListTuple("phi");
// prepopulate with zeroes
phi.contents = phi.contents.concat( [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] );
meow.lists.push(phi);

var dataSectionSize = 1024;

meow.addScript([
  ["whenGreenFlag"],

  ["deleteLine:ofList:", "all", "DATA"],
  ["setVar:to:", "i", "1"],
  ["doRepeat",
    dataSectionSize,
    [["append:toList:", ["*", ["getLine:ofList:", ["readVariable", "i"], ".rodata"], 1], "DATA"],
      ["changeVar:by:", "i", 1]]],
  ["setVar:to:", "sp", dataSectionSize - 1],
  ["setVar:to:", ".data", "1"],

  ["deleteLine:ofList:", "all", "Label Stack"],
  ["deleteLine:ofList:", "all", "TTY"],
  ["append:toList:", "", "TTY"],
  ["call", "@main"] // TODO: argc + argv
]);

if(process.argv.length === 5) {
    var data = meow.serialize();

    var prompt = require('prompt');
    prompt.start();
    prompt.get({
        properties: {
            password: {
                hidden: true
            }
        }
    }, function(err, result) {
        require('scratch-api').createUserSession(process.argv[3], result.password, function(err, user) {
            if (err) return console.error(err);
            user.setProject(process.argv[4], data, function(err) {
                if (err) return console.error(err);
            });
        })
    });
} else {
  console.log(JSON.stringify(meow.serialize()));
}
