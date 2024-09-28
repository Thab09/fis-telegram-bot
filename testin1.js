import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import dotenv from "dotenv";
dotenv.config();
// const {Telegraf} = require("telegraf");
import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.telegram_key); // api key

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5Q7LnjzHVLng3hHQnMllYsmWZET9d110",
  authDomain: "mpl-qbot.firebaseapp.com",
  databaseURL:
    "https://mpl-qbot-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mpl-qbot",
  storageBucket: "mpl-qbot.appspot.com",
  messagingSenderId: "305267191220",
  appId: "1:305267191220:web:8c96f358007b8bd8e316e1",
  measurementId: "G-1YP1JRQZGE",
};

initializeApp(firebaseConfig); // init Firebase app
const db = getFirestore(); // init firestore database
const lorryDb = collection(db, "MplLorryList"); // FS lorry list collection
// getDocs(lorryDb) // collects all data from FS
//     .then((snapshot) => {
//         let lorrys = [];
//         snapshot.docs.forEach((doc) => {
//             lorrys.push({...doc.data(), id: doc.id})
//         });
//         console.log(lorrys);
//     })
//     .catch(err => {
//         console.log("ERROR lorryDb: " + err.message);
//     });
// const functions = getFunctions(app);

let messageId; //storing message id to be deleted
let numberToCheck; //storing user send number

const functions = getFunctions();
const trySomething = httpsCallable(functions, "trySomething");
trySomething({ text: 20 })
  .then((result) => {
    const data = result.data;
    // const data2 = data.text;
    console.log(data);
    // console.log("22 "+data2);
  })
  .catch((error) => {
    const code = error.code;
    const message = error.message;
    const details = error.details;
  });

bot.start((ctx) => {
  // console.log("chat id "+ctx.chat.id);
  startMenu(ctx);
});

/////////////////////////////////////////////////
// 21 // 201 //
// setting              //        open website //
//     firest 10        //    firest 10       //
function startMenu(ctx) {
  ctx.telegram.sendMessage(ctx.chat.id, "Send The Number to Add", {
    reply_markup: {
      inline_keyboard: [
        // [{ text: myList, callback_data: "CMP" }],
        [
          { text: "Remove a number", callback_data: "RMN" },
          { text: "Open Website", url: "https://my.port.mv/vehicle_queue_new" },
        ],
        [
          { text: "First 10 in lorry slot", callback_data: "Lorry_10" },
          { text: "First 10 in Pickup slot", callback_data: "Pickup_10" },
        ],
      ],
    },
  });
  messageId = ctx.update.message.message_id + 1;
}

bot.on("message", (ctx) => {
  // console.log("message id "+ctx.update.message.message_id);
  const id = ctx.update.message.message_id;
  // ctx.deleteMessage(id);
  ctx.deleteMessage(messageId);
  // numberToCheck = ctx.message.text
  numberAnalysing(ctx);
  startMenu(ctx);
});

//checking the number befor adding
function numberAnalysing(ctx) {
  const theNumber = ctx.message.text;
  if (theNumber <= 0 || theNumber > 350) {
    ctx.telegram.sendMessage(ctx.chat.id, "Error: number Incorrect");
  } else if (isNaN(theNumber)) {
    ctx.telegram.sendMessage(ctx.chat.id, "Error: must be a number");
  } else {
    //create a ff to receive //chatId and the //number
    //get the users telegram id and send it to ff
    //check if the t id already has a data
    //add the number to thier lis
    console.log("ctx data from numberAnalysing function");
    console.log(ctx.chat.id);
    console.log(theNumber);

    // return numberCorrect = true
    const addNumberToList = httpsCallable(functions, "addNumberToList");
    addNumberToList({ vehicleCode: theNumber, chatID: ctx.chat.id })
      .then((result) => {
        // const data = result.data;
        // const data2 = data.text;
        // console.log(data);
        // console.log(data2);
        console.log("result from .then: " + result);
      })
      .catch((error) => {
        const code = error.code;
        const message = error.message;
        const details = error.details;
      });
    console.log("after ");
  }
}

//add the persion to firestore data when he send his number to add

bot.launch();
