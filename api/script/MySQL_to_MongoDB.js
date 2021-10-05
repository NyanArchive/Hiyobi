const mydb = require('../lib/DB').promise()
const Connection = require('../lib/MongoConnection')
const Gallery = require('../lib/classes/Gallery')

const gallToJson = (row) => {
  let result = {}

  result.id = (typeof row.id === 'undefined') ? 0 : row.id
  result.uid = (typeof row.uid === 'undefined') ? 0 : row.uid
  result.title = (typeof row.name === 'undefined') ? '' : row.name
  result.uploader = (typeof row.uploader === 'undefined') ? '' : row.uploader
  result.uploadername = (typeof row.uploadername === 'undefined') ? '' : row.uploadername

  result.artists = columnToArray(row.artists)
  result.groups = columnToArray(row.groups)
  result.parodys = columnToArray(row.parodys)
  result.characters = columnToArray(row.characters)
  result.tags = columnToArray(row.tags)

  result.language = (typeof row.language === 'undefined') ? 'korean' : row.language
  result.type = (typeof row.type === 'undefined') ? 0 : row.type
  result.category = (typeof row.category === 'undefined') ? 0 : row.category

  return result
}

const columnToArray = (col) => {
  if (typeof col === 'undefined') {
    return []
  }

  let tmp = col.split('|')
  tmp = tmp.filter((val) => {
    if (val === '') {
      return false
    } else {
      return true
    }
  })

  return tmp
}

const init = async () => {
  try {
    const [rows] = await mydb.query('select * from galleries where id < 10000000')

    let datas = [];
    for (let i in rows) {
      let data = gallToJson(rows[i])
      delete data.uid
      datas.push(data)
    }

    let mongodb = await Connection.connect()
    let galleries = mongodb.collection('galleries')

    await galleries.insertMany(datas)

    await galleries.createIndex({ id: -1 })
    await galleries.createIndex({ title: 1 })
  
    await galleries.createIndex({ artists: 1 })
    await galleries.createIndex({ groups: 1 })
    await galleries.createIndex({ parodys: 1 })
    await galleries.createIndex({ characters: 1 })
    await galleries.createIndex({ tags: 1 })
    await galleries.createIndex({ type: 1 })
    await galleries.createIndex({ category: 1 })
  }
  catch (e) {
    throw (e)
  }
}

init()

/*
let db = await Connection.connect()
let galleries = db.collection('galleries')

let result = await galleries.findOne({ title: word })

return result
*/