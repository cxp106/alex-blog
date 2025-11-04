const config = require("./svgo.config");
const { optimize } = require("svgo");
// const getByteLength = require("./getByteLength");

const cleanSvg = (data) => {
  const result = optimize(data, { ...config });
  // const originalByteLength = getByteLength(data);
  // const compressedByteLength = getByteLength(result.data);
  // const compressionRatio = 100 - (compressedByteLength / originalByteLength) * 100;
  // console.log(`大小减少了：${compressionRatio.toFixed(2)}%`, {
  //   position: "bottom-right",
  // });
  // document.querySelector("#main").innerHTML = result.data;
  return result.data;
};

module.exports = cleanSvg;
