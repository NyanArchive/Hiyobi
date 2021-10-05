module.exports = class User {
  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.password = row.password;
    this.salt = row.salt;
    this.email = row.email;
    this.verified = row.verified;
    this.regdate = row.regdate;
    this.memo = row.memo;
    this.verifycode = row.verifycode;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      // password: this.password,
      // salt: this.salt,
      // email: this.email,
      // verified: this.verified,
      // regdate: this.regdate,
      // memo: this.memo,
      // verifycode: this.verifycode
    };
  }
};
