const simpleToast = require("react-simple-toasts").default;
const { toastConfig } = require("react-simple-toasts");
require("react-simple-toasts/dist/theme/dark-edge.css");

toastConfig({ theme: "dark-edge" });

const toast = (
  str,
  opt = {
    position: "bottom-right",
  }
) => {
  simpleToast(str, opt);
};

module.exports = toast;
