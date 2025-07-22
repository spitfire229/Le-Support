export function exportSchemaAsPNG() {
    const canvasContainer = document.getElementById('canvas');
    const shapes = canvasContainer.querySelectorAll('.shape');
  
    if (shapes.length === 0) {
      alert("Aucune forme à exporter !");
      return;
    }
  
    // Calculer la bounding box minimale
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
    shapes.forEach(shape => {
      const rect = shape.getBoundingClientRect();
      const containerRect = canvasContainer.getBoundingClientRect();
  
      const left = rect.left - containerRect.left + window.scrollX;
      const top = rect.top - containerRect.top + window.scrollY;
      const right = left + rect.width;
      const bottom = top + rect.height;
  
      if (left < minX) minX = left;
      if (top < minY) minY = top;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    });
  
    const width = maxX - minX;
    const height = maxY - minY;
  
    // Créer un canvas temporaire
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
  
    const ctx = exportCanvas.getContext('2d');
    ctx.fillStyle = "#ffffff"; // fond blanc
    ctx.fillRect(0, 0, width, height);
  
    html2canvas(canvasContainer, {
      x: minX,
      y: minY,
      width,
      height,
      backgroundColor: null,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'schema.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  }
  