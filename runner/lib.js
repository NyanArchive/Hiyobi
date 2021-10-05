const bent = require("bent");
const getBuffer = bent("buffer");
const getJson = bent("json");
const getString = bent("string");
const fs = require("fs").promises;
const sharp = require("sharp");
const Entities = require("html-entities").XmlEntities;
const entities = new Entities();
const moment = require("moment");

const headers = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36",
  referer: "https://hitomi.la/",
};

module.exports.getUnixTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

module.exports.downLoadFile = async (uri) => {
  try {
    let buff = await getBuffer(uri, null, headers);
    return buff;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

module.exports.downloadJson = async (uri) => {
  try {
    let json = await getJson(uri, null, headers);
    return json;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.downloadString = async (uri) => {
  try {
    let str = await getString(uri, null, headers);
    return str;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.downLoadImage = async ({ name, hash }) => {
  let url = url_from_url_from_hash(name, hash);
  console.log(url);

  try {
    let buffer = await getBuffer(url, null, headers);
    return buffer;
  } catch (e) {
    let buffer = await getBuffer(url, null, headers);
    return buffer;
  }
};

module.exports.getGalleryList = async () => {
  try {
    let buffer = await this.downLoadFile(
      "https://ltn.hitomi.la/index-korean.nozomi"
    );
    var view = new DataView(toArrayBuffer(buffer));
    var total = view.byteLength / 4;
    let list = [];
    for (var i = 0; i < total; i++) {
      list.push(view.getInt32(i * 4, false /* big-endian */));
    }
    return list;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.getGalleryJs = async (id) => {
  let text = await this.downloadString(
    "https://ltn.hitomi.la/galleries/" + id + ".js"
  );
  text = text.replace("var galleryinfo = ", "");

  let json = JSON.parse(text);

  return json;
};

module.exports.getGalleryJson = async (id) => {
  try {
    let redirect = await this.downloadString(
      "https://hitomi.la/galleries/" + id + ".html"
    );
    let uri = redirect.match('<link rel="canonical" href="(.*?)">');
    uri = entities.decode(uri[1]);
    let blockhtml = await this.downloadString(uri);

    let json = {
      id: Number(id),
      title: "",
      //uploader: 0,
      //uploadername: '',
      artists: [],
      groups: [],
      parodys: [],
      characters: [],
      tags: [],
      type: 0,
      category: 0,
      date: 0,
    };

    let match = blockhtml.match(
      '<h1><a href="/reader/.*?">(.*?)</a></h1>',
      "sig"
    );
    json.title = entities.decode(match[1]).trim();

    match = blockhtml.match(new RegExp('<a href="/type/.*?">(.*?)</a>', "si"));
    json.type = typeToNumber(match[1].trim());

    match = blockhtml.match(
      new RegExp('<span class="date">(.*?)</span>', "si")
    );
    json.date = dateToUnix(match[1].trim());

    match = blockhtml.matchAll(
      new RegExp('<li><a href="/artist/.*?">(.*?)</a></li>', "sig")
    );
    for (let i of match) json.artists.push(i[1]);

    match = blockhtml.matchAll(
      new RegExp('<li><a href="/group/.*?">(.*?)</a></li>', "sig")
    );
    for (let i of match) json.groups.push(i[1]);

    match = blockhtml.matchAll(
      new RegExp('<li><a href="/series/.*?">(.*?)</a></li>', "sig")
    );
    for (let i of match) json.parodys.push(i[1]);

    match = blockhtml.matchAll(
      new RegExp('<li><a href="/character/.*?">(.*?)</a></li>', "sig")
    );
    for (let i of match) json.characters.push(i[1]);

    match = blockhtml.matchAll(
      new RegExp('<li><a href="/tag/.*?">(.*?)</a></li>', "sig")
    );
    for (let i of match) {
      let tag = i[1].trim();

      if (tag.includes(" ♂")) {
        tag = "male:" + tag.replace(" ♂", "");
      } else if (tag.includes(" ♀")) {
        tag = "female:" + tag.replace(" ♀", "");
      }

      json.tags.push(tag);
    }

    return json;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.generateThumbnail = async (buffer) => {
  return await sharp(buffer).resize(500).jpeg({ quality: 80 }).toBuffer();
};

module.exports.generateResizedImage = async (buffer) => {
  return await sharp(buffer).resize(600).jpeg({ quality: 85 }).toBuffer();
};

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

function typeToNumber(type) {
  switch (type) {
    case "doujinshi":
      return 1;
    case "manga":
      return 2;
    case "artist CG":
      return 3;
    case "game CG":
      return 4;
    case "anime":
      return 5;
  }
}

function subdomain_from_galleryid(g, number_of_frontends) {
  var o = g % number_of_frontends;

  return String.fromCharCode(97 + o);
}

function subdomain_from_url(url, base) {
  var retval = "b";
  if (base) {
    retval = base;
  }

  var number_of_frontends = 3;
  var b = 16;

  var r = /\/[0-9a-f]\/([0-9a-f]{2})\//;
  var m = r.exec(url);
  if (!m) {
    return "a";
  }

  var g = parseInt(m[1], b);
  if (!isNaN(g)) {
    var o = 0;
    if (g < 0x88) {
      o = 1;
    }
    if (g < 0x44) {
      o = 2;
    }
    //retval = subdomain_from_galleryid(g, number_of_frontends) + retval;
    retval = String.fromCharCode(97 + o) + retval;
  }

  return retval;
}

function url_from_url(url, base) {
  return url.replace(
    /\/\/..?\.hitomi\.la\//,
    "//" + subdomain_from_url(url, base) + ".hitomi.la/"
  );
}

function full_path_from_hash(hash) {
  if (hash.length < 3) {
    return hash;
  }
  return hash.replace(/^.*(..)(.)$/, "$2/$1/" + hash);
}

function url_from_hash(name, hash, dir, ext) {
  ext = ext || dir || name.split(".").pop();
  dir = dir || "images";

  return (
    "https://a.hitomi.la/" + dir + "/" + full_path_from_hash(hash) + "." + ext
  );
}

function url_from_url_from_hash(name, hash, dir, ext, base) {
  return url_from_url(url_from_hash(name, hash, dir, ext), base);
}

function dateToUnix(dateString) {
  //2007-02-06 20:02:00-06
  //2016-03-27 13:37:33.612-05
  var r =
    /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([+-]\d{2})/;
  var m = r.exec(dateString);
  if (!m) {
    return;
  }

  //2007-02-06T20:02:00-06:00
  return moment(
    m[1] +
      "-" +
      m[2] +
      "-" +
      m[3] +
      "T" +
      m[4] +
      ":" +
      m[5] +
      ":" +
      m[6] +
      m[7] +
      ":00"
  ).unix();
}
