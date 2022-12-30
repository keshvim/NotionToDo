require("dotenv").config();
const { Client } = require('@notionhq/client');


const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static("express"));

// default URL for website
app.use('/', function(req,res) {
    res.sendFile(path.join(__dirname+'/express/index.html'));
    //__dirname : It will resolve to your project folder.
  });

const server = http.createServer(app);
const port = 3000;
server.listen(port);

console.debug('Server listening on port ' + port);

// const database_id = "faa192599f8f4f4292de33f758ed6ecc";

// Initializing a client
const notion = new Client({
	auth: process.env.NOTION_API_KEY
});

const databaseId = process.env.NOTION_API_DATABASE;

const first_name = "Keshvi";
const user_name = "Keshvi Mahalingam";
const user_email = "keshvi.j.mahalingam@vanderbilt.edu"

let todo = [];
var itemsToDo = [];

// getTasksFromDatabase();
// printCurrentTasks(todo);


const dummyFunc = async () => {
    return("Hello World!")
}

app.get('/hello', async(req, res) => {
    const string = await dummyFunc();
    res.json(string)
})

async function getUserId(email) {
    let userId = ""
    const users = await notion.users.list();
    for (const user of users.results) {
        if (user.type == "person" && user.person.email == email) {
            userId = user.id
        }
    }
    return userId;
}
const user_id = getUserId(user_email);


//Get a paginated list of Tasks currently in a the database. 
async function getTasksFromDatabase(database_id, cursor) {

    let request_payload = "";

    if(cursor == undefined){
        request_payload = {
            path:'databases/' + database_id + '/query', 
            method:'POST',
        }
    } else {
        request_payload= {
            path:'databases/' + database_id + '/query', 
            method:'POST',
            body:{
                "start_cursor": cursor
            }
        }
    }

    //While there are more pages left in the query, get pages from the database. 
    // const current_pages = await notion.request(request_payload)
    await notion.request(request_payload)
    // .then(response => {
    //     for (const page of response.results) {
    //         await getTasksFromPage(page.id);
    //     }
    // })
    .then(async function getDBPages(response) {
        for (const page of response.results) {
            await getTasksFromPage(page.id);
        }
    })
    .catch((error) => {
        // console.error(error)
        if(error.code == "object_not_found") {
            // return;
        }
    });
    // console.log(current_pages)

    //https://www.notion.so/Card-1-534972fab07542e1b2da380755ec6919
    //https://www.notion.so/699228ab537a48db823c7662e14cd8b8?v=4f56f99244f2497c9703b983030d99ad
    //https://www.notion.so/699228ab537a48db823c7662e14cd8b8?v=4f56f99244f2497c9703b983030d99ad

    // await getPageOfTasks();
    // console.log(todo);
    return todo; 
}


// const current_pages = await notion.request(request_payload);
// https://www.notion.so/to-do-faa192599f8f4f4292de33f758ed6ecc
pageTasks();
async function pageTasks() {
    await getTasksFromDatabase(databaseId);
    await getTasksFromPage("faa192599f8f4f4292de33f758ed6ecc");
    // await getTasksFromDatabase("c653be1591f640e9982a79ca20790f73");
    // let todo_list = await getTwo("faa192599f8f4f4292de33f758ed6ecc");
    
    console.log(todo);
    await printCurrentTasks(todo);
    let items = await getToDoList(todo);

    for(const item of items) {
        console.log(item)
    }
    // for(const str of todoText) {
    //     console.log(str);
    // }

}


console.log("before getToDoList")

async function getToDoList(todo_list) {
    // let items = [];
    for (const item of todo_list) {
        let itemText = "";
        for (const txt of item.to_do.text) {
            itemText = itemText + txt.plain_text;
        }
        itemsToDo.push(itemText);
        // console.log(itemText);
    }

    return itemsToDo;
}
console.log("after getToDoList")

var User = 
{
    name: first_name,
    todo: itemsToDo
};
// export { User };
// module.exports = {User};


// cd NodeJS/NotionToDo

// const express = require('express')

// // Calling express as a function we create a basic web server
// const app = express()

// const fetch = require("node-fetch")
// // This is the port where we will run our web server
// const port = 3000

// // We make our webserver listen to an specific PORT
// app.listen(
//   port, 
//   () => console.log(`app listening at http://localhost:${port}`)
// );

