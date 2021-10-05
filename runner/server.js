const lib = require('./lib')
const MongoConnection = require('./MongoConnection')
const fs = require('fs').promises
const { execSync } = require('child_process')
const jobs = require('./jobs')

const jobQueueListener = async () => {
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
    let mdb = await MongoConnection.connect()
    let jobQueue = await mdb.collection('jobQueue')
  
    let queueArr = await jobQueue.find({ 
      runAtDate: { $lt: lib.getUnixTimestamp() },
      status: 'waiting',
      assignedTo: 'runner',
    }).toArray()

    for (let i in queueArr) {
      let result = queueArr[i]
      
      if (result.command === 'gallery_refreshTags') {
        console.log('gallery_refreshTags')
        await setQueueRunning(result._id, jobQueue)
        jobs.updateGalleryJson(result.data).then(async () => {
          await jobQueue.updateOne({ _id: result._id }, { $set: { status: 'completed', endDate: lib.getUnixTimestamp() }})
        }).catch(async (e) => {
          await jobQueue.updateOne({ _id: result._id }, { $set: { status: 'errored', errorMsg: e, endDate: lib.getUnixTimestamp() }})
        })
      }
    
      else if (result.command === 'gallery_upload') {
        console.log('gallery_upload')
        await setQueueRunning(result._id, jobQueue)
        jobs.processGalleryUpload(result.data).then(async () => {
          await jobQueue.updateOne({ _id: result._id }, { $set: { status: 'completed', endDate: lib.getUnixTimestamp() }})
        }).catch(async (e) => {
          await jobQueue.updateOne({ _id: result._id }, { $set: { status: 'errored', errorMsg: e, endDate: lib.getUnixTimestamp() }})
        })
      }
    }
  }
  catch (e) {
    console.error(e)
  }
}

async function setQueueRunning(id, collection) {
  try {
    await collection.updateOne({ _id: id }, { $set: { status: 'running', startedDate: lib.getUnixTimestamp() }})
  }
  catch (e) {
    throw new Error(e)
  }
}

setInterval(() => {
  jobQueueListener()
}, 60000)