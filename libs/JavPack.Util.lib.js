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
    // 修改分割逻辑，同时处理横线、下划线和空格
    const codes = code.split(/[-_\s]+/);

    // 修改分隔符模式，增加对空格的支持
    const sep = "\\s*(0|-|_|\\s){0,2}\\s*";

    let pattern = codes.join(sep);

    // 特殊情况处理保持不变
    if (/^fc2/i.test(code)) pattern = `${codes[0]}${sep}(ppv)?${sep}${codes.at(-1)}`;
    if (/^heyzo/i.test(code)) pattern = `${codes[0]}${sep}(\\w){0,2}${sep}${codes.at(-1)}`;

    return {
      codes,
      prefix: codes[0],
      // 修改正则表达式，使其更灵活地处理边界情况
      regex: new RegExp(`(?<![a-z])(${pattern})(?![\\w-])`, "i"),
    };
  }

  static setFavicon(icon) {
    const favicon = GM_getResourceURL(icon);
    if (!favicon) return;

    document.querySelectorAll("link[rel*='icon']").forEach((item) => item.setAttribute("href", favicon));
  }
}
