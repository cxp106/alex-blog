function addWatermark(text) {
    // 如果已经存在水印，先移除它，避免重复添加
    const existingWatermark = document.querySelector('.watermark-container');
    if (existingWatermark) {
      existingWatermark.remove();
    }
  
    // 创建水印的容器元素
    const watermarkContainer = document.createElement('div');
    watermarkContainer.classList.add('watermark-container');
  
    // 注入 CSS，确保水印在页面上显示以及打印时显示
    const style = document.createElement('style');
    style.innerHTML = `
      .watermark-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none; /* 禁止点击 */
        z-index: 9999;
        overflow: hidden;
        display: grid;
        grid-template-columns: repeat(5, 1fr); /* 每行 5 个水印 */
        grid-template-rows: repeat(5, 1fr); /* 每列 5 个水印 */
        opacity: 0.2; /* 水印透明度 */
      }
      .watermark {
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        transform: rotate(-45deg); /* 旋转水印 */
        color: rgba(0, 0, 0, 0.1); /* 水印颜色和透明度 */
        white-space: nowrap;
      }
      @media print {
        .watermark-container {
          display: grid;
        }
      }
    `;
    document.head.appendChild(style);
  
    // 创建多个水印元素并添加到容器中
    const rows = 5; // 水印的行数
    const cols = 5; // 水印的列数
    for (let i = 0; i < rows * cols; i++) {
      const watermark = document.createElement('div');
      watermark.classList.add('watermark');
      watermark.innerText = text;
      watermarkContainer.appendChild(watermark);
    }
  
    // 将水印容器添加到页面中
    document.body.appendChild(watermarkContainer);
  }
  
  // 使用示例
  addWatermark("微信 LMPXCQBH");