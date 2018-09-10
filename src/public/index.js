const App = {
  startApp: function() {
    const app = this
    document.execCommand("defaultParagraphSeparator", false, "p")

    app.els = {
      editor: document.getElementById("editor"),
      title: document.getElementById("title"),
      name: document.getElementById("name"),
      story: document.getElementById("story"),
      topControlls: {
        popup: document.getElementById("top-controlls"),
        buttons: document.getElementById("buttons"),
        inputs: document.getElementById("inputs"),
        head3: document.getElementById("head-3"),
        head4: document.getElementById("head-4"),
        blockQuote: document.getElementById("blockquote"),
        link: document.getElementById("link"),
        linkInputForm: document.getElementById("input-link-form"),
        linkInput: document.getElementById("link-input"),
        linkFormClose: document.getElementById("close-link-input")
      },
      sideControlls: {
        popup: document.getElementById("side-controlls"),
        image: document.getElementById("image")
      },
      publishButton: document.getElementById("publish-button")
    }
    app.loadFromLocalstorage()
    app.bindControlls()
  },

  bindControlls: function() {
    const app = this

    app.els.title.addEventListener("input", () => {
      app.els.title.classList.remove("invalid")
      app.saveToLocalstorage()
    })

    app.els.editor.addEventListener("input", () => {
      app.els.editor.classList.remove("invalid")

      if (app.els.story.children.length === 0) {
        const newParagraph = document.createElement("p")
        newParagraph.classList.add("paragraph")
        newParagraph.appendChild(document.createTextNode("1. "))
        // app.els.story.appendChild(newParagraph)
      }
      app.saveToLocalstorage()
    })

    app.els.editor.addEventListener("input", e => {
      if (e.inputType !== "insertText") return

      app.setParagraphNode()
      if (!app.paragraph) return

      const ulRegex = new RegExp(/^[\-\*]{1}\s/)
      const paragraphText = app.paragraph.textContent.toString()
      if (ulRegex.test(paragraphText)) {
      }
    })

    app.els.publishButton.addEventListener("click", () => {
      app.publish()
    })

    app.els.topControlls.head3.addEventListener("click", e => {
      app.toggleSeltedNodeTag("H3")
    })

    app.els.topControlls.head4.addEventListener("click", e => {
      app.toggleSeltedNodeTag("H4")
    })

    app.els.topControlls.blockQuote.addEventListener("click", e => {
      app.toggleSeltedNodeTag("BLOCKQUOTE")
    })

    app.els.topControlls.link.addEventListener("click", e => {
      if (app.isSelectionContainsTag("A")) {
        document.execCommand("unlink")
      } else {
        app.toggleLinkForm()
      }
    })

    app.els.topControlls.linkFormClose.addEventListener("click", e => {
      app.toggleLinkForm()
    })

    document.addEventListener("selectionchange", app.updateControlls.bind(app))

    app.els.topControlls.linkInputForm.addEventListener("submit", e => {
      e.preventDefault()

      const link = app.els.topControlls.linkInput.value

      app.selection.removeAllRanges()
      app.selection.addRange(app.previousSelectionRange)

      document.execCommand("createLink", false, link)

      app.toggleLinkForm()
      app.els.topControlls.linkInput.value = null
      app.updateControllsButtons()
    })

    app.els.sideControlls.image.addEventListener("click", e => {
      e.preventDefault()
      const imageWidget = createImageWidget()

      app.els.story.insertBefore(imageWidget, app.paragraphNodeTemp)
      app.paragraphNodeTemp = null
      app.hideSideControlls()
    })

    Array.from(document.querySelectorAll("[contenteditable=true]")).forEach(
      editableEl => {
        editableEl.addEventListener("paste", e => {
          e.preventDefault()
          e.stopPropagation()

          let pasteText = (e.clipboardData || window.clipboardData).getData(
            "text"
          )
          pasteTextLikeClipboard(pasteText)
        })
      }
    )

    document.addEventListener("mousedown", e => {
      const app = this
      app.isMouseUp = false
    })

    document.addEventListener("mouseup", e => {
      const app = this
      app.isMouseUp = true
    })

    document.addEventListener("keyup", e => {
      switch (e.code) {
        case "Space":
          const nodeName = app.selectionRange.startContainer.nodeName

          if (nodeName === "#text") {
            const parentNodeName =
              app.selectionRange.startContainer.parentNode.nodeName
            if (parentNodeName !== "LI") {
              const input = app.selectionRange.startContainer.textContent.toString()

              switch (input) {
                case "1. ":
                  document.execCommand("insertOrderedList")
                  document
                    .getSelection()
                    .getRangeAt(0).startContainer.textContent = ""
                  break
                case "- ":
                  document.execCommand("insertUnorderedList")
                  document
                    .getSelection()
                    .getRangeAt(0).startContainer.textContent = ""
                  break
                case "* ":
                  document.execCommand("insertUnorderedList")
                  document
                    .getSelection()
                    .getRangeAt(0).startContainer.textContent = ""
                  break
              }
            }
          }
          break
        case "Enter":
          const selectedNode = app.selection.getRangeAt(0).startContainer
          if (
            selectedNode.tagName === "P" &&
            !selectedNode.classList.contains("paragraph") &&
            selectedNode.parentNode.tagName === "P"
          ) {
            selectedNode.classList.add("paragraph")
            insertAfter(selectedNode, selectedNode.parentNode)

            const newRange = document.createRange()
            newRange.setStart(selectedNode, 0)

            app.selection.removeAllRanges()
            app.selection.addRange(newRange)
          }
          break
      }
    })
  },
  toggleLinkForm: function() {
    const app = this

    const { buttons, inputs } = app.els.topControlls

    buttons.classList.toggle("hide")
    inputs.classList.toggle("hide")
  },
  updateControlls: function(e) {
    const app = this

    app.selection = document.getSelection()

    app.setParagraphNode()
    app.setSelectedNode()

    if (
      app.selectionRange &&
      app.selectionRange.startContainer !== app.els.topControlls.linkInputForm
    ) {
      app.previousSelectionRange = app.selectionRange
    }

    if (app.selection.rangeCount > 0) {
      app.selectionRange = app.selection.getRangeAt(0)
    }

    app.updateControllsVisibility()
    app.updateSideControllsVisibility()

    const shouldUpdatePosition =
      !app.els.topControlls.popup.classList.contains("hide") &&
      app.selectedNode !== app.els.topControlls.inputs &&
      app.selection.toString() !== ""

    const shouldUpdateButtons =
      !app.els.topControlls.popup.classList.contains("hide") &&
      app.selectedNode !== app.els.topControlls.popup

    const shouldUpdateSideControllsPosition =
      !app.els.sideControlls.popup.classList.contains("hide") &&
      app.selectedNode !== app.els.sideControlls.image

    if (shouldUpdateSideControllsPosition) app.updateSideControllsPosition()
    if (shouldUpdatePosition) app.updateControllsPosition()
    if (shouldUpdateButtons) app.updateControllsButtons()
  },
  publish: function() {
    const app = this
    const { title, story, name } = app.els
    const errors = app.validate()

    if (errors.title) title.classList.add("invalid")
    if (errors.story) story.classList.add("invalid")

    if (Object.keys(errors).length === 0) {
      const data = {
        title: title.textContent,
        name: name.textContent,
        story: story.innerHTML
      }
      app.postStory(data)
    } else {
      console.log("not valid")
    }
  },

  postStory: function(data) {
    const app = this

    const newXHR = new XMLHttpRequest()

    newXHR.addEventListener("load", function() {
      window.location.replace(this.response)
    })
    newXHR.open("POST", "/")
    newXHR.setRequestHeader("Content-Type", "application/json")
    newXHR.send(JSON.stringify(data))
  },
  setParagraphNode: function() {
    const app = this
    app.paragraphNode = null

    if (app.selection.rangeCount > 0) {
      const startContainer = app.selection.getRangeAt(0).startContainer
      if (
        startContainer.nodeName !== "#text" &&
        startContainer.matches("#story > *")
      )
        app.paragraphNode = startContainer
      else {
        app.paragraphNode = startContainer.parentElement.closest("#story > *")
      }
    }
  },
  setSelectedNode: function() {
    const app = this
    let selectedNode
    if (document.selection)
      selectedNode = document.selection.createRange().parentElement()
    else if (app.selection.rangeCount > 0)
      selectedNode = app.selection.getRangeAt(0).startContainer.parentNode
    app.selectedNode = selectedNode
  },
  updateSideControllsPosition: function() {
    const app = this
    const rect = app.paragraphNode.getBoundingClientRect()
    const controllsRect = app.els.sideControlls.popup.getBoundingClientRect()
    const topOffset = rect.top + window.pageYOffset - controllsRect.height / 4
    const leftOffset = rect.left - controllsRect.width - 10
    app.paragraphNodeTemp = app.paragraphNode
    app.els.sideControlls.popup.style.transform = `translate(${leftOffset}px, ${topOffset}px)`
  },
  updateControllsPosition: function() {
    const app = this

    const rect = app.selectionRange.getBoundingClientRect()
    const controllsWidth = app.els.topControlls.popup.getBoundingClientRect()
      .width
    const controllsHeight = app.els.topControlls.popup.getBoundingClientRect()
      .height
    let leftOffset = rect.left - controllsWidth / 2 + rect.width / 2
    const minimalLeftOffset = 8
    if (leftOffset < minimalLeftOffset) leftOffset = minimalLeftOffset
    const topOffset = rect.top + window.pageYOffset - controllsHeight - 5
    app.els.topControlls.popup.style.transform = `translate(${leftOffset}px, ${topOffset}px)`
  },

  updateControllsButtons: function() {
    const app = this

    const { buttons, head3, head4, blockQuote, link } = app.els.topControlls

    const { paragraphNode } = app

    if (!paragraphNode) return

    const paragraphNodeTagName = paragraphNode.tagName

    Array.from(buttons.children).forEach(controll => {
      controll.classList.remove("controll-active")
    })

    switch (paragraphNodeTagName) {
      case "H3":
        head3.classList.add("controll-active")
        break
      case "H4":
        head4.classList.add("controll-active")
        break
      case "BLOCKQUOTE":
        blockQuote.classList.add("controll-active")
        break
      default:
        break
    }

    if (app.isSelectionContainsTag("A")) link.classList.add("controll-active")
  },

  updateControllsVisibility: function() {
    const app = this

    if (app.selectedNode === app.els.topControlls.inputs) {
      return
    }
    if (app.selection.toString() === "") {
      return app.hideControlls()
    }
    if (!app.paragraphNode) {
      return app.hideControlls()
    }
    app.showControlls()
  },

  updateSideControllsVisibility: function() {
    const app = this

    if (app.selectedNode === app.els.sideControlls.image) {
      return
    }

    if (!app.paragraphNode || app.paragraphNode.textContent !== "") {
      return app.hideSideControlls()
    }
    app.showSideControlls()
  },

  showSideControlls: function() {
    const app = this
    app.els.sideControlls.popup.classList.remove("hide")
  },

  hideSideControlls: function() {
    const app = this
    app.els.sideControlls.popup.classList.add("hide")
  },
  showControlls: function() {
    const app = this

    if (app.hideControllsTimer) {
      clearTimeout(app.hideControllsTimer)
      delete app.hideControllsTimer
    }
    app.els.topControlls.popup.classList.remove("hide")
  },
  hideControlls: function() {
    const app = this
    app.hideControllsTimer = setTimeout(() => {
      app.els.topControlls.popup.classList.add("hide")
    }, 300)
  },
  toggleSeltedNodeTag: function(newTag) {
    const app = this

    if (!app.selectedNode) return
    let paragraphNode = app.paragraphNode
    const currentTagName = paragraphNode.tagName

    const newTagName = currentTagName === newTag ? "P" : newTag

    document.execCommand("formatBlock", false, `<${newTagName}>`)
  },
  validate: function() {
    const app = this
    const { title, story } = app.els
    const errors = {}
    if (title.textContent === "") errors.title = true
    if (story.textContent.trim() === "") errors.story = true

    return errors
  },
  isSelectionContainsTag: function(tagName) {
    const app = this

    const commonAncestor = app.selection.getRangeAt(0).commonAncestorContainer
    if (
      commonAncestor.nodeName === "#text" &&
      commonAncestor.parentNode.tagName === "A"
    )
      return true
    if (commonAncestor.nodeName === "#text") return false

    return Array.from(commonAncestor.children).some(el => {
      if (el && app.selection.containsNode(el, true) && el.tagName === tagName)
        return true
    })
  },
  filteredSelectedNodes: function(filterTagName) {
    const selection = document.getSelection()
    const parent = selection.getRangeAt(0).commonAncestorContainer
    if (parent.nodeName === "#text") return false

    return Array.from(parent.children).filter(el => {
      if (
        el &&
        selection.containsNode(el, true) &&
        el.tagName === filterTagName
      )
        return true
    })
  },
  loadFromLocalstorage: function() {
    const app = this
    const { editor } = app.els
    let draft = localStorage.getItem("draft")
    if (!draft) return

    // editor.innerHTML = draft
  },
  saveToLocalstorage: function() {
    const app = this
    const { editor } = app.els
    const draft = editor.innerHTML
    localStorage.setItem("draft", JSON.stringify(draft))
  }
}

