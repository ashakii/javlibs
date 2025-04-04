// ==UserScript==
// @name            JavBUS.offline115
// @version         0.1
// @author          zyashakii
// @description     115 网盘离线
// @match           https://captchaapi.115.com/*
// @match           https://www.javbus.com/*
// @icon            https://www.javbus.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Magnet.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Offline.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Verify115.lib.js
// @resource        pend https://github.com/bolin-dev/JavPack/raw/main/assets/pend.png
// @resource        warn https://github.com/bolin-dev/JavPack/raw/main/assets/warn.png
// @resource        error https://github.com/bolin-dev/JavPack/raw/main/assets/error.png
// @resource        success https://github.com/bolin-dev/JavPack/raw/main/assets/success.png
// @connect         jdbstatic.com
// @connect         aliyuncs.com
// @connect         javbus.com
// @connect         115.com
// @run-at          document-end
// @grant           GM_removeValueChangeListener
// @grant           GM_addValueChangeListener
// @grant           GM_getResourceURL
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_addElement
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           window.close
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_info
// @noframes
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

const config = [
  {
    name: "无码",
    dir: "0000小姐姐仓库/0X88无码蓝光/CDRPBD",
    color: "is-normal",
    rename: "${code}",
    inMagnets: true,
    cover: false,
  },
  {
    name: "普通",
    dir: "0000小姐姐仓库/0X04普通片库",
    color: "is-normal",
    magnetOptions: {
      filter: ({ size, number }) => {
        const magnetSize = parseFloat(size);
        return magnetSize > 3 * 1024 ** 3 && number <= 6;
      },
      sort: (a, b) => {
        const regex = /\.torrent$/;
        const aName = regex.test(a.name);
        const bName = regex.test(b.name);
        if (aName !== bName) return aName ? -1 : 1; // 优先.torrent
        // if (a.zh !== b.zh) return a.zh ? -1 : 1; // 优先中字
        // if (a.crack !== b.crack) return a.crack ? -1 : 1; // 优先破解
        return parseFloat(b.size) - parseFloat(a.size); // 优先大文件
      },
    },
  },
  {
    name: "破解",
    dir: "0000小姐姐仓库/0X01破解片库",
    color: "is-crack",
    magnetOptions: {
      filter: ({ size, crack, number }) => {
        const magnetSize = parseFloat(size);
        return magnetSize > 3 * 1024 ** 3 && crack && number <= 6;
      },
    },
  },
  {
    name: "字幕",
    dir: "0000小姐姐仓库/0X02字幕片库",
    color: "is-zh",
    magnetOptions: {
      filter: ({ size, zh, number }) => {
        const magnetSize = parseFloat(size);
        return magnetSize > 3 * 1024 ** 3 && zh && number <= 6;
      },
    },
  },
  {
    name: "4K",
    dir: "0000小姐姐仓库/0X03高清片库",
    color: "is-fourk",
    magnetOptions: {
      filter: ({ fourk, number }) => {
        return fourk && number <= 10;
      },
      sort: (a, b) => {
        //if (a.zh !== b.zh) return a.zh ? -1 : 1; // 优先中字
        if (a.crack !== b.crack) return a.crack ? -1 : 1; // 优先破解
        if (a.fourk !== b.fourk) return a.fourk ? -1 : 1;
        return parseFloat(b.size) - parseFloat(a.size); // 优先大文件
      },
    },
  },
  {
    name: "中文破解",
    dir: "0000小姐姐仓库/0X00破解字幕",
    color: "is-uc",
    magnetOptions: {
      filter: ({ size, uc }) => {
        const magnetSize = parseFloat(size);
        return magnetSize > 3 * 1024 ** 3 && uc;
      },
    },
  },
  {
    name: "共演",
    dir: "0000小姐姐仓库/0X05梦幻共演",
    color: "is-gongyan",
    magnetOptions: {
      filter: ({ size, number }) => {
        const magnetSize = parseFloat(size);
        return magnetSize > 3 * 1024 ** 3 && number <= 6;
      },
    },
  },

];


const TARGET_CLASS = "zy-offline";
const LOAD_CLASS = "is-loading";
const IS_DETAIL = window.location.href.includes("-");

const MATCH_API = "reMatch";
const MATCH_DELAY = 750;

const { HOST, STATUS_KEY, STATUS_VAL } = Verify115;
const { PENDING, VERIFIED, FAILED } = STATUS_VAL;

