const nodes : number = 5
const lines : number = 8
const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const scDiv : number = 0.51
const color : string = "#01579B"

const divideScale : Function = (scale : number, i : number, n : number) : number =>Math.min(1/n, Math.max(0, scale - i/n)) * n
const scaleFactor : Function = (scale : number) : number => Math.floor(scale / scDiv)
const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
      const k = scaleFactor(scale)
      return (1 - k) / a + k / b
}
const updateScale : Function = (scale : number, dir : number, a : number, b : number) => mirrorValue(scale, a, b) * scGap * dir