const pasteTextLikeClipboard = function(text) {
  document.execCommand("insertHTML", false, text)
}

const createImageWidget = () => {
  const imageWidgetDiv = document.createElement("div")
  imageWidgetDiv.classList.add("image-widget")
  imageWidgetDiv.setAttribute("contenteditable", "false")

  const imageWidgetPreview = document.createElement("img")
  imageWidgetPreview.setAttribute("src", "/image-placeholder.svg")

  const imageWidgetInput = document.createElement("input")
  imageWidgetInput.setAttribute("type", "file")
  imageWidgetInput.setAttribute("accept", "image/*")
  imageWidgetInput.classList.add("hide")
  imageWidgetInput.addEventListener("change", event => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader()

      reader.onload = e => {
        imageWidgetPreview.setAttribute("src", e.target.result)
        imageWidgetPreview.classList.remove("hide")
      }

      reader.readAsDataURL(event.target.files[0])
    }
  })

  imageWidgetPreview.addEventListener("click", e => {
    imageWidgetInput.click()
  })

  const imageWidgetTitle = document.createElement("input")
  imageWidgetTitle.setAttribute("type", "text")
  imageWidgetTitle.setAttribute("placeholder", "add description or not")

  const imageWidgetDelete = document.createElement("div")
  imageWidgetDelete.classList.add("image-widget-delete")
  imageWidgetDelete.innerHTML = "delete"
  imageWidgetDelete.addEventListener("click", e => {
    if (confirm("Do you want to delete image?")) {
      imageWidgetDiv.remove()
    }
  })

  imageWidgetDiv.appendChild(imageWidgetPreview)
  imageWidgetDiv.appendChild(imageWidgetInput)
  imageWidgetDiv.appendChild(imageWidgetTitle)
  imageWidgetDiv.appendChild(imageWidgetDelete)
  return imageWidgetDiv
}

document.addEventListener("DOMContentLoaded", () => {
  App.startApp()
})

// https://learn.javascript.ru/task/insert-after
function insertAfter(elem, refElem) {
  const parent = refElem.parentNode
  const next = refElem.nextSibling
  if (next) {
    return parent.insertBefore(elem, next)
  } else {
    return parent.appendChild(elem)
  }
}
