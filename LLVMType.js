function LLVMType(mod, str) {
  if(str[0] == "[") {
    bareStr = str.slice(1, -1);
    str = bareStr.split(" x ");

    this.isArray = true;
    this.arraySize = str[0] * 1;
    this.elementType = new LLVMType(bareStr.slice(str[0].length + 3));
    this.typeSize = this.arraySize * getTypeSize(this.elementType);
  } else if(/i\d+/.test(str)) {
    this.isInteger = true;
    console.log(str);
    this.integerBits = str.slice(1) * 1;
    this.typeSize = getIntegerSize(this.integerBits);
  }
}

function getTypeSize(type) {
  return type.typeSize;
}

function getIntegerSize(size) {
  return (size == 1 || size == 8) ? 1 :
      (size == 16) ? 2 :
      (size == 32) ? 4 :
      (size == 64) ? 8 :
      1;
}

module.exports = LLVMType;
