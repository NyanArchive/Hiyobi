const MongoClient = require("mongodb").MongoClient;

class Connection {
  static async connect() {
    if (this.db) {
      return this.db;
    }

    const client = await MongoClient.connect(this.url, this.options);
    this.db = client.db("gallery");
    return this.db;
  }
}

Connection.db = null;
Connection.url = "mongodb://127.0.0.1:27017/?poolSize=100";
Connection.options = {
  bufferMaxEntries: 0,
  reconnectTries: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = Connection;
