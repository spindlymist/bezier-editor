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

    drawPoints(ctx, point, highlightedPoint, endPointFill, controlPointFill, backgroundFill) {
        const start = new Vector2(point);
        const end = point.plus(this.end);
        const controlPoint1 = point.plus(this.controlPoint1);
        const controlPoint2 = point.plus(this.controlPoint2);

        ctx.save();

        this.drawPoint(ctx, start, 7, endPointFill, backgroundFill, highlightedPoint == CurvePoints.Start);
        this.drawPoint(ctx, end, 7, endPointFill, backgroundFill, highlightedPoint == CurvePoints.End);
        this.drawPoint(ctx, controlPoint1, 4, controlPointFill, backgroundFill, highlightedPoint == CurvePoints.Control1);
        this.drawPoint(ctx, controlPoint2, 4, controlPointFill, backgroundFill, highlightedPoint == CurvePoints.Control2);

        ctx.restore();
    }

    drawPoint(ctx, point, radius, color, backgroundColor, filled) {
        ctx.beginPath();
        ctx.ellipse(point.x, point.y, radius, radius, 0, 0, 2*Math.PI);
        if(filled) {
            ctx.fillStyle = color;
        }
        else {
            ctx.fillStyle = backgroundColor;
        }
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.stroke();
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

export const CurvePoints = {
    None: "none",
    Start: "start",
    End: "end",
    Control1: "control1",
    Control2: "control2"
};
