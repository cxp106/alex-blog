function getByteLength(str) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    return encoded.length;
  }
  
  module.exports = getByteLength;
  