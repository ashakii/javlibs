class ReqMagnetBtsow extends Req {
  static btsow(code) {
    const spaceReg = /\s/g;
    const host = "https://btsow.motorcycles/";

    return this.tasks(
      {
        url: `${host}search/${code}`,
        headers: {
          "Referer": `${host}/tags`,
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
