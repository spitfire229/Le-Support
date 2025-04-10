architecture du projet
📂 schemas/
├── 📄 index.html (Interface utilisateur)
├── 📄 style.css (Styles)
├── 📄 script.js (Gestion du canvas et des éléments)
├── 📄 db.js (Sauvegarde IndexedDB)
├── 📂 server/
│ ├── 📄 server.js (Serveur Express.js avec SQLite)
│ ├── 📄 database.sqlite (Base de données)
│ ├── 📄 schema.sql (Script de création de la base)
└── 📂 assets/ (Images, icônes…)

## Fonctionnalités
✅ Grille d’ancrage : Les formes s'alignent automatiquement
✅ Manipulation d’éléments : Ajouter, déplacer, supprimer, redimensionner
✅ Sauvegarde locale (IndexedDB) : Stocker les schémas dans le navigateur
✅ Sauvegarde SQL (SQLite + Express.js) : Stocker les schémas sur la machine
✅ Chargement des schémas : Reprendre un schéma enregistré
✅ Exportation SVG : Générer un fichier vectoriel

index.html 

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Éditeur de Schémas</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script defer src="script.js"></script>
</head>
<body>
    <div class="container">
        <div class="toolbar">
            <button id="addRect">Ajouter Rectangle</button>
            <button id="addCircle">Ajouter un cercle</button>
            <button id="addOctagon">Ajouter un octogone</button>
            <button id="addLine">Ajouter un trait</button>
            <button id="addText">Ajouter un texte</button>

            <button id="delete">Supprimer</button>
            <button id="exportSVG">Exporter en SVG</button>
        </div>
        <div class="editor-container">
            <canvas id="canvas"></canvas>
        </div>
        <div class="properties-panel">
            <h3>Propriétés de la forme</h3>
            <div id="propertiesContent">
                <p>Sélectionner une forme pour voir ses propriétés.</p>
            </div>
        </div>
    </div>
</body>
</html>

//script.js


document.addEventListener("DOMContentLoaded", () => {
    const canvas = new fabric.Canvas("canvas", {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#f0f0f0"
    });

    function drawPoints() {
        const gridSize = 20;
        const elements = [];
        
        for (let i = 0; i < canvas.width; i += gridSize) {
            for (let j = 0; j < canvas.height; j += gridSize) {
                elements.push(new fabric.Circle({
                    left: i,
                    top: j,
                    radius: 1,
                    fill: "#aaa",
                    selectable: false,
                    evented: false
                }));
            }
        }

        const gridGroup = new fabric.Group(elements, {
            selectable: false,
            evented: false
        });

        canvas.add(gridGroup);
        gridGroup.sendToBack();
    }

    drawPoints();

    document.getElementById("addRect").addEventListener("click", () => {
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: "#F29999",
            width: 100,
            height: 100,
            stroke: "#DD5F5F",
            strokeWidth: 2,
            rx: 15, // arrondi des coins
            ry: 0 // arrondi des coins
        });
        canvas.add(rect);
        updateProperties(rect);
    });
    // Ajouter un cercle
document.getElementById("addCircle").addEventListener("click", () => {
    const circle = new fabric.Circle({
        left: 150,
        top: 150,
        radius: 50,
        fill: "#99C2F2",
        stroke: "#5F8ADD",
        strokeWidth: 2
    });
    canvas.add(circle);
    updateProperties(circle);
});

// Ajouter un octogone
document.getElementById("addOctagon").addEventListener("click", () => {
    const size = 80; // Taille de l'octogone
    const sqrt2 = Math.sqrt(2) / 3; // Facteur pour ajuster les sommets

    const octagon = new fabric.Polygon([
        { x: -size, y: -size * sqrt2 },
        { x: -size * sqrt2, y: -size },
        { x: size * sqrt2, y: -size },
        { x: size, y: -size * sqrt2 },
        { x: size, y: size * sqrt2 },
        { x: size * sqrt2, y: size },
        { x: -size * sqrt2, y: size },
        { x: -size, y: size * sqrt2 }
    ], {
        left: 200,
        top: 200,
        fill: "#F2D799",
        stroke: "#DDAA5F",
        strokeWidth: 2
    });

    canvas.add(octagon);
    updateProperties(octagon);
});

let isDrawingLine = false;
let line, startX, startY;

document.getElementById("addLine").addEventListener("click", () => {
    isDrawingLine = true;
});

