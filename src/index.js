const path = require("path")
const express = require("express")

const routes = require("./routes")

const app = express()

app.use(express.static(path.join(process.cwd(), "src", "public")))

routes(app)

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})