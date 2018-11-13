import { createEl, createInputEl } from "perepost/utils/create-el"
import { readerResultToString } from "perepost/utils/reader-results-to-string"

export const ImageWidget = (): HTMLElement => {
  const imageWidgetDiv: HTMLElement = createEl("div", {
    classList: "image-widget",
    attributes: {
      contenteditable: false
    }
  })

  const imageWidgetPreview: HTMLElement = createEl("img", {
    attributes: {
      src: "/image-placeholder.svg"
    }
  })

  const imageWidgetInput: HTMLInputElement = createInputEl({
    classList: "hide",
    attributes: {
      type: "file",
      accept: "image/*"
    }
  })

  imageWidgetInput.addEventListener("change", () => {
    if (imageWidgetInput.files && imageWidgetInput.files[0]) {
      const reader = new FileReader()

      reader.onload = () => {
        imageWidgetPreview.setAttribute(
          "src",
          readerResultToString(reader.result)
        )
        imageWidgetPreview.classList.remove("hide")
      }

      reader.readAsDataURL(imageWidgetInput.files[0])
    }
  })

  imageWidgetPreview.addEventListener("click", _ => {
    imageWidgetInput.click()
  })

  const imageWidgetTitle = createEl("div", {
    classList: "title",
    attributes: {
      contenteditable: "true",
      placeholder: "add description or not"
    }
  })

  const imageWidgetDelete = createEl("div", {
    classList: "image-widget-delete",
    text: "delete"
  })

  imageWidgetDelete.addEventListener("click", () => {
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
