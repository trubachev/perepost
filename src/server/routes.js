const path = require("path")
const fs = require("fs")
const getSlug = require("speakingurl")

const TITLE_KEY = /####TITLE####/g
const NAME_KEY = /####NAME####/g
const STORY_KEY = /####STORY####/g

module.exports = (app, db) => {
  app.get("/", (req, res) => {
    const file = path.join(process.cwd(), "src", "public", "index.html")
    res.sendFile(file)
  })

  app.post("/", (req, res) => {
    console.log(req.body)
    const templateFileName = path.join(
      process.cwd(),
      "src",
      "templates",
      "main.html"
    )

    fs.readFile(templateFileName, "utf8", (err, fileStr) => {
      if (err) return console.log(err)

      const newStory = fileStr
        .replace(TITLE_KEY, req.body.title)
        .replace(NAME_KEY, req.body.name)
        .replace(STORY_KEY, req.body.story)

      const today = new Date()

      const newStoryFileName = `${getSlug(
        req.body.title
      )}-${today.getDate()}-${today.getMonth()}.html`
      const newStoryPath = path.join(process.cwd(), "stories", newStoryFileName)
      const newStoryUrl = `/${newStoryFileName}`
      fs.writeFile(newStoryPath, newStory, err => {
        if (err) console.log(err)

        res.send(newStoryUrl)
      })
    })
  })
}
