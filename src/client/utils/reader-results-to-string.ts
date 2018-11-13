const arrayBufferToString = (buf: ArrayBuffer): string => {
  return String.fromCharCode.apply(null, new Uint16Array(buf))
}

export const readerResultToString = (res: ArrayBuffer | string): string => {
  return typeof res === "string" ? res : arrayBufferToString(res)
}
