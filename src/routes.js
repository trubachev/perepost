const path = require("path")

module.exports = (app, db) => {
  app.get("/", (req, res) => {
    const file = path.join(process.cwd(), "src", "public", "index.html")
    res.sendFile(file)
  })
}