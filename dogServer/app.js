
const os = require("os")
const { io } = require("socket.io-client");
const { setTimeout } = require("timers/promises")
const readlineSync = require('readline-sync');
const axios = require("axios");

let token, email;

async function generate() {
  try {

    // async function getToken() {
    //   try {
    //     let res = await axios.post("http://compiler.today:4000/token", data)
    //     console.log("\nToken generated successfully!\n")
    //     return res.data
    //   } catch (err) {
    //     console.log(err)
    //   }
    // }

    console.clear()
    console.log("------------------------------------------------------------")
    console.log("\t CLIENT AUTHENTICATION TOKEN GENERATION")
    console.log("------------------------------------------------------------")

    data = { clientType: "dog" }

    data.macA = readlineSync.question("Enter your MAC Address: ")
    let regexp = /^[0-9a-f]{2}(:[0-9a-f]{2}){5}$/i;

    while (!regexp.test(data.macA))
      data.macA = readlineSync.question("Invalid MAC Address. Enter again : ")

    email = readlineSync.question("Enter your Email Address: ")
     regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    while (!regexp.test(email))
      email = readlineSync.question("Invalid Email Address. Enter again : ")

    console.log("Generating Token .... ")
    let res = await axios.post("http://compiler.today:4000/token", data)
    console.log("\nToken generated successfully!\n")
    token = res.data
  }
  catch (err) {
    console.log(err.response.data)
    process.exit(0)
  }
}

async function main() {
  try {
    await generate()

    let macA;
    const nI = os.networkInterfaces();
    for (let key in nI) {
      if (!nI[key][0].internal) {
        macA = nI[key][0].mac;
        break;
      }
    }
    const socket = io("http://compiler.today:4000");

    socket.on("connect", async () => {
      console.log("I am connected to the socket server worker thread... Yayyyy!!");

      //Client Auth
      socket.emit("clientAuth", token);

      socket.emit("initPerfData", await initPerfData());

      let perfDataInterval = setInterval(async () => {
        socket.emit("perfData", await performanceData());
        //console.log("doing.....");
      }, 1000);

      socket.on('error', (error) => {
        console.log(error);
      });

      socket.on("disconnect", () => {
        clearInterval(perfDataInterval);
      });

    });


    /*
        Performace Monitoring Metrics : 
            Live CPU Load (Current)
            Memory Usage
                - Free Memory
                - Total Memory
            OS Type : Mac (Darwin) , Windows, Linux
            UpTime
            CPU Arch Info : Type Of Arch,  Number of Cores , Clock Speed
    */


    async function initPerfData() {
      const data = await performanceData();
      data.macA = macA;
      data.email = email;
      return data;
    }

    async function performanceData() {
      const cpus = os.cpus();
      const osType = os.type() == "Darwin" ? "Mac" : os.type();
      const upTime = os.uptime();
      const freeMem = os.freemem()/(1024*1024);
      const totalMem = os.totalmem()/(1024*1024);
      const usedMem = totalMem - freeMem;
      const memUsage = Math.floor((usedMem / totalMem) * 100) / 100;
      const cpuModel = cpus[0].model;
      const cpuSpeed = cpus[0].speed;
      const numCores = cpus.length;
      const cpuLoad = await getCpuLoad();
      return {
        macA: macA,
        osType,
        upTime,
        freeMem,
        totalMem,
        usedMem,
        memUsage,
        cpuModel,
        cpuSpeed,
        numCores,
        cpuLoad,
        email: email
      };
    }


    async function getCpuLoad() {
      const start = cpuAvg();
      await setTimeout(100);
      const end = cpuAvg();
      const idleDifference = end.idleMs - start.idleMs;
      const totalDifference = end.totalMs - start.totalMs;
      //   console.log(idleDifference, totalDifference);
      const percentageCpu =
        100 - Math.floor((100 * idleDifference) / totalDifference);
      return percentageCpu;
    }

    function cpuAvg() {
      const cpus = os.cpus();

      //Get ms in each mode, BUT this ms number is since reboot
      // So we need it now, and get it again in 100ms and compare
      let idleMs = 0;
      let totalMs = 0;
      cpus.forEach((core) => {
        for (let type in core.times) {
          //  console.log(type,core.times[type]);
          totalMs += core.times[type];
        }
        idleMs += core.times.idle;
      });
      return {
        totalMs: totalMs / cpus.length,
        idleMs: idleMs / cpus.length,
      };
    }

  } catch (err) {
    console.log(err.response, "error")
  }
}

main()
