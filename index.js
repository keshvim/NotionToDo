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
    //__dirname : resolves to your project folder.
  });

const server = http.createServer(app);
const port = 3000;
server.listen(port);

console.debug('Server listening on port ' + port);

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


//Get a paginated list of Tasks currently in the database. 
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
    .then(async function getDBPages(response) {
        for (const page of response.results) {
            await getTasksFromPage(page.id);
        }
    })
    .catch((error) => {
        if(error.code == "object_not_found") {
            // return;
        }
    });

    // await getPageOfTasks();
    return todo; 
}


// const current_pages = await notion.request(request_payload);
pageTasks();
async function pageTasks() {
    await getTasksFromDatabase(databaseId);
    await getTasksFromPage("faa192599f8f4f4292de33f758ed6ecc");
    
    await printCurrentTasks(todo);
    let items = await getToDoList(todo);
}

async function getToDoList(todo_list) {
    // let items = [];
    for (const item of todo_list) {
        let itemText = "";
        for (const txt of item.to_do.text) {
            itemText = itemText + txt.plain_text;
        }
        itemsToDo.push(itemText);
    }

    return itemsToDo;
}

var User = {
    name: first_name,
    todo: itemsToDo
};
// export { User };
// module.exports = {User};

// Extract tasks from page with the given page id
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
    for (const block of current_blocks.results) {
        if (block.type == "to_do" && block.to_do.checked == false) {
            for (const item of block.to_do.text) {

                if (item.plain_text.includes("@" + user_name)) {
                // if(item.type == "mention" && item.mention.type == "user" && item.mention.user.id == user_id) {
                    todo.push(block);
                    let child = await getTasksFromPage(block.id, current_blocks.next_cursor);
                }

            }
         } 
         else if (block.type == "unsupported") {
            await getTasksFromDatabase(block.id);
         } 
         else {
            await getTasksFromPage(block.id, current_blocks.next_cursor);
            // todo.push(child);
        }
    }

    return todo;
}

// Export todo items to new page
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
