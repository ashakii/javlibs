class ReqMagnet extends Req {
  static btdig(code) {
    const spaceReg = /\s/g;
    const host = "https://btdig.com";

    return this.tasks(
      {
        url: `${host}/search`,
        params: { q: code },
        headers: {
          "Referer": `${host}/index.htm`,
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
      },
      [
        (dom) => {
          return [...dom.querySelectorAll(".one_result")]
            .map((item) => {
              return {
                name: item.querySelector(".torrent_name").textContent,
                url: item.querySelector(".torrent_magnet a").href,
                size: item.querySelector(".torrent_size").textContent.replace(spaceReg, ""),
                files: item.querySelector(".torrent_files")?.textContent ?? "1",
                date: item.querySelector(".torrent_age").textContent,
              };
            })
            .filter(({ name }) => name.toUpperCase().includes(code));
        },
      ],
    );
  }

  static btsow(code) {
    const spaceReg = /\s/g;
    const host = "https://btsow.motorcycles/";

    return this.tasks(
      {
        url: `${host}/${code}`,
        headers: {
          "Referer": `${host}/index.htm`,
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
      },
      [
        (dom) => {
          return [...dom.querySelectorAll(".data-list")]
            .map((row) => {
              return {
                name: row.querySelector(".row a").title,
                url: `magnet:?xt=urn:btih:${row.querySelector('.row a').href.match(/hash\/([a-fA-F0-9]+)$/)[1] ?? ''}`,
                size: row.querySelector(".row .size").textContent.replace(spaceReg, ""),
                files: "1.8",
                date: row.querySelector(".row .date").textContent,
              };
            })
            .filter(({ name }) => name.toUpperCase().includes(code));
        },
      ],
    );
  }
}
