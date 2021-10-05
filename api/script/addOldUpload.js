const db = require("../lib/DB").promise();
const MongoConnection = require("../lib/MongoConnection");
const { customAlphabet } = require("nanoid");

const gallToJson = (row) => {
  const result = {};

  result.id = typeof row.id === "undefined" ? 0 : row.id;
  result.uid = typeof row.uid === "undefined" ? 0 : row.uid;
  result.title = typeof row.name === "undefined" ? "" : row.name;
  result.uploader = typeof row.uploader === "undefined" ? "" : row.uploader;
  result.uploadername =
    typeof row.uploadername === "undefined" ? "" : row.uploadername;

  result.artists = columnToArray(row.artists);
  result.groups = columnToArray(row.groups);
  result.parodys = columnToArray(row.parodys);
  result.characters = columnToArray(row.characters);
  result.tags = columnToArray(row.tags);

  result.language =
    typeof row.language === "undefined" ? "korean" : row.language;
  result.type = typeof row.type === "undefined" ? 0 : row.type;
  result.category = typeof row.category === "undefined" ? 0 : row.category;
  result.date = new Date(row.date).getTime() / 1000;

  return result;
};

const columnToArray = (col) => {
  if (typeof col === "undefined") {
    return [];
  }

  let tmp = col.split("|");
  tmp = tmp.filter((val) => {
    if (val === "") {
      return false;
    } else {
      return true;
    }
  });

  return tmp;
};

const init = async () => {
  const mongodb = await MongoConnection.connect();
  const galleries = mongodb.collection("galleries");

  const [rows] = await db.query(
    "select * from galleries where id > 10000000 and type != 10 and id != 10000001 and id != 10000019 and id != 10000021"
  );

  const datas = [];
  for (const i in rows) {
    const data = gallToJson(rows[i]);
    delete data.uid;

    // id중복 확인
    const randid = customAlphabet(
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIKJLMNOPQRSTUVWXYZ",
      6
    );
    while (1) {
      const id = randid();
      const result = await galleries.findOne({ id: id });
      if (result === null || result.length === 0) {
        data.oldid = data.id;
        data.id = id;
        break;
      }
    }

    data.language = "korean";
    data.source = "hiyobi";
    data.uploadStatus = "completed";
    data.invisible = true;

    console.log(data.oldid, data.id);
    delete data.oldid;
    datas.push(data);
  }

  await galleries.insertMany(datas);
};

init();
