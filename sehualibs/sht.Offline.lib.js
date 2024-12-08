class Offline {
  static defaultRename = "${zh}${crack}${guochan} ${title}";

  static defaultOptions = {
    clean: true,
    cleanPwd: "",
    cover: false,
  };

  static defaultVerifyOptions = {
    filter: ({ s }) => s > 50 * 1024 * 1024,// 50M
    clean: false,
    max: 10, //验证次数
  };

  static defaultRenameTxt = {
    no: "-cd${no}",
    zh: "[中字]",
    crack: "[破解]",
    guochan: "[国产]",
  };

  static parseVar(txt, params, rep = "") {
    const reg = /\$\{([a-z]+)\}/g;
    return txt.replace(reg, (_, key) => (params.hasOwnProperty(key) ? params[key].toString() : rep)).trim();
  }

  static parseDir(dir, params) {
    const rep = "$0";
    return (typeof dir === "string" ? dir.split("/") : dir).map((item) => {
      const txt = this.parseVar(item, params, rep);
      return txt.includes(rep) ? null : txt;
    });
  }

  static getActions(config, params) {
    return config
      .flatMap(({ type = "plain", match = [], exclude = [], ...item }, index) => {
        let { name, dir = "云下载", rename = this.defaultRename } = item;
        if (!name) return null;

        rename = rename.toString().trim() || this.defaultRename;
        rename = rename.replaceAll("${zh}", "$zh");
        rename = rename.replaceAll("${crack}", "$crack");
        rename = rename.replaceAll("${guochan}", "$guochan");

        if (type === "plain") return { ...item, dir: this.parseDir(dir, params), rename, idx: 0, index };

        let classes = params[type];
        if (!Array.isArray(classes) || !classes.length) return null;

        if (match.length) classes = classes.filter((item) => match.some((key) => item.includes(key)));
        if (!classes.length) return null;

        if (exclude.length) classes = classes.filter((item) => !exclude.some((key) => item.includes(key)));
        if (!classes.length) return null;

        const typeItemKey = type.replace(/s$/, "");
        const typeItemTxt = "${" + typeItemKey + "}";

        return classes.map((cls, idx) => {
          return {
            ...item,
            dir: this.parseDir(dir, { ...params, [typeItemKey]: cls }),
            rename: rename.replaceAll(typeItemTxt, cls),
            name: name.replaceAll(typeItemTxt, cls),
            index,
            idx,
          };
        });
      })
      .filter((item) => Boolean(item) && item.dir.every(Boolean))
      .map(({ color = "is-info", inMagnets = true, desc, ...options }) => {
        return { ...options, color, inMagnets, desc: desc ? desc.toString() : options.dir.join("/") };
      });
  }

  static getOptions(
    { verifyOptions = {}, renameTxt = {}, ...options },
    { codes, regex, ...details },
  ) {
    options = { ...this.defaultOptions, ...options };
    verifyOptions = { ...this.defaultVerifyOptions, ...verifyOptions };
    renameTxt = { ...this.defaultRenameTxt, ...renameTxt };
    const { cover, rename } = options;

    return {
      ...options,
      verifyOptions,
      renameTxt,
      codes,
      regex,
      code: details.code,
      cover: cover ? details.cover : cover,
      rename: this.parseVar(rename, details),
    };
  }

  static verifyAccount(key, val) {
    document.querySelector("#js_ver_code_box button[rel=verify]").addEventListener("click", () => {
      setTimeout(() => {
        if (document.querySelector(".vcode-hint").getAttribute("style").indexOf("none") === -1) return;
        GM_setValue(key, val);
        window.close();
      }, 300);
    });
  }
}
