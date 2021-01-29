const express = require('express')
const morgan = require('morgan')
const multer = require('multer')
const cors = require('cors')
const chalk = require('chalk');
const { networkInterfaces } = require('os');
const path = require('path')
const fs = require('fs')
const { arch } = require('os')
const app = express()
let address_server = ''

function config_file(address){
  fs.writeFile("public/config_ip.js",'const address="'+address+'";',(error)=>{
    if(error){
      console.log("error al configurar ip: "+error);
      return 0;
    }
  });
}

function config_ip(){
  const nets = networkInterfaces();
  const results = Object.create(null);
  
  for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
              if((name == "wlp3s0") || (name=="wlan0") || (name=="Wi-Fi") || (name=="eth0")){
                address_server = net.address;
                config_file(net.address)
                break;
              }
          }
      }
  }
}
config_ip()

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

app.all('/*', function(req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
  next(); 
});  


var storage = multer.diskStorage({
  destination:path.join(__dirname,'public/uploads'),
  filename:function (req, file, cb) {
    cb(null,file.originalname);
  },

})
var upload = multer ( {
  storage,
  dest: path.join(__dirname,'public/uploads')
})

app.get('/ficheros',(req,res)=>{
  
  fs.readdir(__dirname+"/public/uploads",(error,archivos)=>{
    if(error){console.log("error al leer archivos");return 0}
    res.status(200).json({ficheros:archivos})
  })
})

app.post('/', upload.single('documento'), function (req,res) {
  fs.readdir(__dirname+"/public/uploads",(error,archivos)=>{
    if(error){console.log("error al leer archivos");return 0}
    res.status(200).json({ficheros:archivos})
  })
})

app.use(express.static(path.join(__dirname,'public')))

app.listen(3000,(error)=>{
    if(error){console.log(error);return 0}
    console.log(chalk.green("accede desde tu dispositivo como"));
    console.log(chalk.yellow("http://"+address_server+":3000"))
})
