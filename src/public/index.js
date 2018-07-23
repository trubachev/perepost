const App = {
  selections: [],
  startApp: function() {
    const app = this

    app.els = {
      title: document.getElementById("title"),
      name: document.getElementById("name"),
      story: document.getElementById("story"),
      controlls: document.getElementById("controlls"),
      sideControlls: document.getElementById("side-controlls"),
      controllsButtons: document.getElementById("buttons"),
      controllsInputs: document.getElementById("inputs"),
      head3Controll: document.getElementById("head-3"),
      head4Controll: document.getElementById("head-4"),
      blockQuoteControll: document.getElementById("blockquote"),
      linkControll: document.getElementById("link"),
      inputLinkForm: document.getElementById("input-link-form"),
      linkInput: document.getElementById("link-input"),
      publishButton: document.getElementById("publish-button"),
      closeLinkForm: document.getElementById("close-link-input")
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

    app.els.story.addEventListener("input", () => {
      app.els.story.classList.remove("invalid")
      app.saveToLocalstorage()
    })

    app.els.story.addEventListener("input", e => {
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

    app.els.head3Controll.addEventListener("click", e => {
      app.toggleSeltedNodeTag("H3")
    })

    app.els.head4Controll.addEventListener("click", e => {
      app.toggleSeltedNodeTag("H4")
    })

    app.els.blockQuoteControll.addEventListener("click", e => {
      app.toggleSeltedNodeTag("BLOCKQUOTE")
    })

    app.els.linkControll.addEventListener("click", e => {

      // app.linkSelection = app.previousSelection

      if (app.isSelectionContainsTag("A")) {
        document.execCommand("unlink")

        // const linkNodes = app.filteredSelectedNodes("A")
        // linkNodes.map(node => {
        //   node.insertAdjacentHTML("beforebegin", node.innerHTML)
        //   node.remove()
        // })
      } else {
        app.toggleLinkForm()
      }
    })

    app.els.closeLinkForm.addEventListener("click", e => {
      app.toggleLinkForm()
    })

    document.addEventListener("selectionchange", app.updateControlls.bind(app))

    app.els.inputLinkForm.addEventListener("submit", e => {
      e.preventDefault()

      const link = app.els.linkInput.value

      app.selection.removeAllRanges()
      app.selection.addRange(app.previousSelectionRange)

      document.execCommand("createLink", false, link)

      app.toggleLinkForm()
      app.els.linkInput.value = null
      app.updateControllsButtons()
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
  },
  toggleLinkForm: function() {
    const app = this

    const { controllsButtons, controllsInputs } = app.els

    controllsButtons.classList.toggle("hide")
    controllsInputs.classList.toggle("hide")
  },
  updateControlls: function(e) {
    const app = this

    app.selection = document.getSelection()

    app.setParagraphNode()
    app.setSelectedNode()

    if (
      app.selectionRange &&
      app.selectionRange.startContainer !== app.els.inputLinkForm
    )
      app.previousSelectionRange = app.selectionRange
    if (app.selection.rangeCount > 0)
      app.selectionRange = app.selection.getRangeAt(0)
    app.updateControllsVisibility()
    app.updateSideControllsVisibility()

    const shouldUpdatePosition =
      !app.els.controlls.classList.contains("hide") &&
      app.selectedNode !== app.els.controllsInputs &&
      app.selection.toString() !== ""
    const shouldUpdateButtons =
      !app.els.controlls.classList.contains("hide") &&
      app.selectedNode !== app.els.controllsInputs
    const shouldUpdateSideControllsPosition = !app.els.sideControlls.classList.contains(
      "hide"
    )

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
    const controllsRect = app.els.sideControlls.getBoundingClientRect()
    const topOffset = rect.top + window.pageYOffset - controllsRect.height / 4
    const leftOffset = rect.left - controllsRect.width - 10
    app.els.sideControlls.style.transform = `translate(${leftOffset}px, ${topOffset}px)`
  },
  updateControllsPosition: function() {
    const app = this

    const rect = app.selectionRange.getBoundingClientRect()
    const controllsWidth = app.els.controlls.getBoundingClientRect().width
    const controllsHeight = app.els.controlls.getBoundingClientRect().height
    let leftOffset = rect.left - controllsWidth / 2 + rect.width / 2
    const minimalLeftOffset = 8
    if (leftOffset < minimalLeftOffset) leftOffset = minimalLeftOffset
    const topOffset = rect.top + window.pageYOffset - controllsHeight - 5
    app.els.controlls.style.transform = `translate(${leftOffset}px, ${topOffset}px)`
  },

  updateControllsButtons: function() {
    const app = this

    const {
      controllsButtons,
      head3Controll,
      head4Controll,
      blockQuoteControll,
      linkControll
    } = app.els

    const { paragraphNode } = app

    if (!paragraphNode) return

    const paragraphNodeTagName = paragraphNode.tagName

    Array.from(controllsButtons.children).forEach(controll => {
      controll.classList.remove("controll-active")
    })

    switch (paragraphNodeTagName) {
      case "H3":
        head3Controll.classList.add("controll-active")
        break
      case "H4":
        head4Controll.classList.add("controll-active")
        break
      case "BLOCKQUOTE":
        blockQuoteControll.classList.add("controll-active")
        break
      default:
        break
    }

    if (app.isSelectionContainsTag("A"))
      linkControll.classList.add("controll-active")
  },

  updateControllsVisibility: function() {
    const app = this

    if (app.selectedNode === app.els.controllsInputs) return
    if (app.selection.toString() === "") return app.hideControlls()
    if (!app.paragraphNode) return app.hideControlls()
    app.showControlls()
  },

  updateSideControllsVisibility: function() {
    const app = this

    if (app.paragraphNode && app.paragraphNode.textContent === "")
      app.showSideControlls()
    else app.hideSideControlls()
  },

  showSideControlls: function() {
    const app = this
    app.els.sideControlls.classList.remove("hide")
  },

  hideSideControlls: function() {
    const app = this
    app.els.sideControlls.classList.add("hide")
  },
  showControlls: function() {
    const app = this

    if (app.hideControllsTimer) {
      clearTimeout(app.hideControllsTimer)
      delete app.hideControllsTimer
    }
    app.els.controlls.classList.remove("hide")
  },
  hideControlls: function() {
    const app = this
    app.hideControllsTimer = setTimeout(() => {
      app.els.controlls.classList.add("hide")
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
    if (commonAncestor.nodeName === "#text" && commonAncestor.parentNode.tagName === "A") return true
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
    const { title, name, story } = app.els
    let draft = localStorage.getItem("draft")
    if (!draft) return

    draft = JSON.parse(draft)
    title.textContent = draft.title
    name.textContent = draft.name
    story.innerHTML = draft.story
  },
  saveToLocalstorage: function() {
    const app = this
    const { title, name, story } = app.els
    const draft = {
      title: title.textContent,
      name: name.textContent,
      story: story.innerHTML
    }
    localStorage.setItem("draft", JSON.stringify(draft))
  }
}


const pasteTextLikeClipboard = function(text) {
  document.execCommand("insertHTML", false, text)
}

document.addEventListener("DOMContentLoaded", () => {
  App.startApp()
})
