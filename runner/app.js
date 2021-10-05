const sharp = require('sharp')
const lib = require('./lib')
const MongoConnection = require('./MongoConnection')
const fs = require('fs').promises
const { execSync } = require('child_process')
const os = require('os')

const temppath = os.tmpdir() + '/htemp'

/*
1. 리스트 가져오고
2. 순서대로 있는지 확인
3. 없으면 다운로드 시작
 3-1. json파일 다운로드 및 저장
 3-2. json파일에 따라 이미지 다운로드
 3-3. 썸네일 생성, resize이미지 생성
 3-4. 완료되면 스토리지에 파일전송
 3-5. 파일 처리 완료되면 DB에 입력
4. 모두 완료되면 정리 후 종료

a. 자동완성 파일 생성
*/


async function init() {
  console.log('Crawler start')

  //설정 파일 확인
  let config
  try {
    config = require('./config')
  }
  catch (e) {
    console.log('Err : Check config file exists')
    console.error(e)
  }

  try {
    //mongdb연결
    let mdb = await MongoConnection.connect()
    let Galleries = await mdb.collection('galleries')
    //let jobQueue = await mdb.collection('jobQueue')

    //1.
    console.log('Fetching Gallery list...')
    let list = await lib.getGalleryList()
    let downloadList = []
    console.log('Fetching Gallery list OK (' + list.length + ' records)')

    //2.
    let count = 0
    for (let i in list) {
      let id = list[i]

      let result = await Galleries.find({ id: id }).toArray()
      
      if (result.length === 0) {
        downloadList.unshift(id)
      }
      else {
        count++
      }

      //30개 이상 중복되면 패스
      if (count >= 30) {
        break
      }
    }

    console.log(downloadList.length + ' gallery download Required')

    await fs.mkdir(`${temppath}/json`, { recursive: true })
    await fs.mkdir(`${temppath}/tn`, { recursive: true })

    //3.
    console.log('Download start...')
    for (let i in downloadList) {
      try {
        let id = downloadList[i]
        console.log(id + ' download start...')

        //3-1
        console.log('Generating gallery json...')
        let json = await lib.getGalleryJson(id)
        console.log('Generating gallery json OK\r\n')

        console.log('Download gallery js file...')
        let js = await lib.getGalleryJs(id)
        console.log('Download gallery js file OK\r\n')
        let files = js.files

        await fs.mkdir(`${temppath}/data/${id}`, { recursive: true })
        await fs.writeFile(`${temppath}/json/${id}_list.json`, JSON.stringify(files))

        //3-2
        for (let i in files) {
          let file = files[i]
          let index = Number(i)
          let fname = file.name.split('.')
          fname.pop()
          fname = fname.join('')

          console.log(`Download image => ${id} : ${file.name}(${index+1}/${files.length})...`)
          let image = await lib.downLoadImage({ name: file.name, hash: file.hash })
          await fs.writeFile(`${temppath}/data/${id}/${file.name}`, image)
          console.log(`Download image => ${id} : ${file.name}(${index+1}/${files.length}) OK\r\n`)

          //3-3
          //thumbnail
          if (index === 0) {
            console.log(`Tn image => ${id} : ${file.name}...`)
            let tn = await lib.generateThumbnail(image)
            await fs.writeFile(`${temppath}/tn/${id}.jpg`, tn)
            console.log(`Tn image => ${id} : ${file.name} OK\r\n`)
          }

          //resize
          console.log(`Resize image => ${id} : ${file.name}...`)
          let resized = await lib.generateResizedImage(image)
          await fs.mkdir(`${temppath}/data_r/${id}`, { recursive: true })
          await fs.writeFile(`${temppath}/data_r/${id}/${fname}.jpg`, resized)
          console.log(`Resize image => ${id} : ${file.name} OK\r\n`)
          
        }

        //3-4
        if (config.servers.length !== 0) {
          console.log(`Send image to Storage => ${id}...`)
          for (let i in config.servers) {
            let ip = config.servers[i]
            console.log(execSync(`chmod +x ./script/copy.sh`).toString())
            console.log(execSync(`sh ./script/copy.sh ${id} ${ip}`).toString())
          }
          console.log(`Send image to Storage => ${id} OK\r\n`)
        }
        console.log(id + ' download done.')

        //3-5
        console.log(id + ' insert Document')
        await Galleries.insertOne(json)
      }
      catch (e) {
        console.error(e)
      }
    }
    process.exit()
  }
  catch (e) {
    console.error(e)
  }
}

init()