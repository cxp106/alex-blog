const config = require("./svgo.config");
const { optimize } = require("svgo");
const simpleToast = require("react-simple-toasts").default;
const { toastConfig } = require("react-simple-toasts");
require("react-simple-toasts/dist/theme/dark-edge.css");

toastConfig({ theme: "dark-edge" });

function getByteLength(str) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  return encoded.length;
}

const cleanUpSvg = (data) => {
  const originalByteLength = getByteLength(data);
  const result = optimize(data, { ...config });
  const compressedByteLength = getByteLength(result.data);
  const compressionRatio =
    100 - (compressedByteLength / originalByteLength) * 100;
  console.log(`大小减少了: ${compressionRatio.toFixed(2)}%`, {
    position: "bottom-right",
  });
  document.querySelector("#main").innerHTML = result.data;
  return result.data;
};

const toast = (
  str,
  opt = {
    position: "bottom-right",
  }
) => {
  simpleToast(str, opt);
};

// 暂时不需要，毕竟有可能重名，知道能这样做可以直接调用就行
// if (typeof window !== "undefined") {
//   window.toast = toast;
// }

export { cleanUpSvg, toast };
