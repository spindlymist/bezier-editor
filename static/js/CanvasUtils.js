import Vector2 from './Vector2.js';

export default class CanvasUtils {

    static GetCoordsFromEvent(canvas, event) {
        const scaleX = canvas.width / canvas.offsetWidth;
        const scaleY = canvas.height / canvas.offsetHeight;
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        return new Vector2(x, y);
    }

    static FillCircle(ctx, center, radius, fillStyle) {
        ctx.save();

        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius, radius, 0, 0, 2*Math.PI);
        ctx.fill();
        
        ctx.restore();
    }

}
