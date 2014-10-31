// parses LLVM IR code

var fs = require('fs');

var regexs = {
	define: /^define ([^ ]+) ([^\(]+)\(([^\)]*)\)([^{]+){/,
	declare: /^declare ([^ ]+) ([^\(]+)([^\)]+)\)/,

	call: /^\s*call ([^ ]+) ([^\(]+)\((.+)/,
	ret: /^\s*ret (.+)/,

	alloca: /^\s*alloca (.+)/,
	store: /^\s+store ([^ ]+) ([^,]+), ([^ ]+) ([^,]+)/,

	load: /^load ([^ ]+) (.+)/,
	add: /^add ([^ ]+) ([^,]+), (.+)/,
	sub: /^sub ([^ ]+) ([^,]+), (.+)/,
	mul: /^mul ([^ ]+) ([^,]+), (.+)/,
	div: /^div ([^ ]+) ([^,]+), (.+)/,
	icmp: /^icmp ([^ ]+) ([^ ]+) ([^,]+), (.+)/,

	localSet: /^\s+%([^ ]+) = (.+)/,

	label: /; <label>:(\d+)/,
	absoluteBranch: /\s+br label (.+)/,
	conditionalBranch: /\s+br i1 ([^,]+), label ([^,]+), label (.+)/
}

function parse(file, ffi) {
	// strip out some really useless fields
	// if this turns out to be useful in the future
	// (aka I just broke something)
	// poke me

	file = file.replace(/zeroext /g, "");
	file = file.replace(/ zeroext/g, "");
	file = file.replace(/signext /g, "");
	file = file.replace(/, align 4/g, "");
	file = file.replace(/ nsw/g, "");
	file = file.replace(/ nuw/g, "");

	var lines = file.split('\n');

	var mod = {
		functions: []
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
					inGotoComplex: false,
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

				console.log(m);
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
				console.log(m);

				var block = {
					type: "set",
					name: "%"+m[1],
					val: 0,
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
					
					functionBlock.code.push(block);
				} else if(regexs.load.test(m[2])) {
					block.val = {
						type: "variable",
						name: m[2].match(regexs.load)[2]
					}

					functionBlock.code.push(block);
				} else if(regexs.add.test(m[2])) {
					var m = m[2].match(regexs.add);
					block.val = {
						type: "arithmetic",
						operation: "+",
						operand1: m[2],
						operand2: m[3]
					};

					functionBlock.code.push(block);
				} else if(regexs.sub.test(m[2])) {
					var m = m[2].match(regexs.add);
					block.val = {
						type: "arithmetic",
						operation: "-",
						operand1: m[2],
						operand2: m[3]
					};

					functionBlock.code.push(block);
				} else if(regexs.mul.test(m[2])) {
					var m = m[2].match(regexs.add);
					block.val = {
						type: "arithmetic",
						operation: "*",
						operand1: m[2],
						operand2: m[3]
					};

					functionBlock.code.push(block);
				} else if(regexs.div.test(m[2])) {
					var m = m[2].match(regexs.add);
					block.val = {
						type: "arithmetic",
						operation: "/",
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
			} else if(regexs.store.test(lines[i])) {
				var m = lines[i].match(regexs.store);

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
				})

			} else if(regexs.absoluteBranch.test(lines[i])) {
				var label = lines[i].match(regexs.absoluteBranch)[1];
				gotoComplex();
				functionBlock.code.push({
					type: "branch",
					conditional: false,
					dest: label.slice(1)
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
				})
			} else {
				console.log("Unknown instruction line: ");
				console.log(lines[i]);
			}
		}
	}

	return mod;
}

function extractParamList(params) {
	var params = params.split(',');
	var formattedParams = [];
	for(var j = 0; j < params.length; ++j) {
		if(params[j].length)
			formattedParams.push( params[j].trim().split(' ') );
	}
	return formattedParams;
}

module.exports = function(options) {
	return parse(fs.readFileSync(options.filename).toString(), options.ffi || []);
}

// block definitions
function callBlock(m) {
	var returnType = m[1];
	var funcName = m[2];
	var paramList = m[3];
	var params = [];

	// due to the shear complexity of IR, we have to manually parse
	var p = 0;
	var temp = "";

	var paranDepth = 0;

	while(p < paramList.length) {
		if(paranDepth == 0 && (paramList[p] == ',' || paramList[p] == ')')) {
			if(temp.length)
				params.push(temp);
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
		var val = glob.slice(type.length+1);
		return [type, val];
}