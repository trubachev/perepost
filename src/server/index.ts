import path from "path"
import express from "express"
import bodyParser from "body-parser"

import routes from "./routes"

const app = express()

app.use(express.static(path.join(process.cwd(), "dist", "static")))
app.use(express.static(path.join(process.cwd(), "stories")))
app.use(bodyParser.json())

routes(app)

const port = 3005
app.listen(
  port,
  (): void => {
    console.log(`Server listening on http://localhost:${port}`)
  }
)
