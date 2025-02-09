export const cssVariable = (name: string) => {
  const root = document.querySelector(':root')
  if (!root) {
    throw new Error('Unable to get root document')
  }
  return getComputedStyle(root).getPropertyValue(name)
}
