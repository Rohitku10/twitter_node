const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path');
const { request } = require('http');

const app = express();
app.use(express.json())

const dbPath = path.join(__dirname,"twitterClone.db")

let db=null;
const initializeDbAndServer = async() =>{
    try{
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database
        })
        
        app.listen(3000,()=>{
            console.log(`Server is running at port 3000`)
        })
    }catch(e){
        console.log(`Error: ${e}`)
        process.exit(1)
    }
}
initializeDbAndServer();



// app.post('/register/',async (request,response)=>{
//     const {username,password,name,gender} = request.body
//     const searchQuery = `SELECT * FROM user WHERE username = ?`;
//     const searchResult = await db.get(searchQuery,[username]);

//     if(searchResult == undefined){
//         try{
//             const postQuery = `INSERT INTO user (username,password,name,gender) VALUES (?,?,?,?)`
//             const postResult = await db.run(postQuery,[username,password,name,gender])
//             response.send(postResult)
//             console.log("User added")
//         }catch(e){
//             response.status(400).send(`Error:${e}`)
//         }
//     }
//     else{
//         response.status(400).send("USER ALREADY EXISTS")
//     }

// })

app.post('/register/', async (request, response) => {
    const { username, password, name, gender } = request.body;
    
    try {
        const searchQuery = `SELECT * FROM user WHERE username = ?`;
        const searchResult = await db.get(searchQuery, [username]);

        if (searchResult) {
            response.status(400).send("User already exists");
        } else {
            const postQuery = `INSERT INTO user (username, password, name, gender) VALUES (?, ?, ?, ?)`;
            await db.run(postQuery, [username, password, name, gender]);
            response.send("User added");
        }
    } catch (e) {
        response.status(500).send(`Error: ${e.message}`);
    }
});
