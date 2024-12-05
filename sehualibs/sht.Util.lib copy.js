class Util {
  static CD_KEY = "CD";

  static upLocal() {
    const date = new Date().getDate();
    if (localStorage.getItem(this.CD_KEY) === date.toString()) return;
    localStorage.clear();
    localStorage.setItem(this.CD_KEY, date);
  }

  static upStore() {
    const date = new Date().getDate();
    if (GM_getValue(this.CD_KEY) === date) return;
    GM_listValues().forEach((key) => GM_deleteValue(key));
    GM_setValue(this.CD_KEY, date);
  }

  static codeParse(code) {
    const hasNumbers = /\d/.test(code);
    let codes;

    // 首先处理 FC2 的特殊情况
    if (/^fc2/i.test(code)) {
      // 提取 FC2 编号
      const match = code.match(/^fc2[-_\s]*(ppv)?[-_\s]*(\d+)$/i);
      if (match) {
        const number = match[2];  // 获取数字部分
        // 构建一个可以匹配各种 FC2 格式的正则表达式
        return {
          codes: ['FC2', number],
          prefix: 'FC2',
          regex: new RegExp(
            // (?<![a-z]) 确保前面不是字母
            `(?<![a-z])` +
            // FC2 部分，不区分大小写
            `fc2` +
            // 可选的分隔符和 PPV
            `[-_\\s]*(ppv)?[-_\\s]*` +
            // 数字部分
            `${number}` +
            // 确保后面不是数字
            `(?!\\d)`,
            "i"
          )
        };
      }
    }

    // 其他情况的处理保持不变
    if (hasNumbers) {
      codes = code.split(/-|_/);
    } else {
      codes = code.split(/[-_\s]+/);
    }

    const sep = hasNumbers
      ? "\\s?(0|-|_){0,2}\\s?"
      : "\\s*(0|-|_|\\s){0,2}\\s*";

    let pattern = codes.join(sep);

    // 移除对 FC2 的特殊处理，因为已经在上面处理过了
    if (/^heyzo/i.test(code)) pattern = `${codes[0]}${sep}(\\w){0,2}${sep}${codes.at(-1)}`;

    const regex = hasNumbers
      ? new RegExp(`(?<![a-z])${pattern}(?!\\d)`, "i")
      : new RegExp(`(?<![a-z])(${pattern})(?![\\w-])`, "i");

    return {
      codes,
      prefix: codes[0],
      regex
    };
  }

  static setFavicon(icon) {
    const favicon = GM_getResourceURL(icon);
    if (!favicon) return;

    document.querySelectorAll("link[rel*='icon']").forEach((item) => item.setAttribute("href", favicon));
  }
}
