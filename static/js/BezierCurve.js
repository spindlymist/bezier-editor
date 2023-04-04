import Vector2 from './Vector2.js'

export default class BezierCurve {

    constructor(end, controlPoint1, controlPoint2) {
        this.end = new Vector2(end);
        this.controlPoint1 = new Vector2(controlPoint1);
        this.controlPoint2 = new Vector2(controlPoint2);
    }

    drawCurve(ctx, point) {
        const start = new Vector2(point);
        const end = point.plus(this.end);
        const controlPoint1 = point.plus(this.controlPoint1);
        const controlPoint2 = point.plus(this.controlPoint2);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, end.x, end.y);
        ctx.stroke();
    }

    drawPoints(ctx, point, endPointsFill, controlPointFill) {
        const start = new Vector2(point);
        const end = point.plus(this.end);
        const controlPoint1 = point.plus(this.controlPoint1);
        const controlPoint2 = point.plus(this.controlPoint2);

        ctx.save();
        ctx.fillStyle = endPointsFill;

        ctx.beginPath();
        ctx.ellipse(start.x, start.y, 7, 7, 0, 0, 2*Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(end.x, end.y, 7, 7, 0, 0, 2*Math.PI);
        ctx.fill();

        ctx.fillStyle = controlPointFill;

        ctx.beginPath();
        ctx.ellipse(controlPoint1.x, controlPoint1.y, 4, 4, 0, 0, 2*Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(controlPoint2.x, controlPoint2.y, 4, 4, 0, 0, 2*Math.PI);
        ctx.fill();

        ctx.restore();
    }

    getPointAlong(t) {
        const p1 = BezierCurve.getPointOnQuad(new Vector2(0, 0), this.controlPoint1, this.controlPoint2, t);
        const p2 = BezierCurve.getPointOnQuad(this.controlPoint1, this.controlPoint2, this.end, t);

        return BezierCurve.getPointOnLine(p1, p2, t);
    }

    toString() {
        return `{endX:${this.end.x},endY:${this.end.y},cp1X:${this.controlPoint1.x},cp1Y:${this.controlPoint1.y},cp2X:${this.controlPoint2.x},cp2Y:${this.controlPoint2.y}}`;
    }

    static getPointOnLine(start, end, t) {
        return start.times(1 - t).plus(end.times(t));
    }

    static getPointOnQuad(start, cp1, end, t) {
        const p1 = BezierCurve.getPointOnLine(start, cp1, t);
        const p2 = BezierCurve.getPointOnLine(cp1, end, t);

        return BezierCurve.getPointOnLine(p1, p2, t);
    }

}
