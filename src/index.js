const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")

const routes = require("./routes")

const app = express()

app.use(express.static(path.join(process.cwd(), "src", "public")))
app.use(express.static(path.join(process.cwd(), "stories")))
app.use(bodyParser.json())

routes(app)

const port = 3005
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
