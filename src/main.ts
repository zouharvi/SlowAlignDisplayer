var svgns = "http://www.w3.org/2000/svg"
var svg: SVGSVGElement = <any> document.getElementById('main_canvas')
var srcText: HTMLInputElement = <any> document.getElementById('src')
var tgtText: HTMLInputElement = <any> document.getElementById('tgt')
var alnText: HTMLInputElement = <any> document.getElementById('aln')

function saveSVG() {
    let svgdef : string = svg.parentElement.innerHTML 
    let svgdefb64 : string = btoa(svgdef)
    let getsvg : HTMLAnchorElement = <HTMLAnchorElement> document.getElementById('getsvg')
    getsvg.setAttribute("src", 'data:image/svg+xml;base64,\n'+svgdefb64)
}

function addTexts(t1: string, t2: string) {
    let t1el: SVGTextElement = <SVGTextElement> document.createElementNS(svgns, 'text')
    t1el.setAttributeNS(null, 'x', '0')
    t1el.setAttributeNS(null, 'y', (400-20).toString())
    t1el.setAttributeNS(null, 'font-size', '30')
    t1el.textContent = t1
    svg.appendChild(t1el)

    console.log(t1el.getBBox())
}

function doAlign() {
    svg.innerHTML = ''
    addTexts(srcText.value, tgtText.value)
    saveSVG()
}

document.getElementById('doalign').addEventListener('click', doAlign)