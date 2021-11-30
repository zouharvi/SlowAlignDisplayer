var svgns = "http://www.w3.org/2000/svg"
var svg: SVGSVGElement = <any>document.getElementById('main_canvas')
var srcText: HTMLInputElement = <any>document.getElementById('src')
var tgtText: HTMLInputElement = <any>document.getElementById('tgt')
var alnText: HTMLInputElement = <any>document.getElementById('aln')
var fontSize: HTMLInputElement = <any>document.getElementById('fontsize')
var h_space: HTMLInputElement = <any>document.getElementById('h_space')
var v_space: HTMLInputElement = <any>document.getElementById('v_space')
var getsvg: HTMLAnchorElement = <HTMLAnchorElement>document.getElementById('getsvg')

function parseURLQuery(): { [key: string]: string } {
    // parses the URL query string
    let queryString = window.location.search.substring(1);

    const params: { [key: string]: string } = {};
    const queries = queryString.split("&");

    queries.forEach((indexQuery: string) => {
        const indexPair = indexQuery.split("=");
        const queryKey = decodeURIComponent(indexPair[0]);
        const queryValue = decodeURIComponent(indexPair.length > 1 ? indexPair[1] : "");
        params[queryKey] = queryValue;
    });

    return params;
}

function drawSVG() {
    let serializer = new XMLSerializer();
    let svgserialized = serializer.serializeToString(svg);
    svgserialized = '<?xml version="1.0" standalone="no"?>\r\n' + svgserialized
    getsvg.setAttribute("src", "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgserialized))
}
function downloadSVG() {
    let serializer = new XMLSerializer();
    let svgserialized = serializer.serializeToString(svg);
    svgserialized = '<?xml version="1.0" standalone="no"?>\r\n' + svgserialized
    let svgdata = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgserialized)

    let link = document.createElement('a')
    link.href = svgdata
    link.download = 'align.svg'
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function tokenize(t: string): Array<string> {
    return t.trim().split(' ')
}

function parseAlignment(): { [id: number]: Array<number> } {
    let raw: string[] = alnText.value.trim().split(' ')
    let sourceLength: number = tokenize(srcText.value).length
    let out: { [id: number]: Array<number> } = {}
    for (let i = 0; i < sourceLength; i++) {
        out[i] = new Array<number>()
    }
    for (let i = 0; i < raw.length; i++) {
        let token = raw[i].split('-')
        try {
            let a = parseInt(token[0])
            let b = parseInt(token[1])
            out[a].push(b)
        } catch (e) {
            // TODO, probably just ignore
        }
    }
    return out
}

// computes text width
function getWidth(t1: string) {
    let srcTokens = tokenize(t1)
    let h_spaceN = parseInt(h_space.value)
    let v_spaceN = parseInt(v_space.value)
    let prevEndX = 0
    for (let i = 0; i < srcTokens.length; i++) {
        let t1el: SVGTextElement = <SVGTextElement>document.createElementNS(svgns, 'text')
        t1el.setAttributeNS(null, 'x', prevEndX.toString())
        t1el.setAttributeNS(null, 'y', (v_spaceN - 20).toString())
        t1el.setAttributeNS(null, 'font-size', fontSize.value)
        t1el.setAttributeNS(null, 'font-family', 'sans-serif')
        t1el.textContent = srcTokens[i]
        svg.appendChild(t1el)
        prevEndX += t1el.getBBox().width + h_spaceN
    }
    // clear screen
    svg.innerHTML = ''
    return prevEndX - h_spaceN
}

function addTexts(t1: string, t2: string) {
    let srcTokens = tokenize(t1)
    let tgtTokens = tokenize(t2)
    let h_spaceN = parseInt(h_space.value)
    let v_spaceN = parseInt(v_space.value)
    let fontSizeN = parseInt(fontSize.value)
    let prevEndX = 0;
    let offsetXsrc = fontSizeN + Math.max(0, (getWidth(t2) - getWidth(t1)) / 2) // approximated using font size
    let offsetXtgt = fontSizeN + Math.max(0, (getWidth(t1) - getWidth(t2)) / 2) // approximated using font size

    // startX and endX
    let tgtBounds = new Array<[number, number]>()
    for (let i = 0; i < tgtTokens.length; i++) {
        let t1el: SVGTextElement = <SVGTextElement>document.createElementNS(svgns, 'text')
        t1el.setAttributeNS(null, 'x', (prevEndX + offsetXtgt).toString())
        t1el.setAttributeNS(null, 'y', (v_spaceN - fontSizeN).toString())
        t1el.setAttributeNS(null, 'font-size', (fontSizeN + 'px'))
        t1el.setAttributeNS(null, 'font-family', 'sans-serif')
        t1el.textContent = tgtTokens[i]
        svg.appendChild(t1el)


        let t2el: SVGLineElement = <SVGLineElement>document.createElementNS(svgns, 'line')
        t2el.setAttributeNS(null, 'x1', (prevEndX + offsetXtgt).toString())
        t2el.setAttributeNS(null, 'x2', (prevEndX + offsetXtgt + t1el.getBBox().width).toString())
        t2el.setAttributeNS(null, 'y1', (v_spaceN - fontSizeN * 2.0).toString())
        t2el.setAttributeNS(null, 'y2', (v_spaceN - fontSizeN * 2.0).toString())
        t2el.setAttributeNS(null, 'style', 'stroke:black; width:8')
        svg.appendChild(t2el)

        tgtBounds.push([prevEndX + offsetXtgt + t1el.getBBox().width / 2, v_spaceN - fontSizeN * 2.0])
        prevEndX += t1el.getBBox().width + h_spaceN
    }
    let tgtWidth = prevEndX

    prevEndX = 0
    let alignment = parseAlignment()
    for (let i = 0; i < srcTokens.length; i++) {
        let t1el: SVGTextElement = <SVGTextElement>document.createElementNS(svgns, 'text')
        t1el.setAttributeNS(null, 'x', (prevEndX + offsetXsrc).toString())
        t1el.setAttributeNS(null, 'y', (fontSizeN).toString())
        t1el.setAttributeNS(null, 'font-size', (fontSizeN + 'px'))
        t1el.setAttributeNS(null, 'font-family', 'sans-serif')
        t1el.textContent = srcTokens[i]
        svg.appendChild(t1el)

        let t2el: SVGLineElement = <SVGLineElement>document.createElementNS(svgns, 'line')
        t2el.setAttributeNS(null, 'x1', (prevEndX + offsetXsrc).toString())
        t2el.setAttributeNS(null, 'x2', (prevEndX + offsetXsrc + t1el.getBBox().width).toString())
        t2el.setAttributeNS(null, 'y1', (fontSizeN * 1.3).toString())
        t2el.setAttributeNS(null, 'y2', (fontSizeN * 1.3).toString())
        t2el.setAttributeNS(null, 'style', 'stroke:black; width:8')
        svg.appendChild(t2el)

        for (let j = 0; j < alignment[i].length; j++) {
            let targetI = alignment[i][j]
            if (targetI >= tgtBounds.length) {
                continue
            }
            let t3el: SVGLineElement = <SVGLineElement>document.createElementNS(svgns, 'line')
            t3el.setAttributeNS(null, 'x1', (prevEndX + offsetXsrc + t1el.getBBox().width / 2).toString())
            t3el.setAttributeNS(null, 'x2', tgtBounds[targetI][0].toString())
            t3el.setAttributeNS(null, 'y1', (fontSizeN * 1.3).toString())
            t3el.setAttributeNS(null, 'y2', tgtBounds[targetI][1].toString())
            t3el.setAttributeNS(null, 'style', 'stroke:black; width:8')
            svg.appendChild(t3el)
        }

        prevEndX += t1el.getBBox().width + h_spaceN
    }
    let newWidth = Math.max(tgtWidth, prevEndX) + fontSizeN
    return [newWidth, v_spaceN];
}

function doDraw() {
    svg.innerHTML = ''
    let [newWidth, newHeight] = addTexts(srcText.value, tgtText.value)
    // set the new dimensions of the svg box
    getsvg.style.height = newHeight + 'px'
    getsvg.style.width = newWidth + 'px'

    drawSVG()
}

function doDownload() {
    doDraw()
    downloadSVG()
}

document.getElementById('dodraw').addEventListener('click', doDraw)
document.getElementById('dodownload').addEventListener('click', doDownload)
document.getElementById('example1').addEventListener('click', () => {
    performExample(
        "Choose Export from the pop-up menu at the bottom of the dialog box .",
        'Wählen Sie im Popupmenü unten im Dialogfeld die Option " Exportieren . "',
        '0-0 0-1 1-10 2-3 3-2 4-3 5-2 7-7 8-4 10-7 11-6 12-6 12-12 13-11')
})
document.getElementById('example2').addEventListener('click', () => {
    performExample(
        "You can set keyframes for more than one layer property at a time .",
        "Můžete nastavit klíčové snímky pro více než jednu vlastnost vrstvy najednou .",
        "0-0 1-0 2-1 3-2 3-3 4-4 5-5 6-6 7-7 8-9 9-8 12-10 13-11"
    )
})
document.getElementById('example3').addEventListener('click', () => {
    performExample(
        "How would you rate the quality of the latest update of Microsoft Power Point ?",
        "как бы вы оценили качество последнего обновления Microsoft Power Point ?",
        "0-0 1-1 2-2 3-2 3-3 4-5 5-4 7-5 8-6 9-6 11-7 12-8 13-9 14-10"
    )
})
document.getElementById('example4').addEventListener('click', () => {
    performExample(
        "Patients should follow the specific venipuncture procedures provided by their doctor .",
        "Pacientiem jāievēro Īpaša ārsta norādījumi , ko izmanto Jūsu ārsts .",
        "0-0 1-1 2-1 4-4 5-5 6-5 7-4 7-6 8-6 8-7 10-8 10-9 11-10"
    )
})
document.getElementById('example5').addEventListener('click', () => {
    performExample(
        "Der Igel schlief glücklich ein .",
        "Ežiukas laimingai užmigo .",
        "0-0 1-0 2-2 3-1 4-2 5-3"
    )
})

document.getElementById('example1').click()
window.setTimeout(() => {
    let query = parseURLQuery()
    if ('text1' in query && 'text2' in query && 'algn' in query) {
        performExample(query['text1'], query['text2'], query['algn'])
        doDraw()
    } else {
        document.getElementById('example1').click()
    }
}, 250)


function performExample(src: string, tgt: string, aln: string) {
    srcText.value = src
    tgtText.value = tgt
    alnText.value = aln
    doDraw()
}

srcText.addEventListener("input", () => {
    doDraw();
});
tgtText.addEventListener("input", () => {
    doDraw();
});
alnText.addEventListener("input", () => {
    doDraw();
});