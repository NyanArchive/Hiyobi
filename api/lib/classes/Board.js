const board = require("../board");
const CommentClass = require("./BoardComment");
module.exports = class Board {
  constructor(row) {
    this.id = row.id;
    this.userid = row.userid;
    this.name = row.name;
    this.title = row.title;
    this.category = row.category;
    this.categoryname = row.categoryname;
    this.memo = row.memo;
    this.date = row.date;
    this.cmtcnt = row.cmtcnt;
    this.cnt = row.cnt;
    this.comment = [];
    this.isnoti = row.isnoti;
    this.imgcount = row.imgcount;
  }

  toJSON() {
    return {
      id: this.id,
      userid: this.userid,
      name: this.name,
      title: this.title,
      category: this.category,
      categoryname: this.categoryname,
      memo: this.memo,
      date: this.date,
      cmtcnt: this.cmtcnt,
      cnt: this.cnt,
      comment: this.comment.map((val) => val.toJSON()),
      isnoti: this.isnoti,
      imgcount: this.imgcount,
    };
  }

  toJSONList() {
    return {
      id: this.id,
      userid: this.userid,
      name: this.name,
      title: this.title,
      category: this.category,
      categoryname: this.categoryname,
      // memo: this.memo,
      date: this.date,
      cmtcnt: this.cmtcnt,
      cnt: this.cnt,
      isnoti: this.isnoti,
      imgcount: this.imgcount,
    };
  }

  async countUp() {
    await board.countup(this.id);
  }

  async getComments() {
    let result = await board.getComments(this.id);

    result = result.map((val) => {
      return new CommentClass(val);
    });

    this.comment = result;
  }

  async getImages() {
    const result = await board.getWriteImages(this.id);

    this.images = result;
  }
};
