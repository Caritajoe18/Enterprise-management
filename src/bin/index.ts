import dotenv from "dotenv"
dotenv.config()
import {createServer} from "node:http"
import app from "../app"
import { DATABASE } from "../db"




const port = process.env.PORT ?? 3000
DATABASE()

const server = createServer(app)


server.listen(port,  () =>{
    console.log(`Server is running on port ${port}`)
})
