const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path');
const { request } = require('http');
const jwt = require('jsonwebtoken')

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



app.post('/register/', async (request, response) => {
    const { username, password, name, gender } = request.body;
    
    try {
        const searchQuery = `SELECT * FROM user WHERE username = ?`;
        const searchResult = await db.get(searchQuery, [username]);

        if (searchResult) {
            response.status(400).send("User already exists");
        } else {
            if(password.length < 6){
                response.status(400).send("Password is too short")
            }
            else{
                const hashedPassword = await bcrypt.hash(password,10)
                const postQuery = `INSERT INTO user (username, password, name, gender) VALUES (?, ?, ?, ?)`;
                await db.run(postQuery, [username, hashedPassword, name, gender]);
                response.status(200).send("User added");
            }
        }
    } catch (e) {
        response.status(500).send(`Error: ${e.message}`);
    }
});


// API 2 __________

const authenticateToken = (request,response,next) =>{
    let jwtToken
    const authHeader = request.headers("Authentication")
    if(authHeader != undefined){
        jwtToken = authHeader.split()[1]
    }
    if(jwtToken == undefined){
        response.status(400).send("Invalid jwtToken")
    }
    else{
        jwt.verify(jwtToken,"Secret_Key",async(error,payload) =>{
            next()
        })
    }

}

app.post('/login/',async(request,response) => {
    const {username,password} = request.body

    const searchQuery = `SELECT * FROM user WHERE username = ?`;
    const dbUser = await db.get(searchQuery,[username])

    try{
        if(dbUser){
            const isPasswordMatched = await bcrypt.compare(password,dbUser.password)
    
            if(isPasswordMatched){
                // response.status(200).send("Login successfull")
                const payload = {username:username}
                const jwtToken = jwt.sign(payload,"Secret_Key")
                response.send(jwtToken)
            }
            else{
                response.status(500).send("please enter a valid password")
            }
        }
        else{
            response.status(400).send("Invalid user")
        }
    }catch(e){
        response.status(500).send(`Error : ${e}`)
    }
})

