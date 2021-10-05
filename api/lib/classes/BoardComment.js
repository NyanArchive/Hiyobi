module.exports = class Board {
  constructor(row) {
    this.id = row.id;
    this.writeid = row.writeid;
    this.parentid = row.parentid;
    this.userid = row.userid;
    this.name = row.name;
    this.password = row.password;
    this.memo = row.memo;
    this.date = row.date;
  }

  toJSON() {
    return {
      id: this.id,
      writeid: this.writeid,
      parentid: this.parentid,
      userid: this.userid,
      name: this.name,
      // password: this.password,
      memo: this.memo,
      date: this.date,
    };
  }
};
