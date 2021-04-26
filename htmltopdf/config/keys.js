//keys.js figure aout what set of credentials to return 
if (process.env.NODE_ENV.trim() === "prod"){
    module.exports = require('./prod')
}else{
    module.exports = require('./dev')
}