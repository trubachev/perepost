import path from "path"
import fs from "fs"
import getSlug from "speakingurl"

import core from "express"

const TITLE_KEY = /####TITLE####/g
const NAME_KEY = /####NAME####/g
const STORY_KEY = /####STORY####/g

const templateFileName = path.join(
  process.cwd(),
  "src",
  "templates",
  "main.html"
)

// const indexFile = path.join(process.cwd(), "static,", "index.html")

export default (app: core.Express): void => {
  app.post(
    "/",
    (req: core.Request, res: core.Response): void => {
      fs.readFile(
        templateFileName,
        "utf8",
        (err, fileStr: string): void => {
          if (err) return console.log(err)

          const newStory = fileStr
            .replace(TITLE_KEY, req.body.title)
            .replace(NAME_KEY, req.body.name)
            .replace(STORY_KEY, req.body.story)

          const today = new Date()

          const newStoryFileName = `${getSlug(
            req.body.title
          )}-${today.getDate()}-${today.getMonth()}.html`
          const newStoryPath = path.join(
            process.cwd(),
            "stories",
            newStoryFileName
          )
          const newStoryUrl = `/${newStoryFileName}`
          fs.writeFile(newStoryPath, newStory, err => {
            if (err) console.log(err)

            res.send(newStoryUrl)
          })
        }
      )
    }
  )
}
