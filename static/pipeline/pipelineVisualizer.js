document.addEventListener('DOMContentLoaded', (event) => {
    // Obtener los datos del pipeline desde el atributo data-*
    const pipelineDataElement = document.getElementById('pipelineData');
    if (!pipelineDataElement) return;
    
    try {
        const pipelineData = JSON.parse(pipelineDataElement.dataset.results);
        console.log('Datos del pipeline:', pipelineData);
        const steps = Object.entries(pipelineData);

        const canvas = document.getElementById('pipelineCanvas');
        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // --- Parámetros de Dibujo ---
            const boxWidth = 120;
            const boxHeight = 60;
            const gap = 40;
            const startX = 30;
            const startY = canvasHeight / 2 - boxHeight / 2;
            const arrowOffsetY = 15;
            const dataPacketRadius = 8;
            const animationSpeed = 1;
            const dataBoxHeight = 50;
            const dataBoxPadding = 10;
            const lineHeight = 14;

            let currentStepIndex = 0;
            let dataPacketX = startX + boxWidth / 2;
            let dataPacketY = startY - arrowOffsetY - 15;
            let targetX = dataPacketX;
            let animating = false;

            // --- Funciones de Dibujo ---
            function drawFilterBox(x, y, text) {
                ctx.fillStyle = '#e9ecef';
                ctx.strokeStyle = '#0056b3';
                ctx.lineWidth = 2;
                ctx.fillRect(x, y, boxWidth, boxHeight);
                ctx.strokeRect(x, y, boxWidth, boxHeight);

                ctx.fillStyle = '#333';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2 + 5);
            }

            function drawArrow(x1, y1, x2, y2) {
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x2 - 8, y2 - 4);
                ctx.moveTo(x2, y2);
                ctx.lineTo(x2 - 8, y2 + 4);
                ctx.stroke();
            }

            function drawDataText(boxX, boxY, text) {
                ctx.fillStyle = '#f8f9fa';
                ctx.strokeStyle = '#adb5bd';
                ctx.lineWidth = 1;
                ctx.fillRect(boxX, boxY, boxWidth, dataBoxHeight);
                ctx.strokeRect(boxX, boxY, boxWidth, dataBoxHeight);

                ctx.fillStyle = '#212529';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';

                const textPadding = 5;
                const maxWidth = boxWidth - (textPadding * 2);

                const words = text.split(' ');
                let line = '';
                let lines = [];

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        lines.push(line.trim());
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line.trim());

                ctx.textBaseline = 'top';
                const startTextY = boxY + textPadding;
                for (let i = 0; i < lines.length && i < 2; i++) {
                    const lineY = startTextY + (i * lineHeight);
                    let lineToDraw = lines[i];
                    if (ctx.measureText(lineToDraw).width > maxWidth) {
                        while (ctx.measureText(lineToDraw + '...').width > maxWidth && lineToDraw.length > 0) {
                            lineToDraw = lineToDraw.substring(0, lineToDraw.length - 1);
                        }
                        lineToDraw += '...';
                    }
                    ctx.fillText(lineToDraw, boxX + boxWidth / 2, lineY);
                }
            }

            function drawDataPacket(x, y) {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(x, y, dataPacketRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            function animate() {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                let currentX = startX;

                steps.forEach(([stepName, stepData], index) => {
                    let displayName = stepName.includes(':') ? stepName.split(':')[1].trim() : stepName;
                    if (displayName.length > 15) displayName = displayName.substring(0, 13) + '...';

                    drawFilterBox(currentX, startY, displayName);

                    const dataBoxX = currentX;
                    const dataBoxY = startY + boxHeight + dataBoxPadding;
                    drawDataText(dataBoxX, dataBoxY, stepData);

                    if (index < steps.length - 1) {
                        const arrowStartX = currentX + boxWidth;
                        const arrowEndX = currentX + boxWidth + gap;
                        drawArrow(arrowStartX, startY + boxHeight / 2, arrowEndX, startY + boxHeight / 2);
                    }

                    currentX += boxWidth + gap;
                });

                if (animating) {
                    if (dataPacketX < targetX) {
                        dataPacketX += animationSpeed;
                        if (dataPacketX > targetX) dataPacketX = targetX;
                    } else if (dataPacketX > targetX) {
                        dataPacketX -= animationSpeed;
                        if (dataPacketX < targetX) dataPacketX = targetX;
                    }

                    const currentFilterCenterX = startX + currentStepIndex * (boxWidth + gap) + boxWidth / 2;
                    if (Math.abs(dataPacketX - currentFilterCenterX) < animationSpeed) {
                        if (currentStepIndex < steps.length - 1) {
                            currentStepIndex++;
                            targetX = startX + currentStepIndex * (boxWidth + gap) + boxWidth / 2;
                            dataPacketX = startX + (currentStepIndex - 1) * (boxWidth + gap) + boxWidth + gap / 2;
                            dataPacketY = startY + boxHeight / 2;
                        } else {
                            animating = false;
                            dataPacketY = startY - arrowOffsetY - 15;
                        }
                    }
                }

                drawDataPacket(dataPacketX, dataPacketY);

                if (animating) {
                    requestAnimationFrame(animate);
                }
            }

            if (steps.length > 0) {
                targetX = startX + boxWidth / 2;
                dataPacketX = startX - gap / 2;
                dataPacketY = startY + boxHeight / 2;
                currentStepIndex = 0;
                animating = true;
                animate();
            }
        } else {
            console.error("Canvas no soportado por el navegador.");
            const canvasContainer = document.querySelector('.canvas-container');
            if (canvasContainer) {
                canvasContainer.innerHTML += '<p style="color: red;">Tu navegador no soporta Canvas, la visualización animada no está disponible.</p>';
            }
        }
    } catch (error) {
        console.error('Error al parsear los datos del pipeline:', error);
    }
});