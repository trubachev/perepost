// https://learn.javascript.ru/task/insert-after
export const insertAfter = (elem: Node, refElem: Node): void => {
  const parent = refElem.parentNode
  const next = refElem.nextSibling
  next ? parent.insertBefore(elem, next) : parent.appendChild(elem)
}
