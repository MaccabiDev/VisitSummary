var fs = require('fs');
var htmlCreator = require('./html/htmlCreator');
var jsonExemple = require('./jsonExemple/jsonExe');
var keys = require('./config/keys');
var Mustache = require('mustache');
var ejs = require('ejs');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var Promise = require('bluebird');
const pdf = Promise.promisifyAll(require('html-pdf'));
const ClusterReadwriteLock = require("cluster-readwrite-lock");
var sleep = require('thread-sleep');
var lock = new ClusterReadwriteLock(cluster);
var {logger,clusterLogger} = require('./utils/logger');




// let networkDrive = require('windows-network-drive');

// networkDrive.list()
// .then(function(driveLetter){
//     console.log(driveLetter);
// })



const generateNextJson= async(jsonName)=>{
  var jsonData = await getJsonText(jsonName);
  var parsedJson;
  try {
    parsedJson = JSON.parse(jsonData)
  } catch (e) {
    fs.copyFileSync(`${keys.srcNewJson}/${process.pid}/${jsonName}`,`${keys.srcCompletedJson}/err/${jsonName}`);
    fs.unlinkSync(`${keys.srcNewJson}/${process.pid}/${jsonName}`);
    fs.unlinkSync(`${keys.srcNewJson}/Pending/${jsonName}`);
    return console.error(e);
  }
  await createPdf( jsonName,parsedJson).then(()=>{
    fs.copyFileSync(`${keys.srcNewJson}/${process.pid}/${jsonName}`,`${keys.srcCompletedJson}/${jsonName}`);
    fs.unlinkSync(`${keys.srcNewJson}/Pending/${jsonName}`);
    fs.unlinkSync(`${keys.srcNewJson}/${process.pid}/${jsonName}`);
  });
}

const getJsonText = (jsonName)=>{

  return fs.readFileSync(`${keys.srcNewJson}/${process.pid}/${jsonName}`, { encoding : 'utf-8' });
}

const getJsonsBulk=()=>{
  return new Promise(resolve=>{

    var isEmpty = true
    if (!fs.existsSync(`${keys.srcNewJson}/${process.pid}`)){
      fs.mkdirSync(`${keys.srcNewJson}/${process.pid}`);
    }

    var files = fs.readdirSync(`${keys.srcNewJson}/`);
    jsons = files.filter(f => f.includes("Clicks_Maccabi"))

    for(var i=0; i<4;i++){//bulk size
      if(jsons.length>=i+1){
        isEmpty = false;
        fs.copyFileSync(`${keys.srcNewJson}/${jsons[i]}`,`${keys.srcNewJson}/${process.pid}/${jsons[i]}`);
        fs.copyFileSync(`${keys.srcNewJson}/${jsons[i]}`,`${keys.srcNewJson}/Pending/${jsons[i]}`);
        fs.unlinkSync(`${keys.srcNewJson}/${jsons[i]}`);
      }
    }
    resolve(isEmpty);

  });
    
}


const createPdf= async(jsonName, jsonData)=>{
  const basePath = `${keys.basePath}`;
  var options = {
      "timeout":'100000',
      "base":basePath,
      "format": 'Letter',
      "border":"0",
      "orientation": "portrait",
      "header":{
        "height":"130px",
        "contents":`<div style="float:top; font-family:arial; width:100%; text-align:center;">
          <img style="height:60px; margin-bottom:20px;" src="${keys.basePath}images/Maccabi.PNG" >
          <div style="text-align:center; border-bottom:1px solid rgb(41, 83, 182); line-height:0.1em; position:relative">
              <span style="font-size:larger; background:white; padding:0 10px; position:absolute; width:10%; right:45%; top:0; color:rgb(41, 83, 182);"> חסוי רפואי </span>
          </div>
        </div>`
      },
      "footer":{
        "height":"35px",
        "contents":`<div style="width:100%; text-align:center; padding:0">
            <img style="width:100%" src="${keys.basePath}images/Maccabi_footer.PNG">
        </div>`
      }
  }
  await createPdfByHtmlString(options, jsonName , jsonData);
}

function TryParseInt(str,defaultValue) {
  var retValue = defaultValue;
  if(str !== null) {
      if(str.length > 0) {
          if (!isNaN(str)) {
              retValue = parseInt(str);
          }
      }
  }
  return retValue;
}

