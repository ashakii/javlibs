// ==UserScript==
// @name            JavBUS.style
// @version         0.1
// @author          zyashakii
// @description     样式调整
// @match           https://www.javbus.com/*
// @icon            https://www.javbus.com/favicon.ico
// @run-at          document-start
// @grant           GM_getResourceText
// @grant           GM_addStyle
// ==/UserScript==

// 修改JAVBUS页面的样式并替换图片
(function () {
  GM_addStyle(`
    button.zy-offline {
      font-size: 12px !important; /* 设置按钮的字体大小 */
      padding: 5px 12px !important; /* 为按钮增加内边距 */
      color: white; /* 按钮文字颜色 */
      border: none !important; /* 移除默认边框 */
      cursor: pointer !important; /* 鼠标悬浮时显示手型光标 */
      position: relative !important; /* 相对定位 */
      overflow: hidden; /* 隐藏超出部分 */
    }

    button.zy-offline:hover {
      background-color:rgb(102, 252, 142) !important; /* 按钮悬浮时的背景色 */
      color: #000000 !important; /* 按钮悬浮时的文字颜色 */
    }
/* 加载状态 */
.button.is-loading {
  pointer-events: none; /* 禁用点击 */
  color: transparent; /* 隐藏文字 */
}
  /* 禁用状态 */
.button:disabled {
  opacity: 0.8; /* 半透明效果 */
  cursor: not-allowed !important; /* 禁用鼠标指针 */
}

/* 中央进度条 */
.button.is-loading::after {
  content: "";
  position: absolute;
  top: 50%; /* 垂直居中 */
  left: 0;
  width: 100%;
  height: 2px; /* 进度条高度 */
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: translateY(-50%); /* 垂直居中 */
  animation: loading 1.5s infinite; /* 循环播放 */
}

/* 动画关键帧 */
@keyframes loading {
  0% {
    transform: translate(-100%, -50%); /* 初始位置 */
  }
  100% {
    transform: translate(100%, -50%); /* 结束位置 */
  }
}
    button.is-uc {
    background-color: #D71103;
    }
    button.is-zh {
    background-color: #FE5E08;
    }
    button.is-crack {
    background-color: #156AA8;
    }
    button.is-normal {
    background-color: #555555;
    }
    button.is-wuma {
    background-color: #00AC6A;
    }
    button.is-fourk {
    background-color: #1e9022;
    }
    button.is-gongyan {
    background-color: #d30086;
    }
    .movie-box {
      width: 485px !important;
      margin: 10px !important;
      height: 424px !important;
      background-color: #fafafa !important;
      transition: all 0.3s cubic-bezier(0, 0, 0.5, 1);

    }
    .movie-box:focus, .movie-box:hover {
      box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.1), 0 0 0 1px #485fc7;
    }
    .movie-box img,
    .movie-box .photo-frame {
    height: 312px !important;
    vertical-align: top !important;
    object-position: top !important;
    margin: 0 !important;
    }
    .movie-box .photo-info {
    padding: 5px !important;
    }
    .photo-info {
    white-space: nowrap; /* 强制文本不换行 */
    overflow: hidden; /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 显示省略号 */
    }
    #waterfall {
    width: 1920px !important; 
    left: auto !important; /* 左边距 */
    }
  `)

  window.addEventListener('DOMContentLoaded', () => {
    // 获取所有符合条件的图片元素
    const imgs = document.querySelectorAll(".photo-frame img");

    // 遍历每个图片
    imgs.forEach(img => {
      // 获取当前图片的 src 属性
      const originalSrc = img.src;

      // 判断路径是否符合规则
      if (originalSrc.match(/\/(imgs|pics)\/(thumb|thumbs)\//)) {
        const newSrc = originalSrc.replace(/\/(imgs|pics)\/(thumb|thumbs)\//, '/$1/cover/').replace(/(\.jpg|\.jpeg|\.png)$/i, '_b$1');
        img.src = newSrc;
      }
    });
  });
})();


