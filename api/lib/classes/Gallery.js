const l10n = require("../l10n");
const gallerylib = require("../gallery");
module.exports = class Gallery {
  constructor(row) {
    if (typeof row === "undefined" || row === null) {
      row = {};
    }

    this.id = typeof row.id === "undefined" ? 0 : row.id;
    this.uid = typeof row.uid === "undefined" ? 0 : row.uid;
    this.title = typeof row.title === "undefined" ? "정보없음" : row.title;
    this.uploader = typeof row.uploader === "undefined" ? 0 : row.uploader;
    this.uploadername =
      typeof row.uploadername === "undefined" ? "" : row.uploadername;

    this.artists = columnToArray(row.artists);
    this.groups = columnToArray(row.groups);
    this.parodys = columnToArray(row.parodys);
    this.characters = columnToArray(row.characters);
    this.tags = columnToArray(row.tags);

    this.language =
      typeof row.language === "undefined" ? "korean" : row.language;
    this.type = typeof row.type === "undefined" ? 0 : row.type;
    this.category = typeof row.category === "undefined" ? 0 : row.category;
  }

  toJSON() {
    return {
      id: this.id,
      uid: this.uid,
      title: this.title,
      uploader: this.uploader,
      uploadername: this.uploadername,

      artists: this.artists,
      groups: this.groups,
      parodys: this.parodys,
      characters: this.characters,
      tags: this.tags,

      language: this.language,
      type: this.type,
      category: this.category,
      comments: this.comments,
      count: this.count,
      like: this.like,
      like_anonymous: this.like_anonymous,
    };
  }

  async translateGallery() {
    if (this.artists.length !== 0) {
      for (const i in this.artists) {
        const artist = this.artists[i].value;
        this.artists[i].display = await l10n.tagToTranslate({
          type: 2,
          original: artist,
        });
      }
    }

    if (this.groups.length !== 0) {
      for (const i in this.groups) {
        const group = this.groups[i].value;
        this.groups[i].display = await l10n.tagToTranslate({
          type: 3,
          original: group,
        });
      }
    }

    if (this.parodys.length !== 0) {
      for (const i in this.parodys) {
        const parody = this.parodys[i].value;
        this.parodys[i].display = await l10n.tagToTranslate({
          type: 4,
          original: parody,
        });
      }
    }

    if (this.characters.length !== 0) {
      for (const i in this.characters) {
        const character = this.characters[i].value;
        this.characters[i].display = await l10n.tagToTranslate({
          type: 5,
          original: character,
        });
      }
    }

    if (this.tags.length !== 0) {
      for (const i in this.tags) {
        const tag = this.tags[i].value;
        this.tags[i].display = await l10n.tagToTranslate({
          type: 6,
          original: tag,
        });
      }
    }
  }

  async getCount() {
    const result = await gallerylib.getGalleryCount(this.id);

    if (result === null) {
      this.comments = 0;
      this.count = 0;
      this.like = 0;
      this.like_anonymous = 0;
    } else {
      this.comments = result.comment ? result.comment : 0;
      this.count = result.count ? result.count : 0;
      this.like = result.likebtn ? result.likebtn : 0;
      this.like_anonymous = result.likebtn_anony ? result.likebtn_anony : 0;
    }
  }
};

function columnToArray(col) {
  if (typeof col === "undefined") {
    return [];
  }

  col = col.filter((val) => {
    if (val === "") {
      return false;
    } else {
      return true;
    }
  });

  col = col.map((val) => {
    return { value: val };
  });

  return col;
}