canvas.on("mouse:down", (e) => {
    if (!isDrawingLine) return;

    const pointer = canvas.getPointer(e.e);
    startX = pointer.x;
    startY = pointer.y;

    line = new fabric.Line([startX, startY, startX, startY], {
        stroke: "#000",
        strokeWidth: 2,
        selectable: true
    });

    canvas.add(line);
});

canvas.on("mouse:up", (e) => {
    if (!isDrawingLine || !line) return;

    const pointer = canvas.getPointer(e.e);
    line.set({ x2: pointer.x, y2: pointer.y });

    isDrawingLine = false;
    canvas.renderAll();
});
document.getElementById("addText").addEventListener("click", () => {
    const text = new fabric.Textbox("Texte ici", {
        left: 100,
        top: 100,
        width: 200,
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#000000",
        fontWeight: "normal",
        fontStyle: "normal",
        underline: false,
        backgroundColor: "#ffffff"
    });

    canvas.add(text);
    updateProperties(text);
});

function updateProperties(object) {
    const propertiesContent = document.getElementById("propertiesContent");
    if (object.type === "textbox") {
        propertiesContent.innerHTML = `
            <label for="textContent">Texte :</label>
            <input type="text" id="textContent" value="${object.text}" />
            <br />

            <label for="textColor">Couleur du texte :</label>
            <input type="color" id="textColor" value="${object.fill}" />
            <br />

            <label for="bgColor">Couleur du fond :</label>
            <input type="color" id="bgColor" value="${object.backgroundColor}" />
            <br />

            <label for="fontSize">Taille du texte :</label>
            <input type="number" id="fontSize" value="${object.fontSize}" />
            <br />

            <label for="fontFamily">Police :</label>
            <select id="fontFamily">
                <option value="Arial">Arial</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier">Courier</option>
                <option value="Times New Roman">Times New Roman</option>
            </select>
            <br />

            <button id="boldToggle">Gras</button>
            <button id="italicToggle">Italique</button>
            <button id="underlineToggle">Souligné</button>
        `;

        // Sélection des options par défaut
        document.getElementById("fontFamily").value = object.fontFamily;

        // Ajout des événements pour modifier les propriétés
        document.getElementById("textContent").addEventListener("input", (e) => {
            object.set("text", e.target.value);
            canvas.renderAll();
        });

        document.getElementById("textColor").addEventListener("input", (e) => {
            object.set("fill", e.target.value);
            canvas.renderAll();
        });

        document.getElementById("bgColor").addEventListener("input", (e) => {
            object.set("backgroundColor", e.target.value);
            canvas.renderAll();
        });

        document.getElementById("fontSize").addEventListener("input", (e) => {
            object.set("fontSize", parseInt(e.target.value, 10));
            canvas.renderAll();
        });

        document.getElementById("fontFamily").addEventListener("change", (e) => {
            object.set("fontFamily", e.target.value);
            canvas.renderAll();
        });

        document.getElementById("boldToggle").addEventListener("click", () => {
            object.set("fontWeight", object.fontWeight === "bold" ? "normal" : "bold");
            canvas.renderAll();
        });

        document.getElementById("italicToggle").addEventListener("click", () => {
            object.set("fontStyle", object.fontStyle === "italic" ? "normal" : "italic");
            canvas.renderAll();
        });

        document.getElementById("underlineToggle").addEventListener("click", () => {
            object.set("underline", !object.underline);
            canvas.renderAll();
        });
    }
}