const transToByte = Magnet.useTransByte();

// #region 获取详情页详情
const getDetails = (dom = document) => {
  const infoNode = dom.querySelector(".col-md-3.info");
  if (!infoNode) return;

  const code = dom.querySelector(".info p :last-child").textContent.trim();
  const prefix = code.split("-")[0].trim();

  const title = dom.querySelector(".container h3").textContent.replace(code, "").trim().slice(0, 40);

  const cover = dom.querySelector("a.bigImage img")?.src;
  const actors = dom.querySelector(".col-md-3.info p:last-child a")?.textContent.trim();

  const info = {};
  infoNode.querySelectorAll("p").forEach((item) => {
    const label = item.querySelector("span.header")?.textContent;
    const value = item.textContent.trim();
    if (!label || !value || value.includes("N/A")) return;

    switch (label) {
      case "發行日期:":
        info.date = value.replace("發行日期：", "").trim();
        break;
      case "製作商:":
        info.maker = value.replace("製作商：", "").trim();
        break;
      case "發行商:":
        info.publisher = value.replace("發行商：", "").trim();
        break;
      case "系列:":
        info.series = value.replace("系列：", "").trim();
        break;
    }
  });

  if (prefix) info.prefix = prefix;
  if (cover) info.cover = cover;
  if (actors) info.actors = actors;

  const { codes, regex } = Util.codeParse(code);
  return { codes, regex, code, title, ...info };
};
// #endregion

console.log(getDetails());

