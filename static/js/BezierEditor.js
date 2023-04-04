import BezierCurve from './BezierCurve.js';
import Vector2 from './Vector2.js';
import CanvasUtils from './CanvasUtils.js';
import ObjectList from './ObjectList.js';

const EditorStates = {
    Idle: "idle",
    CreatingNewCurve: "creating new curve",
    MovingPoint: "moving point"
};
const CurvePoints = {
    None: "none",
    Start: "start",
    End: "end",
    Control1: "control1",
    Control2: "control2"
};

export default class BezierEditor {

    constructor(canvas, list) {
        this.state = EditorStates.Idle;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.curves = [];
        this.selectedCurve = null;

        this.objectList = new ObjectList(list);
        this.objectList.serializeItemCallback = curve => {
            return curve.curve.toString();
        };

        this.registerEventListeners();
    }

    registerEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));

        this.objectList.addSelectedItemDeletedListener(() => {
            const index = this.curves.indexOf(this.selectedCurve);
            this.curves.splice(index, 1);
            this.selectedCurve = null;
            this.drawUI();
        });

        this.objectList.addSelectedItemChangedListener(item => {
            if(this.selectedCurve !== null) {
                this.selectedCurve.isSelected = false;
            }
            item.isSelected = true;
            this.selectedCurve = item;
            this.drawUI();
        });

        this.objectList.controls.querySelector('.follow').addEventListener('click', () => {
            if(this.selectedCurve !== null) {
                window.cancelAnimationFrame(this.followHandle);
                this.lastFrame = new Date();
                this.followHandle = window.requestAnimationFrame(() => this.drawFollow(-1))
            }
        });
    }

    drawFollow(t) {
        const now = new Date();
        const dt = (now - this.lastFrame) / 1000;
        this.lastFrame = now;

        if(t === -1) {
            t = 0;
        }
        else {
            t += dt / 2.5;

            if(t > 1) t = 1;
        }

        const point = this.selectedCurve.curve.getPointAlong(t).plus(this.selectedCurve.point);

        this.drawUI();

        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.ellipse(point.x, point.y, 12, 12, 0, 0, 2*Math.PI);
        this.ctx.fill();

        if(t < 1) {
            this.followHandle = window.requestAnimationFrame(() => this.drawFollow(t))
        }
    }

    onMouseDown(e) {
        const point = CanvasUtils.GetCoordsFromEvent(this.canvas, e);

        switch(this.state) {
            case EditorStates.Idle:
                const touching = this.touchingPoint(point);
                if(e.ctrlKey) {
                    this.startPoint = point;
                    this.endPoint = this.startPoint;
                    this.state = EditorStates.CreatingNewCurve;
                    this.drawUI();
                }
                else if(e.altKey && this.selectedCurve !== null) {
                    this.state = EditorStates.MovingPoint;
                    this.movingPoint = CurvePoints.None;
                    this.origPoint = new Vector2(this.selectedCurve.point);
                    this.startPoint = new Vector2(point);
                }
                else if(touching !== CurvePoints.None) {
                    this.state = EditorStates.MovingPoint;
                    this.movingPoint = touching;
                }
                break;
        }
    }

    onMouseMove(e) {
        const point = CanvasUtils.GetCoordsFromEvent(this.canvas, e);

        switch(this.state) {
            case EditorStates.CreatingNewCurve:
                this.endPoint = point;
                this.drawUI();
                break;
            case EditorStates.MovingPoint:
                const relPoint = point.minus(this.selectedCurve.point);

                switch(this.movingPoint) {
                    case CurvePoints.Start:
                        this.selectedCurve.point = point;
                        this.selectedCurve.curve.end.sub(relPoint);
                        this.selectedCurve.curve.controlPoint1.sub(relPoint);
                        this.selectedCurve.curve.controlPoint2.sub(relPoint);
                        break;
                    case CurvePoints.End:
                        this.selectedCurve.curve.end = relPoint;
                        break;
                    case CurvePoints.Control1:
                        this.selectedCurve.curve.controlPoint1 = relPoint;
                        break;
                    case CurvePoints.Control2:
                        this.selectedCurve.curve.controlPoint2 = relPoint;
                        break;
                    case CurvePoints.None:
                        this.selectedCurve.point = this.origPoint.plus(point.minus(this.startPoint));
                        break;
                }
                this.drawUI();
                break;
        }
    }

    onMouseUp(e) {
        const point = CanvasUtils.GetCoordsFromEvent(this.canvas, e);

        switch(this.state) {
            case EditorStates.CreatingNewCurve:
                const offset = this.endPoint.minus(this.startPoint);
                const newCurve = {
                    point: new Vector2(this.startPoint),
                    curve: new BezierCurve(offset, offset.times(.33), offset.times(.67)),
                    isSelected: false
                };
                this.curves.push(newCurve);
                this.objectList.add("Curve " + this.curves.length, newCurve, true);

                this.state = EditorStates.Idle;
                this.drawUI();
                break;

            case EditorStates.MovingPoint:
                this.state = EditorStates.Idle;
                break;
        }
    }

    drawUI() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'lightgray';
        this.curves.forEach(curve => {
            if(curve.isSelected) return;
            curve.curve.drawCurve(this.ctx, curve.point);
        });

        if(this.selectedCurve !== null) {
            this.ctx.save();
            this.ctx.strokeStyle = 'blue';
            this.selectedCurve.curve.drawCurve(this.ctx, this.selectedCurve.point);
            this.selectedCurve.curve.drawPoints(this.ctx, this.selectedCurve.point, 'blue', '#f01010');
            this.ctx.restore();
        }

        switch(this.state) {
            case EditorStates.CreatingNewCurve:
                this.ctx.strokeStyle = 'black';
                this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
                this.ctx.beginPath();
                this.ctx.ellipse(this.startPoint.x, this.startPoint.y, 7, 7, 0, 0, 2*Math.PI);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
                this.ctx.lineTo(this.endPoint.x, this.endPoint.y);
                this.ctx.stroke();
                break;
        }
    }

    touchingPoint(point) {
        if(this.selectedCurve === null) return CurvePoints.None;

        const relPoint = point.minus(this.selectedCurve.point);

        if(Vector2.distance(relPoint, this.selectedCurve.curve.controlPoint1) <= 3) {
            return CurvePoints.Control1;
        }
        else if(Vector2.distance(relPoint, this.selectedCurve.curve.controlPoint2) <= 3) {
            return CurvePoints.Control2;
        }
        else if(Vector2.distance(point, this.selectedCurve.point) <= 5) {
            return CurvePoints.Start;
        }
        else if(Vector2.distance(relPoint, this.selectedCurve.curve.end) <= 5) {
            return CurvePoints.End;
        }
        else {
            return CurvePoints.None;
        }
    }

}
