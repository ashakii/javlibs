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
    // 首先检查是否是标准番号格式（包含数字的情况）
    const hasNumbers = /\d/.test(code);

    let codes;
    if (hasNumbers) {
      // 对于标准番号格式，只用横线和下划线分割
      codes = code.split(/-|_/);
    } else {
      // 对于非标准格式（如Titty Attack），使用空格、横线和下划线分割
      codes = code.split(/[-_\s]+/);
    }

    // 根据不同情况使用不同的分隔符模式
    const sep = hasNumbers
      ? "\\s?(0|-|_){0,2}\\s?"  // 标准番号格式的分隔符
      : "\\s*(0|-|_|\\s){0,2}\\s*";  // 非标准格式的分隔符

    let pattern = codes.join(sep);

    // 特殊情况处理保持不变
    if (/^fc2/i.test(code)) pattern = `${codes[0]}${sep}(ppv)?${sep}${codes.at(-1)}`;
    if (/^heyzo/i.test(code)) pattern = `${codes[0]}${sep}(\\w){0,2}${sep}${codes.at(-1)}`;

    // 根据不同情况使用不同的正则边界
    const regex = hasNumbers
      ? new RegExp(`(?<![a-z])${pattern}(?!\\d)`, "i")  // 标准番号格式的正则
      : new RegExp(`(?<![a-z])(${pattern})(?![\\w-])`, "i");  // 非标准格式的正则

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