const getMagHtml = async (img) => {
  return new Promise((resolve, reject) => {
    const gid = 62735950142;
    const uc = 0;
    const floor = Math.floor(1e3 * Math.random() + 1);

    unsafeWindow.$.ajax({
      type: "GET",
      url: `${location.origin}/ajax/uncledatoolsbyajax.php?gid=${gid}&lang=zh&img=${img}&uc=${uc}&floor=${floor}`,
      success: (response) => {
        // 确保 `<tr>` 解析正确
        const wrapper = document.createElement("table");
        wrapper.innerHTML = response;
        resolve(wrapper);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// const getMags = (img) => {
//   return new Promise((resolve, reject) => {
//     const gid = 62735950142;
//     const uc = 0;
//     const floor = Math.floor(1e3 * Math.random() + 1);
//     if (!gid) {
//       reject("No gid provided");
//       return;
//     }

//     unsafeWindow.$.ajax({
//       type: "GET",
//       url: `${location.origin}/ajax/uncledatoolsbyajax.php?gid=${gid}&lang=zh&img=${img}&uc=${uc}&floor=${floor}`,
//       success: (response) => {
//         console.log("Success:", response);
//         resolve(response); // 解析成功的数据
//       },
//       error: (error) => {
//         console.error("AJAX Error:", error);
//         reject(error); // 处理错误
//       },
//     });
//   });
// };


// const isUncensored = (dom = document) => {
//   return dom.querySelector(".title.is-4").textContent.includes("無碼");
// };

const renderAction = ({ color, index, idx, desc, name }) => {
  return `
  <button
    class="${TARGET_CLASS} button ${color}"
    data-index="${index}"
    data-idx="${idx}"
    title="${desc}"
  >
    ${name}
  </button>
  `;
};

const findAction = ({ index, idx }, actions) => {
  return actions.find((act) => act.index === Number(index) && act.idx === Number(idx));
};

// #region 磁力链接处理
const parseMagnet = (node) => {
  const name = node.querySelector("td a")?.textContent.trim() ?? "";
  const meta = node.querySelector("td:nth-child(2) a")?.textContent.trim() ?? "";
  const size = transToByte(meta.split(",")[0]);
  return {
    url: node.querySelector("td a").href.split("&")[0].toLowerCase(),
    zh: !!node.querySelector("a.btn-warning") || Magnet.zhReg.test(name),
    size: size,
    crack: Magnet.crackReg.test(name),
    fourk: Magnet.fourkReg.test(name) || size >= 8.6 * 1024 ** 3,
    uc: Magnet.ucReg.test(name),
    meta,
    name,
  };
};
const getMagnets = (dom = document) => {
  return [...dom.querySelectorAll("tr")].map(parseMagnet).toSorted(Magnet.magnetSort);
};
// #endregion

const checkCrack = (magnets, uncensored) => {
  return uncensored ? magnets.map((item) => ({ ...item, crack: false })) : magnets;
};

const offline = async ({ options, magnets, onstart, onprogress, onfinally }, currIdx = 0) => {
  onstart?.();
  const res = await Req115.handleOffline(options, magnets.slice(currIdx));
  if (res.status !== "warn") return onfinally?.(res);
  onprogress?.(res);

  if (GM_getValue(STATUS_KEY) !== PENDING) {
    Verify115.start();
    Grant.notify(res);
  }

  const listener = GM_addValueChangeListener(STATUS_KEY, (_name, _old_value, new_value) => {
    if (![VERIFIED, FAILED].includes(new_value)) return;
    GM_removeValueChangeListener(listener);
    if (new_value === FAILED) return onfinally?.();
    offline({ options, magnets, onstart, onprogress, onfinally }, res.currIdx);
  });
};

(function () {
  if (location.host === HOST) return Verify115.verify();
})();

// #region 详情页
(async function () {
  if (!IS_DETAIL) return;
  const details = getDetails();
  if (!details) return;

  const actions = Offline.getActions(config, details);
  if (!actions.length) return;

  // const UNC = isUncensored();

  const insertActions = (actions) => {
    document.querySelector(".movie-panel-info").insertAdjacentHTML(
      "beforeend",
      `<div class="panel-block"><div class="columns"><div class="column"><div class="buttons">
        ${actions.map(renderAction).join("")}
      </div></div></div></div>`,
    );

    const inMagnets = actions.filter((item) => Boolean(item.inMagnets));
    if (!inMagnets.length) return;

    const inMagnetsStr = inMagnets.map(renderAction).join("");
    const magnetsNode = document.querySelector("#magnets-content");

    const insert = (node) => node.querySelector(".buttons.column").insertAdjacentHTML("beforeend", inMagnetsStr);
    const insertMagnets = () => magnetsNode.querySelectorAll(".item.columns").forEach(insert);

    window.addEventListener("JavDB.magnet", insertMagnets);
    insertMagnets();
  };

  const onstart = (target) => {
    Util.setFavicon("pend");
    target.classList.add(LOAD_CLASS);
    document.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => item.setAttribute("disabled", ""));
  };

  const onfinally = (target, res) => {
    document.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => item.removeAttribute("disabled"));
    target.classList.remove(LOAD_CLASS);
    if (!res) return;

    Grant.notify(res);
    Util.setFavicon(res);
    setTimeout(() => unsafeWindow[MATCH_API]?.(), MATCH_DELAY);
  };

  const onclick = (e) => {
    const { target } = e;
    if (!target.classList.contains(TARGET_CLASS)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = findAction(target.dataset, actions);
    if (!action) return;

    const inMagnets = target.closest("#magnets-content > .item");
    const { magnetOptions, ...options } = Offline.getOptions(action, details);

    const magnets = inMagnets ? [parseMagnet(inMagnets)] : Offline.getMagnets(getMagnets(), magnetOptions);
    if (!magnets.length) return;

    offline({
      options,
      magnets: checkCrack(magnets, UNC),
      onstart: () => onstart(target),
      onprogress: Util.setFavicon,
      onfinally: (res) => onfinally(target, res),
    });
  };

  insertActions(actions);
  document.addEventListener("click", onclick);
})();
// #endregion

// #region 列表页
(async function () {
  if (IS_DETAIL) return;
  const COVER_SELECTOR = ".cover";
  const SELECTOR = ".item.masonry-brick";
  const movieList = document.querySelectorAll(SELECTOR);
  if (!movieList.length) return;

  const getParams = () => {
    const sectionName = document.querySelector(".section-name")?.textContent.trim() ?? "";
    const actorSectionName = document.querySelector(".actor-section-name")?.textContent.trim() ?? "";

    const getLastName = (txt) => txt.split(", ").at(-1).trim();

    const getOnTags = () => {
      const nodeList = document.querySelectorAll("#tags .tag_labels .tag.is-info");
      const genres = [...nodeList].map((item) => item.textContent.trim());
      return { genres };
    };

    const getOnActors = () => {
      const actor = getLastName(actorSectionName).replace("(無碼)", "").trim();
      const nodeList = document.querySelectorAll(".actor-tags.tags .tag.is-medium.is-link:not(.is-outlined)");
      const genres = [...nodeList].map((item) => item.textContent.trim());
      return { actors: [actor], genres };
    };

    const getOnSeries = () => {
      return { series: sectionName };
    };

    const getOnMakers = () => {
      return { maker: getLastName(sectionName) };
    };

    const getOnDirectors = () => {
      return { director: getLastName(sectionName) };
    };

    const getOnVideoCodes = () => {
      return { prefix: sectionName, codeFirstLetter: sectionName[0].toUpperCase() };
    };

    const getOnLists = () => {
      return { list: actorSectionName };
    };

    const getOnPublishers = () => {
      return { publisher: getLastName(sectionName) };
    };

    const getOnUsersList = () => {
      const list = document.querySelector(".title.is-4 .is-active a")?.textContent.trim() ?? "";
      return { list };
    };

    const { pathname: PATHNAME } = location;
    if (PATHNAME.startsWith("/tags")) return getOnTags();
    if (PATHNAME.startsWith("/actors")) return getOnActors();
    if (PATHNAME.startsWith("/series")) return getOnSeries();
    if (PATHNAME.startsWith("/makers")) return getOnMakers();
    if (PATHNAME.startsWith("/directors")) return getOnDirectors();
    if (PATHNAME.startsWith("/video_codes")) return getOnVideoCodes();
    if (PATHNAME.startsWith("/lists")) return getOnLists();
    if (PATHNAME.startsWith("/publishers")) return getOnPublishers();
    if (PATHNAME.startsWith("/users/list_detail")) return getOnUsersList();
    return {};
  };

  const params = getParams();
  const actions = Offline.getActions(config, params);
  if (!actions.length) return;

  const insertActions = (actions) => {
    const actionsTxt = `
        <div class="button ${TARGET_CLASS}" style="position:absolute;top:15px;left:15px;z-index:2">
          ${actions.map(renderAction).join("")}
        </div>
      `;
    const insert = (node) => node.querySelector(".photo-frame").insertAdjacentHTML("beforeend", actionsTxt);
    const insertList = (nodeList) => nodeList.forEach(insert);

    insertList(movieList);
    window.addEventListener("JavDB.scroll", ({ detail }) => insertList(detail));
  };

  const videoFocus = (target) => target.closest(COVER_SELECTOR)?.querySelector("video")?.focus();

  const onstart = (target) => {
    target.classList.add(LOAD_CLASS);
    target.parentElement.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => item.setAttribute("disabled", ""));
  };

  const onfinally = (target, res) => {
    target.parentElement.querySelectorAll(`.${TARGET_CLASS}`).forEach((item) => item.removeAttribute("disabled"));
    target.classList.remove(LOAD_CLASS);
    if (res) setTimeout(() => unsafeWindow[MATCH_API]?.(target), MATCH_DELAY);
  };
  // #region 列表页点击

  const onclick = async (e) => {
    const { target } = e;
    if (!target.classList.contains(TARGET_CLASS)) return;

    e.preventDefault();
    e.stopPropagation();
    requestAnimationFrame(() => videoFocus(target));

    const action = findAction(target.dataset, actions);
    if (!action) return;
    onstart(target);

    try {
      const link = target.closest("a").href;
      const movieBox = target.closest(".movie-box"); // 找到最近的 .movie-box
      const img = movieBox ? movieBox.querySelector("img").src : null; // 在 .movie-box 里找 img
      const img_txt = img.replace("https://www.javbus.com", "")
      const dom = await Req.request(link);
      const details = getDetails(dom);
      if (!details) throw new Error("Not found details");
      // const magnetDom = getMags(img_txt);

      // 调用示例
      const magnetDom = await getMagHtml(img_txt);
      // const magnetDom = await getMags(img_txt);
      console.log(magnetDom);


      // const UNC = isUncensored(dom);
      const { magnetOptions, ...options } = Offline.getOptions(action, details);

      const magnets = Offline.getMagnets(getMagnets(magnetDom), magnetOptions);
      if (!magnets.length) throw new Error("Not found magnets");

      offline({
        options,
        magnets,
        // magnets: checkCrack(magnets, UNC),
        onfinally: (res) => onfinally(target, res),
      });
    } catch (err) {
      onfinally(target);
      Util.print(err?.message);
    }
  };

  insertActions(actions);
  document.addEventListener("click", onclick, true);
  // #endregion
})();
// #endregion
