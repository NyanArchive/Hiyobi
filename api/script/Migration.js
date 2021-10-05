const db = require('../lib/DB').promise()
let squel = require('squel')
let moment = require('moment')

init()

async function init () {
  try {
    const [rows] = await db.query('select * from galleries order by id asc')

    for (let i in rows) {
      let row = rows[i]

      // 히요비 업로드일경우 id를 변경
      if (row.id > 10000000) {
        row.id = 'H' + row.id % 10000000
      }

      let sql = squel.insert().into('gallery')
        .set('uid', row.id)
        .set('orgtitle', row.name)
        .set('language', row.language)
        .set('type', 1)
        .set('category', row.type)
        .set('cnt', row.cnt)
        .set('date', moment(row.date).format('YYYY-MM-DD HH:mm:ss'))
        .set('status', 0)
        .toParam()

      const [result] = await db.query(sql.text, sql.values)

      let tagsdata = []
      let artists = parsetags(row.artists)
      if (artists.length !== 0) {
        for (let i in artists) {
          tagsdata.push({
            galleryid: result.insertId,
            type: 1,
            tag: artists[i]
          })
        }
      }
      let groups = parsetags(row.groups)
      if (groups.length !== 0) {
        for (let i in groups) {
          tagsdata.push({
            galleryid: result.insertId,
            type: 2,
            tag: groups[i]
          })
        }
      }
      let parodys = parsetags(row.parodys)
      if (parodys.length !== 0) {
        for (let i in parodys) {
          tagsdata.push({
            galleryid: result.insertId,
            type: 3,
            tag: parodys[i]
          })
        }
      }
      let characters = parsetags(row.characters)
      if (characters.length !== 0) {
        for (let i in characters) {
          tagsdata.push({
            galleryid: result.insertId,
            type: 4,
            tag: characters[i]
          })
        }
      }
      let tags = parsetags(row.tags)
      if (tags.length !== 0) {
        for (let i in tags) {
          tagsdata.push({
            galleryid: result.insertId,
            type: 5,
            tag: tags[i]
          })
        }
      }

      if (tagsdata.length > 0) {
        let tagsql = squel.insert().into('gallerytags').setFieldsRows(tagsdata).toParam()

        await db.query(tagsql.text, tagsql.values)
      }
      console.log(row.id + ' : inserted')
    }
    process.exit()
  } catch (e) {
    console.error(e)
  }
}

function parsetags (str) {
  const list = str.split('|').filter((val) => {
    if (val === '') {
      return false
    }
    return true
  })
  return list
}