// // This is how we define the routes for the API's in our web server
// // where the .get makes references to the http GET method
// // and the '/' is the route
// // the attached callback function will be called each time we get 
// // a GET request to the '/' route
// // In the callback the parameteres we get:
// // req includes all the request information, eg headers
// // res is an object we use to respond the http call!
// // app.get('/', (req, res) => res.send('Hello World!'))
// let bodyTxt = `<form action="#">`;
// let count = 1;

// todoText.forEach(function(txt) {
//   bodyTxt += `<p>
//                 <input type="checkbox" id= "test${count}" />
//                 <label for="test${count}">${txt}</label>
//             </p>`;
//   ++count;
// }); 
// // for (const item of todoText) {
// //     bodyTxt = bodyTxt + '<p><input type="checkbox" id="test' + count + '" /><label for="test' + count + '">' + item + '</label></p>'
// //     ++count;
// // }
// bodyTxt += `</form>`
// // document.getElementById("todoContainer").innerHTML = bodyTxt;

// app.get('/', (req, res) => res.send(`
//     <!DOCTYPE html>
//         <html>
//           <head>
//             <title>${user_name}'s To Do List</title>
//             <meta name="viewport" content="width=device-width, initial-scale=1">
//             <style>
//               body {
//                 font-family: system-ui, sans-serif;
//               }

//               img {
//                 max-width: 100%;
//                 max-height: 70vh;
//               }

//               /* add your own CSS to make it look how you want */
//             </style>
//           </head>
//           <body>
//             <main>
//             ${bodyTxt}
//             </main>
//           </body>
//         </html>
//     `))

//cd NodeJS/NotionToDo

// app.get("/", (req, res) => {
//   const notionDocId = "0d53e1afa57241e58700f2462c45d01e"

//   fetch("https://potion-api.now.sh/html?id=" + notionDocId)
//     .then(res => res.text())
//     .then(text => {
//       res.send(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <title>${user_name}'s To Do List</title>
//             <meta name="viewport" content="width=device-width, initial-scale=1">
//             <style>
//               body {
//                 font-family: system-ui, sans-serif;
//               }

//               img {
//                 max-width: 100%;
//                 max-height: 70vh;
//               }

//               /* add your own CSS to make it look how you want */
//             </style>
//           </head>
//           <body>
//             <main>${text}</main>
//           </body>
//         </html>
//       `)
//     })
// })


async function getTasksFromPage(page, cursor) {
    // const todo = [];

    let request_payload2 = "";
    if(cursor == undefined){
        request_payload2 = {
            path:'blocks/' + page + '/children?page_size=100', 
            method:'GET',
        }
    } else {
        request_payload2= {
            path:'blocks/' + page + '/children?page_size=100', 
            method:'GET',
            body:{
                "start_cursor": cursor
            }
        }
    }

    current_blocks = await notion.request(request_payload2);
    // console.log(current_blocks.results)
    for (const block of current_blocks.results) {
            // console.log( await notion.blocks.children.list({
            //     block_id: block.id
            // }));
            if (block.type == "to_do" && block.to_do.checked == false){
                // console.log(block.to_do.text.plain_text)
                for(const item of block.to_do.text){
                    // console.log(item.plain_text);
                    // console.log(item);
                    if(item.plain_text.includes("@" + user_name)) {

                    // if(item.type == "mention" && item.mention.type == "user" && item.mention.user.id == user_id) {
                        todo.push(block);
                        let child = await getTasksFromPage(block.id, current_blocks.next_cursor);
                        // console.log(item.mention);

                    } 
                }
             } 
             else if (block.type == "unsupported") {
                // console.log(block);
                await getTasksFromDatabase(block.id);
             } 
             else {
                await getTasksFromPage(block.id, current_blocks.next_cursor);
                // console.log("hey")
                // todo.push(child);
            }
    }

    return todo;
}


async function printCurrentTasks(todo_list) {
    let request_payload4 = "";
        
    request_payload4= {
        path:'pages/', 
        method:'POST',
        body:{
            "parent": {
                "type": "page_id",
                "page_id": "eabb558328be4baf9003eedf5dbc0e4e"
            },
            "properties": {
                "title": [ {
                    "text": {
                        "content": "Keshvi's To Do List"
                    }
                } ]
            },
            "children": todo_list
        }
    }
    await notion.request(request_payload4);
        
}
