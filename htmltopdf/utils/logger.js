
const cluster = require('cluster');
const ClusterReadwriteLock = require("cluster-readwrite-lock");
var lock = new ClusterReadwriteLock(cluster);
var winston = require('winston');
const { combine, timestamp, json} = winston.format;

module.exports.logger = winston.createLogger({
    level:'info',
    format:combine(timestamp(),json()),
    // defaultMeta:{ service: 'user-service' },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log',timestamp:true, level: 'error' }),
         // new winston.transports.File({ filename: 'info.log', level: 'info' }),
        new winston.transports.File({ filename: 'combined.log',timestamp:true ,level: 'info'}),
       // new winston.transports.Console({ level: 'info' })
      ]
});

module.exports.clusterLogger = async(level, message)=>{
  lock.acquireWrite(level,async()=>{
    if(level === "error"){
      module.exports.logger.error(message);
    }
    else{
      module.exports.logger.info(message);
    }
  })
};