// Met à jour le panneau quand on sélectionne un texte
canvas.on("object:selected", (e) => {
    const selectedObject = e.target;
    if (selectedObject.type === "textbox") {
        updateProperties(selectedObject);
    }
});



    document.getElementById("delete").addEventListener("click", () => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            document.getElementById("propertiesContent").innerHTML = "<p>Sélectionner une forme pour voir ses propriétés.</p>";
        }
    });

    document.getElementById("exportSVG").addEventListener("click", () => {
        const svg = canvas.toSVG();
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "schema.svg";
        link.click();
    });

    function updateProperties(object) {
        const propertiesContent = document.getElementById("propertiesContent");
    
        // Si l'objet est un texte (textbox)
        if (object.type === "textbox") {
            propertiesContent.innerHTML = `
                <label for="textContent">Texte :</label>
                <input type="text" id="textContent" value="${object.text}" />
                <br />
    
                <label for="textColor">Couleur du texte :</label>
                <input type="color" id="textColor" value="${object.fill}" />
                <br />
    
                <label for="bgColor">Couleur du fond :</label>
                <input type="color" id="bgColor" value="${object.backgroundColor}" />
                <br />
    
                <label for="fontSize">Taille du texte :</label>
                <input type="number" id="fontSize" value="${object.fontSize}" />
                <br />
    
                <label for="fontFamily">Police :</label>
                <select id="fontFamily">
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier">Courier</option>
                    <option value="Times New Roman">Times New Roman</option>
                </select>
                <br />
    
                <button id="boldToggle">Gras</button>
                <button id="italicToggle">Italique</button>
                <button id="underlineToggle">Souligné</button>
            `;
    
            document.getElementById("fontFamily").value = object.fontFamily;
    
            // Ajouter des événements pour modifier les propriétés du texte
            document.getElementById("textContent").addEventListener("input", (e) => {
                object.set("text", e.target.value);
                canvas.renderAll();
            });
    
            document.getElementById("textColor").addEventListener("input", (e) => {
                object.set("fill", e.target.value);
                canvas.renderAll();
            });
    
            document.getElementById("bgColor").addEventListener("input", (e) => {
                object.set("backgroundColor", e.target.value);
                canvas.renderAll();
            });
    
            document.getElementById("fontSize").addEventListener("input", (e) => {
                object.set("fontSize", parseInt(e.target.value, 10));
                canvas.renderAll();
            });
    
            document.getElementById("fontFamily").addEventListener("change", (e) => {
                object.set("fontFamily", e.target.value);
                canvas.renderAll();
            });
    
            document.getElementById("boldToggle").addEventListener("click", () => {
                object.set("fontWeight", object.fontWeight === "bold" ? "normal" : "bold");
                canvas.renderAll();
            });
    
            document.getElementById("italicToggle").addEventListener("click", () => {
                object.set("fontStyle", object.fontStyle === "italic" ? "normal" : "italic");
                canvas.renderAll();
            });
    
            document.getElementById("underlineToggle").addEventListener("click", () => {
                object.set("underline", !object.underline);
                canvas.renderAll();
            });
        } 
        // Si l'objet est un rectangle
        else if (object.type === "rect") {
            propertiesContent.innerHTML = `
                <label for="color">Couleur:</label>
                <input type="color" id="color" value="${object.fill}" />
                <br />
                <label for="stroke">Couleur de la bordure:</label>
                <input type="color" id="stroke" value="${object.stroke}" />
                <br />
                <label for="strokeWidth">Épaisseur de la bordure:</label>
                <input type="number" id="strokeWidth" value="${object.strokeWidth}" />
                <br />
                <label for="rx">Arrondi des angles:</label>
                <input type="number" id="rx" value="${object.rx}" />
                <br />
                <label for="width">Largeur:</label>
                <input type="number" id="width" value="${object.width}" />
                <br />
                <label for="height">Hauteur:</label>
                <input type="number" id="height" value="${object.height}" />
                <br />
                <label for="left">Position X:</label>
                <input type="number" id="left" value="${object.left}" />
                <br />
                <label for="top">Position Y:</label>
                <input type="number" id="top" value="${object.top}" />
            `;
            // Ajout des événements pour modifier les propriétés du rectangle
            document.getElementById("color").addEventListener("input", (e) => {
                object.set({ fill: e.target.value });
                canvas.renderAll();
            });
    
            document.getElementById("stroke").addEventListener("input", (e) => {
                object.set({ stroke: e.target.value });
                canvas.renderAll();
            });
    
            document.getElementById("strokeWidth").addEventListener("input", (e) => {
                object.set({ strokeWidth: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("rx").addEventListener("input", (e) => {
                object.set({ rx: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("width").addEventListener("input", (e) => {
                object.set({ width: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("height").addEventListener("input", (e) => {
                object.set({ height: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("left").addEventListener("input", (e) => {
                object.set({ left: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("top").addEventListener("input", (e) => {
                object.set({ top: parseInt(e.target.value) });
                canvas.renderAll();
            });
        }
        else if (object.type === "circle") {
            propertiesContent.innerHTML = `
                <label for="color">Couleur:</label>
                <input type="color" id="color" value="${object.fill}" />
                <br />
                <label for="stroke">Couleur de la bordure:</label>
                <input type="color" id="stroke" value="${object.stroke}" />
                <br />
                <label for="strokeWidth">Épaisseur de la bordure:</label>
                <input type="number" id="strokeWidth" value="${object.strokeWidth}" />
                <br />
                <label for="rx">Arrondi des angles:</label>
                <input type="number" id="rx" value="${object.rx}" />
                <br />
                <label for="width">Largeur:</label>
                <input type="number" id="width" value="${object.width}" />
                <br />
                <label for="height">Hauteur:</label>
                <input type="number" id="height" value="${object.height}" />
                <br />
                <label for="left">Position X:</label>
                <input type="number" id="left" value="${object.left}" />
                <br />
                <label for="top">Position Y:</label>
                <input type="number" id="top" value="${object.top}" />
            `;
            // Ajout des événements pour modifier les propriétés du rectangle
            document.getElementById("color").addEventListener("input", (e) => {
                object.set({ fill: e.target.value });
                canvas.renderAll();
            });
    
            document.getElementById("stroke").addEventListener("input", (e) => {
                object.set({ stroke: e.target.value });
                canvas.renderAll();
            });
    
            document.getElementById("strokeWidth").addEventListener("input", (e) => {
                object.set({ strokeWidth: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("rx").addEventListener("input", (e) => {
                object.set({ rx: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("width").addEventListener("input", (e) => {
                object.set({ width: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("height").addEventListener("input", (e) => {
                object.set({ height: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("left").addEventListener("input", (e) => {
                object.set({ left: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("top").addEventListener("input", (e) => {
                object.set({ top: parseInt(e.target.value) });
                canvas.renderAll();
            });
        }
        else if (object.type === "Octagon") {
            propertiesContent.innerHTML = `
                <label for="color">Couleur:</label>
                <input type="color" id="color" value="${object.fill}" />
                <br />
                <label for="stroke">Couleur de la bordure:</label>
                <input type="color" id="stroke" value="${object.stroke}" />
                <br />
                <label for="strokeWidth">Épaisseur de la bordure:</label>
                <input type="number" id="strokeWidth" value="${object.strokeWidth}" />
                <br />
                <label for="rx">Arrondi des angles:</label>
                <input type="number" id="rx" value="${object.rx}" />
                <br />
                <label for="width">Largeur:</label>
                <input type="number" id="width" value="${object.width}" />
                <br />
                <label for="height">Hauteur:</label>
                <input type="number" id="height" value="${object.height}" />
                <br />
                <label for="left">Position X:</label>
                <input type="number" id="left" value="${object.left}" />
                <br />
                <label for="top">Position Y:</label>
                <input type="number" id="top" value="${object.top}" />
            `;
            // Ajout des événements pour modifier les propriétés du rectangle
            document.getElementById("color").addEventListener("input", (e) => {
                object.set({ fill: e.target.value });
                canvas.renderAll();
            });
    
            document.getElementById("stroke").addEventListener("input", (e) => {
                object.set({ stroke: e.target.value });
                canvas.renderAll();
            });
    
            document.getElementById("strokeWidth").addEventListener("input", (e) => {
                object.set({ strokeWidth: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("rx").addEventListener("input", (e) => {
                object.set({ rx: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("width").addEventListener("input", (e) => {
                object.set({ width: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("height").addEventListener("input", (e) => {
                object.set({ height: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("left").addEventListener("input", (e) => {
                object.set({ left: parseInt(e.target.value) });
                canvas.renderAll();
            });
    
            document.getElementById("top").addEventListener("input", (e) => {
                object.set({ top: parseInt(e.target.value) });
                canvas.renderAll();
            });
        }
        // Ajoute d'autres types d'objets ici (par exemple, pour les cercles, lignes, etc.)
    }
    
    canvas.on("object:selected", (e) => {
        const selectedObject = e.target;
        updateProperties(selectedObject);
    });

    window.addEventListener("resize", () => {
        canvas.setWidth(window.innerWidth);
        canvas.setHeight(window.innerHeight);
        canvas.clear();
        drawPoints();
    });

    canvas.on("object:scaling", (e) => {
        const obj = e.target;
    
        if (obj.type === "rect") {
            // Calcul de la nouvelle largeur et hauteur réelles
            const newWidth = obj.width * obj.scaleX;
            const newHeight = obj.height * obj.scaleY;
    
            // Réinitialisation de l'échelle pour éviter une distorsion
            obj.set({
                width: newWidth,
                height: newHeight,
                scaleX: 1,
                scaleY: 1,
                rx: obj.rx, // Garde l'arrondi constant
                ry: obj.ry
            });
    
            canvas.renderAll();
        }
    });
    
    
});
