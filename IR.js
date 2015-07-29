// parses LLVM IR code

var fs = require('fs');

var regexs = {
  define: /^define ([^ ]+) ([^\(]+)\(([^\)]*)\)([^{]+){/,
  declare: /^declare ([^ ]+) ([^\(]+)\(([^\)]*)\)/,
  newType: /^([^ ]+) = type \{([^\}]+)\}$/,

  call: /^\s*(tail )?call ([^@]+) ([^\(]+)\((.+)/,
  ret: /^\s*ret (.+)/,

  alloca: /^\s*alloca (.+)/,
  store: /^\s+store ([^ ]+) ([^,]+), ([^ ]+) ([^,]+)/,

  load: /^load ([^ ]+) (.+)/,
  add: /^add ([^ ]+) ([^,]+), (.+)/,
  sub: /^sub ([^ ]+) ([^,]+), (.+)/,
  mul: /^mul ([^ ]+) ([^,]+), (.+)/,
  div: /^(s)?div ([^ ]+) ([^,]+), (.+)/,
  srem: /^srem ([^ ]+) ([^,]+), (.+)/,
  icmp: /^icmp ([^ ]+) ([^ ]+) ([^,]+), (.+)/,
  sext: /^sext i(\d+) ([^ ]+) to i(\d+)/,
  getelementptr: /^getelementptr (inbounds )?((\[([^ \]]+))|([^ ]+)) ([^,]+), ([^ ]+) ([^,]+), ([^ ]+) (.+)/,
  ashr: /^ashr ([^ ]+) ([^,]+), (.+)/,
  and: /^and ([^ ]+) ([^,]+), (.+)/,
  trunc: /^trunc ([^ ]+) ([^ ]+) to (.+)/,
  phi: /^phi ([^ ]+) (.+)/,

  localSet: /^\s+%([^ ]+) = (.+)/,
  label: /; <label>:(\d+)/,
  absoluteBranch: /\s+br label (.+)/,
  conditionalBranch: /\s+br i1 ([^,]+), label ([^,]+), label (.+)/,

  globalVar: /@([^ ]+) = (internal )?(private )?(unnamed_addr )?(constant )?(global )?((\[([^\]])+\])|([^ ]+))(.+)/,

  inlineInstruction: /([a-zA-Z ]+)\(([^\(]+)\)/
};

function parse(file, ffi) {
  // strip out some really useless fields
  // if this turns out to be useful in the future
  // (aka I just broke something)
  // poke me

  file = file.replace(/zeroext /g, "");
  file = file.replace(/ zeroext/g, "");
  file = file.replace(/signext /g, "");
  file = file.replace(/ signext/g, "");
  file = file.replace(/, align \d/g, "");
  file = file.replace(/ nsw/g, "");
  file = file.replace(/ nuw/g, "");
  file = file.replace(/ nocapture/g, "");
  file = file.replace(/ readonly/g, "");
  file = file.replace(/, !tbaa !(\d)+/g, "");

  var lines = file.split('\n');

  var mod = {
    functions: [],
    globals: [],
    types: []
  };

  var inFunctionBlock = false;
  var functionBlock = {};

  function gotoComplex(initBranch) {
    if(!functionBlock.inGotoComplex) {
      functionBlock.inGotoComplex = true;
      functionBlock.code.push({
        type: "gotoComplex"
      });

    }
  }

  for(var i = 0; i < lines.length; ++i) {
    if(!inFunctionBlock) {
      if(regexs.define.test(lines[i])) {
        var m = lines[i].match(regexs.define);

        var returnType = m[1];
        var funcName = m[2];
        var paramList = m[3];
        var modifiers = m[4];

        functionBlock = {
          returnType: returnType,
          paramList: extractParamList(paramList),
          funcName: funcName,
          code: [],
          labels: {},
          inGotoComplex: false
        };
        inFunctionBlock = true;
      } else if(regexs.declare.test(lines[i])) {
        var m = lines[i].match(regexs.declare);

        var returnType = m[1];
        var funcName = m[2];
        var paramList = extractParamList(m[3]);

        codeBlock = [];
        hasFFI = false;

        if(ffi.indexOf(funcName) > -1) {
          codeBlock = [{
            type: "ffi",
            ffiBlock: funcName
          }];
          hasFFI = true;
        }

        mod.functions.push({
          returnType: returnType,
          paramList: paramList,
          funcName: funcName,
          code: codeBlock,
          hasFFI: hasFFI
        })

      } else if(regexs.globalVar.test(lines[i])) {
        var m = lines[i].match(regexs.globalVar);

        var name = m[1].trim();
        var type = m[7].trim();

        var val = null;

        if(m[11]) {
          val = formatValue(type, m[11].trim());
        }

        mod.globals.push({
          name: name,
          type: type,
          val: val
        });
      } else if(regexs.newType.test(lines[i])) {
        var m = lines[i].match(regexs.newType);

        var newType = m[1];
        var contents = m[2].split(",").map(function(a) {
          return a.trim();
        });

        mod.types[newType] = contents;
      }
    } else {
      if(lines[i] == "}") {
        mod.functions.push(functionBlock);
        inFunctionBlock = false;
      } else if(regexs.label.test(lines[i])) {
        var m = lines[i].match(regexs.label);
        functionBlock.labels[m[1]] = functionBlock.code.length;

        // synthetic label block for enabling the backend to function properly
        // without the need of very messy hacks (iterating through labels, etc.)

        functionBlock.code.push({
          type: "label",
          label: m[1]
        });
      } else if(regexs.localSet.test(lines[i])) {
        var m = lines[i].match(regexs.localSet);

        var block = {
          type: "set",
          name: "%"+m[1],
          val: {},
          computation: []
        };

        if(regexs.call.test(m[2])) {
          block.val = {
            type: "return value"
          }
          block.computation = callBlock(m[2].match(regexs.call));

          functionBlock.code.push(block);
        } else if(regexs.alloca.test(m[2])) {
          // no computation work here, but it still needs a spot on the stack for now
          // todo: optimize alloca calls out

          var m = m[2].match(regexs.alloca);

          block.val = {
            vtype: m[1]+"*",
            type: "alloca"
          }

          functionBlock.code.push(block);
        } else if(regexs.load.test(m[2])) {
          var m = m[2].match(regexs.load);

          block.val = {
            type: "variable",
            name: m[2],
            vtype: m[1]
          }

          functionBlock.code.push(block);
        } else if(regexs.add.test(m[2])) {
          var m = m[2].match(regexs.add);
          block.val = {
            type: "arithmetic",
            operation: "+",
            operand1: m[2],
            operand2: m[3],
            vtype: m[1]
          };

          functionBlock.code.push(block);
        } else if(regexs.sub.test(m[2])) {
          var m = m[2].match(regexs.sub);
          block.val = {
            type: "arithmetic",
            operation: "-",
            operand1: m[2],
            operand2: m[3],
            vtype: m[1]
          };

          functionBlock.code.push(block);
        } else if(regexs.mul.test(m[2])) {
          var m = m[2].match(regexs.mul);
          block.val = {
            type: "arithmetic",
            operation: "*",
            operand1: m[2],
            operand2: m[3],
            vtype: m[1]
          };

          functionBlock.code.push(block);
        } else if(regexs.div.test(m[2])) {
          var m = m[2].match(regexs.div);
          block.val = {
            type: "arithmetic",
            signed: m[1],
            operation: "/",
            operand1: m[3],
            operand2: m[4],
            vtype: m[1]
          };

          functionBlock.code.push(block);
        } else if(regexs.srem.test(m[2])) {
          var m = m[2].match(regexs.srem);
          block.val = {
            type: "srem",
            vtype: m[1],
            operand1: m[2],
            operand2: m[3]
          };

          functionBlock.code.push(block);
        } else if(regexs.icmp.test(m[2])) {
          var m = m[2].match(regexs.icmp);

          block.val = {
            type: "comparison",
            operation: m[1],
            left: m[3],
            right: m[4]
          }

          functionBlock.code.push(block);
        } else if(regexs.sext.test(m[2])) {
          var m = m[2].match(regexs.sext);

          block.val = {
            type: "sext",
            source: m[2],
            originalType: m[1],
            newType: m[3]
          }

          functionBlock.code.push(block);
        } else if(regexs.trunc.test(m[2])) {
          var m = m[2].match(regexs.trunc);

          block.val = {
            type: "trunc",
            source: m[2],
            originalType: m[1],
            newType: m[3]
          }

          functionBlock.code.push(block);
        } else if(regexs.phi.test(m[2])) {
           var m = m[2].match(regexs.phi);

           // phi node is a pain to do,
           // especially because it's syntax is not regular

           var type = m[1];

           var optionList =
            m[2] // original options list
             .split(/\[([^\]]+)\]/) // split by regex

             .filter(function(a, b) {
               return b % 2; // only return every other element
             })

             .map(function(a) {
               return a
                 .trim() // clean it up
                 .split(",") // split by commas
                 .map(function(b) {
                  return b.trim(); // clean up
                 })
                 .concat([type]); // used in the backend
             });

           block.val = {
             type: "phi",
             vtype: type,
             options: optionList
           };

           functionBlock.code.push(block);
        } else if(regexs.getelementptr.test(m[2])) {
          console.log("getelementptr todo");

          var m = m[2].match(regexs.getelementptr);

          console.log(m);
          block.val = matchGetElementPtr(m);

          console.log(block.val);
          functionBlock.code.push(block);
        } else if(regexs.ashr.test(m[2])) {
          var m = m[2].match(regexs.ashr);

          block.val = {
            type: "ashr",
            vtype: m[1],
            operand1: m[2],
            operand2: m[3],
          };

          functionBlock.code.push(block);
        } else if(regexs.and.test(m[2])) {
          var m = m[2].match(regexs.and);

          block.val = {
            type: "and",
            vtype: m[1],
            operand1: m[2],
            operand2: m[3],
          };

          functionBlock.code.push(block);
        } else {
          console.log("Unknown instruction equality: ");
          console.log(lines[i]);
        }
      } else if(regexs.call.test(lines[i])) {
        functionBlock.code.push(callBlock(lines[i].match(regexs.call)));
      } else if(regexs.ret.test(lines[i])) {
        functionBlock.code.push({
          type: "ret",
          value: extractTypeValue(lines[i].match(regexs.ret)[1])
        });
      } else if(lines[i].trim().split(" ")[0] == "store") {
        var snippet = lines[i].split(/\(([^\)]+)\)/g);

        var ln = lines[i];
        if(snippet.length > 1)
          ln = lines[i].replace(snippet[1], "*snip*");

        var m = ln.match(regexs.store);

        if(snippet.length > 1) {
          m[2] = m[2].replace("*snip*", snippet[1]);
          m[2] = formatValue(m[1], m[2]);
        }

        functionBlock.code.push({
          type: "store",
          src: {
            type: m[1],
            value: m[2]
          },
          destination: {
            type: m[3],
            value: m[4]
          }
        });

      } else if(regexs.absoluteBranch.test(lines[i])) {
        var label = lines[i].match(regexs.absoluteBranch)[1];
        gotoComplex();
        functionBlock.code.push({
          type: "branch",
          conditional: false,
          dest: label
        });
      } else if(regexs.conditionalBranch.test(lines[i])) {
        var match = lines[i].match(regexs.conditionalBranch);
        gotoComplex();

        functionBlock.code.push({
          type: "branch",
          conditional: true,
          dest: match[2],
          falseDest: match[3],
          condition: match[1]
        });
      } else if(lines[i].length){
        console.log("Unknown instruction line: ");
        console.log(lines[i]);
      }
    }
  }

  return mod;
}

function extractParamList(params) {
  params = params.split(',');
  var formattedParams = [];
  for(var j = 0; j < params.length; ++j) {
    if(params[j].length)
      formattedParams.push( params[j].trim().split(' ') );
  }
  return formattedParams;
}

module.exports = function(options) {
  return parse(fs.readFileSync(options.filename).toString(), options.ffi || []);
};

// block definitions
function callBlock(m) {
  var tailable = m[1];
  var returnType = m[2];
  var funcName = m[3];
  var paramList = m[4];
  var params = [];

  // due to the shear complexity of IR, we have to manually parse
  var p = 0;
  var temp = "";

  var paranDepth = 0;

  while(p < paramList.length) {
     if(paranDepth === 0 && (paramList[p] == ',' || paramList[p] == ')')) {
      if(temp.length)
        params.push(temp.trim());
      temp = "";
    } else {
      temp += paramList[p];

      if(paramList[p] == "(") {
        paranDepth++;
      } else if(paramList[p] == ")") {
        paranDepth--;
      }
    }

    ++p;
  }

  for(var j = 0; j < params.length; ++j) {
    params[j] = extractTypeValue(params[j]);
  }

  return {
      type: "call",
      returnType: returnType,
      funcName: funcName,
      paramList: params
  };
}

function extractTypeValue(glob) {
    var type = glob.split(' ')[0];
    var val = formatValue(type, glob.slice(type.length+1));
    return [type, val];
}

function hexToDec(digit) {
  return (digit >= '0' && digit <= '9') ?
        digit * 1
      : (digit >= 'A' && digit <= 'F') ?
        (digit.charCodeAt(0) - 65) + 10
      : (digit >= 'a' && digit <= 'f') ?
        (digit.charCodeAt(0) - 96) + 10
      : 0;
}

function hexPairToByte(pair) {
  return ( hexToDec(pair[0]) << 4) | hexToDec(pair[1]);
}

function extracti8ArrayFromString(str) {
  var strData = str.slice(2, -1);
  var i8array = [];

  for(var i = 0; i < strData.length; ++i) {
    if(strData[i] == "\\") {
      i8array.push(hexPairToByte(strData[++i] + strData[++i]));
    } else {
      i8array.push(strData.charCodeAt(i));
    }
  }

  return i8array;
}

function extractStandardLiteral(str) {
  var strData = str.slice(1, -2);
  var params = extractParamList(str);

  var arr = [];

  // only extract the values
  // typechecking is for losers :p

  params.forEach(function(p) {
    arr.push(p[1]);
  });

  return arr;
}

function extractArrayLiteral(str) {
  if(str[0] == 'c') {
    return extracti8ArrayFromString(str);
  } else if(str[0] == '[') {
    return extractStandardLiteral(str);
  } else {
    return [];
  }
}

function formatValue(type, value) {
  if(regexs.inlineInstruction.test(value)) {
    var m = value.match(regexs.inlineInstruction);
    return constantExpression(m[1].trim(), m[2]);
  } else if(type[0] == '[') {
    return extractArrayLiteral(value);
  } else if(type[0] == 'c') {
    return extracti8ArrayFromString(value);
  }

  return value;
}

function constantExpression(func, params) {
  if(func == "getelementptr inbounds") {
    // TODO address computation
    var plist = params.split(",");
    var val = plist[0].split(" ").slice(-1);

    var offset = plist[2].slice(1).split(" ").slice(-1)[0];

    return {
      type: "getelementptr",
      base: {
        type: plist[0].slice(0, -(val[0].length+1)),
        val: val[0]
      },
      offset: offset
    };
  } else {
    console.log("Unknown constantExpression");
    console.log(func+"("+params+")");
  }
  return 0;
}

function matchGetElementPtr(m) {
  return {
    type: "addressOf",
    base: {
      name: m[6],
    },
    offset: m[10],
    vtype: m[2]
  };
}