const createPdfByHtmlString = async(options ,jsonName, jsonData)=>{
  var createdHtml = htmlCreator.createHtml(jsonData);//standart html string -----------------------------------------
  // pdf.create(createdHtml,options).toFile(, function(err, res) {
  //   if (err) return console.log(err);
  // });
  var year;
  var month;
  var day;
  var createResult = await pdf.create(createdHtml,options);
  var pdfToFile = Promise.promisify(createResult.__proto__.toFile, {context: createResult});// makes the createResult.toFile() return a promise instead of callback , 
  if(jsonData.visit_date!==("")){
    var dateParts = jsonData.visit_date.split("/")
    console.log(dateParts);
    
    year = TryParseInt(dateParts[2],'unknown');
    month = TryParseInt(dateParts[1],'unknown');
    day = TryParseInt(dateParts[0],'unknown');

    if(!month.isNaN){
      month = ("0" + month).slice(-2);
    }

    if(!day.isNaN){
      day = ("0" + day).slice(-2);
    }

    console.log(`${day}/${month}/${year}`);
  }

  lock.acquireWrite('bb',async()=>{
    if (!fs.existsSync(`${keys.destPDF}/${year}`)){
      fs.mkdirSync(`${keys.destPDF}/${year}`);
    }
    if (!fs.existsSync(`${keys.destPDF}/${year}/${month}`)){
      fs.mkdirSync(`${keys.destPDF}/${year}/${month}`)
    }
    if (!fs.existsSync(`${keys.destPDF}/${year}/${month}/${day}`)){
      fs.mkdirSync(`${keys.destPDF}/${year}/${month}/${day}`)
    }

  });
  
  await pdfToFile(`${keys.destPDF}/${year}/${month}/${day}/${jsonData.message_code}_${jsonData.source_row_id}_ConsultationSummaryLetter_${jsonData.patient_id}_3000_Maccabi.pdf`).then((x)=>{
    // logger.info(`${jsonName} was generated!!!`);
  });
}

const createPdfByMustache = async()=>{
  let template="";//mustache----------------------------------------
  await fs.readFile('./html/templates/projectTemplate.mustache', 'utf8',function(err,data){
    if (err){
      // logger.error(err);
      clusterLogger(error,err);
    }
    else{
      template= data;
      var output = Mustache.render(template, jsonExemple.jsonExe);
      pdf.create(output, options).toFile(`./PDF/businesscard--${process.pid}.pdf`, function(err, res) {
        if (err){
          // logger.error(err);
          clusterLogger(error,err);
        }
      });
    }
  });
}

const createPdfByEJS = async()=>{
  let template="";//ejs----------------------------------------
  await fs.readFile('./html/templates/ejsTemplate.ejs', 'utf8',function(err,data){
    if (err){
      // logger.error(err);
      clusterLogger(error,err);
    }
    else{
      template= data;
      var output = ejs.render(template, jsonExemple.jsonExe, options);
      pdf.create(output, options).toFile(`./PDF/businesscard--${process.pid}.pdf`, function(err, res) {
        if (err){
          // logger.error(err);
          clusterLogger(error,err);
        }
      });
    }
  });
}



const generationProcess= async()=>{
  lock.acquireWrite('aa',async()=>{
    var isEmptySrc
    //take bulk and put it in the folder named pid(process worker);
      await getJsonsBulk().then(isEmpty=>{
        if(isEmpty == false){
          // logger.info(`bulk was copied to process ${process.pid}`);
        }
        isEmptySrc = isEmpty;
      });
      return isEmptySrc;
  }).then(async(isEmptySrc)=>{
    if(isEmptySrc){
      await sleep(1000);
      await generationProcess();
    }
    else{
      var jsons=fs.readdirSync(`${keys.srcNewJson}/${process.pid}/`);
      for(var i=0; i<jsons.length;i++){
        await generateNextJson(jsons[i]);
      }
      await generationProcess();
    }
  }).catch((err)=>{
    clusterLogger(error,err);
    generationProcess();
  });
}

if (cluster.isMaster) {
  //  logger.info(`Master ${process.pid} is running`);
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  // logger.info('workers created by master cluster!!!');

  cluster.on('exit', (worker, code, signal) => {
    clusterLogger(error,`worker ${worker.process.pid} died`);
  });
}else{
  try{
    // logger.info(`worker started`);
    generationProcess();
  }catch(err){
    clusterLogger(error,`${process.pid} error:`)
    clusterLogger('error',err);
  }
}
















