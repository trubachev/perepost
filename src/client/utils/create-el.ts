export interface ElProps {
  classList?: string[] | string
  text?: string
  attributes?: { [key: string]: any }
}

const assignAttributes = (
  el: HTMLElement,
  attributes: { [key: string]: any }
): void => {
  Object.keys(attributes).map(attributeName => {
    el.setAttribute(attributeName, attributes[attributeName])
  })
}

const assignClasses = (el: HTMLElement, classList: string | string[]): void => {
  if (Array.isArray(classList)) {
    classList.forEach(className => {
      el.classList.add(className)
    })
  } else {
    el.classList.add(classList)
  }
}

export const createInputEl = (props: ElProps): HTMLInputElement => {
  const { classList, text, ...attributes } = props
  const inputEl = document.createElement("input")

  assignAttributes(inputEl, attributes)
  if (classList) {
    assignClasses(inputEl, classList)
  }

  return inputEl
}

export const createEl = (tagName: string, props: ElProps): HTMLElement => {
  const { classList, text, ...attributes } = props
  const el = document.createElement(tagName)

  el.textContent = text

  assignAttributes(el, attributes)

  if (!classList) {
    assignClasses(el, classList)
  }

  return el
}
