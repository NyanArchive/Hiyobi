let lib = require('./lib')
const MongoConnection = require('./MongoConnection')
const AdmZip = require('adm-zip');
const os = require('os')
const temppath = os.tmpdir() + '/htemp'
const fs = require('fs').promises
const { orderBy } = require('natural-orderby');
const sharp = require('sharp');
const allowedImageExtension = ['jpeg', 'jpg', 'gif', 'png']
const { execSync } = require('child_process')

module.exports.downloadGallery = async (id) => {
  //설정 파일 확인
  let config
  try {
    config = require('./config')
  }
  catch (e) {
    console.log('Err : Check config file exists')
    console.error(e)
  }

  let mdb = await MongoConnection.connect()
  let Galleries = await mdb.collection('galleries')

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
      execSync(`chmod +x ./script/copy.sh`)
      let stdout = execSync(`sh ./script/copy.sh ${id} ${ip}`)
    }
    console.log(`Send image to Storage => ${id} OK\r\n`)
  }
  console.log(id + ' download done.')

  //3-5
  console.log(id + ' insert Document')
}

module.exports.updateGalleryJson = async (id) => {
  //id가 숫자인지 확인
  if (isNaN(id)) { 
    throw new Error(id + ' is not Number')
  }

  try {
    let mdb = await MongoConnection.connect()
    let Gallery = await mdb.collection('galleries')

    let result = await Gallery.findOne({ id: id })
    //해당ID 갤러리가 있는지 확인
    if (!result || result.length === 0) {
      throw new Error(id + ' not exists')
    }

    let json = await lib.getGalleryJson(id)

    //업데이트
    await Gallery.updateOne({ id: id }, { $set: json })

    return 
  }
  catch (e) {
    throw new Error(e.toString())
  }
}

module.exports.processGalleryUpload = async (id) => {
  //설정 파일 확인
  let config
  try {
    config = require('./config')
  }
  catch (e) {
    console.log('Err : Check config file exists')
    console.error(e)
  }
  
  if (typeof id === 'undefined' || id === '') {
    throw 'id not set ' + id
  }
  
  /*
  미러링과 절차는 동일
  3-1. json파일 다운로드 및 저장
  3-3. 썸네일 생성, resize이미지 생성
  3-4. 완료되면 스토리지에 파일전송
  3-5. 파일 처리 완료되면 DB에 입력
  4. 모두 완료되면 정리 후 종료
  */  

  try {
    let mdb = await MongoConnection.connect()
    let Gallery = await mdb.collection('galleries')

    let result = await Gallery.findOne({ id: id })
    //해당ID 갤러리가 있는지 확인
    if (!result || result.length === 0) {
      throw id + ' not exists'
    }

    //업로드 대기상태가 아니면
    if (typeof result.uploadStatus === 'undefined' || result.uploadStatus !== 'waiting') {
      throw id + ' is not waiting for upload process'
    }

    //업로드 처리 시작
    await Gallery.updateOne({ _id: result._id}, { $set: { uploadStatus: 'running' } })
    let listJson = []

    //임시폴더 생성
    fs.mkdir(`${temppath}/data/${id}`, { recursive: true })
    fs.mkdir(`${temppath}/data_r/${id}`, { recursive: true })
    fs.mkdir(`${temppath}/json`, { recursive: true })
    fs.mkdir(`${temppath}/tn`, { recursive: true })
    
    //파일 압축 해제
    let zip = new AdmZip(`${temppath}/${id}.zip`)
    let entries = zip.getEntries()

    //파일이름 기준 정렬
    let ordered = orderBy(entries, [v=>v.entryName])

    //이미지 검증 시작 및 List Json 생성
    for(let i in ordered) {
      let file = ordered[i]

      let extension = file.entryName.split('.').pop()
      
      //허용되지 않은 이미지 확장자명인지 검증
      if (!allowedImageExtension.includes(extension.toLowerCase())) {
        await Gallery.updateOne({ _id: result._id }, { $set: { uploadStatus: 'errored', errorMsg: '파일 확장자는 jpeg, jpg, png, gif만 허용됩니다. file : ' + file.entryName } })
        throw 'Extension is invalid : ' + file.entryName
      }

      //sharp로 이미지인지 2차 검증 후 사이즈 구해서 listjson에 입력
      try {
        let rawimage = file.getData()
        let sharpimage = sharp(rawimage)
        let imagemeta = await sharpimage.metadata()

        
        //확장자 검증
        if (!allowedImageExtension.includes(imagemeta.format.toLowerCase())) {
          await Gallery.updateOne({ _id: result._id }, { $set: { uploadStatus: 'errored', errorMsg: '파일 확장자는 jpeg, jpg, png, gif만 허용됩니다. file : ' + file.entryName } })
          throw `Image format not allowed [${file.entryName} (${imagemeta.format})]`
        }

        //listjson에 추가
        listJson.push({
          width: imagemeta.width,
          height: imagemeta.height,
          name: file.entryName
        })

        //첫번째 파일이면 썸네일 생성
        if (Number(i) === 0) {
          let tn = await lib.generateThumbnail(rawimage)
          await fs.writeFile(`${temppath}/tn/${result.id}.jpg`, tn)
        }

        //리사이즈 이미지 생성
        let resized = await lib.generateResizedImage(rawimage)
        await fs.writeFile(`${temppath}/data_r/${result.id}/${file.entryName.split('.').slice(0, -1).join('.')}.jpg`, resized)

        //원본이미지
        await fs.writeFile(`${temppath}/data/${result.id}/${file.entryName}`, rawimage)
      }
      catch (e) {
        console.error(e)
        await Gallery.updateOne({ _id: result._id }, { $set: { uploadStatus: 'errored', errorMsg: '이미지파일이 아닌것 같습니다. file : ' + file.entryName } })
        throw e
      }
    }

    //json파일 저장
    await fs.writeFile(`${temppath}/json/${result.id}_list.json`, JSON.stringify(listJson))

    //스토리지 업로드
    for (let i in config.servers) {
      let ip = config.servers[i]
      console.log(execSync(`chmod +x ./script/copy_upload.sh`).toString())
      console.log(execSync(`sh ./script/copy_upload.sh ${result.id} ${ip}`).toString())
    }

    //완료 및 DB수정
    await Gallery.updateOne({ _id: result._id }, { $set: { invisible: false, uploadStatus: 'completed' }})
    return true
  }
  catch (e) {
    console.error(e)
    await Gallery.updateOne({ _id: result._id }, { $set: { uploadStatus: 'errored', errorMsg: '알 수 없는 에러' } })
    throw e.toString()
  }
}