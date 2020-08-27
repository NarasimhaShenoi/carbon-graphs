"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import Line from "../../../../main/js/controls/Line";
import { COLORS, SHAPES } from "../../../../main/js/helpers/constants";
import styles from "../../../../main/js/helpers/styles";
import { getSVGAnimatedTransformList } from "../../../../main/js/helpers/transformUtils";
import utils from "../../../../main/js/helpers/utils";
import {
    delay,
    loadCustomJasmineMatcher,
    PADDING_BOTTOM,
    toNumber
} from "../../helpers/commonHelpers";
import {
    axisTimeSeries,
    getAxes,
    getInput,
    valuesTimeSeries,
    fetchAllElementsByClass,
    fetchElementByClass
} from "./helpers";

describe("Line - Panning", () => {
    let graphDefault = null;
    let lineGraphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        lineGraphContainer = document.createElement("div");
        lineGraphContainer.id = "testLine_carbon";
        lineGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(lineGraphContainer);
    });
    afterEach(() => {
        document.body.innerHTML = "";
    });
    describe("When pan is enabled", () => {
        beforeEach(() => {
            const axisData = utils.deepClone(getAxes(axisTimeSeries));
            axisData.dateline = [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release A"
                    },
                    color: COLORS.GREEN,
                    shape: SHAPES.SQUARE,
                    value: "2016-06-03T12:00:00Z"
                }
            ];
            axisData.pan = { enabled: true };
            axisData.showLabel = true;
            const input = getInput(valuesTimeSeries, false, false);
            graphDefault = new Graph(axisData);
            graphDefault.loadContent(new Line(input));
        });
        it("Check if clamp is false if pan is enabled", () => {
            expect(graphDefault.scale.x.clamp()).toEqual(false);
        });
        it("DatelineGroup translates properly when panning is enabled", (done) => {
            const datelineGroup = document.querySelector(
                `.${styles.datelineGroup}`
            );
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeGreaterThanOrEqual(67);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
        it("Dynamic Data is updated correctly when key matches and label is retained when it is not passed", () => {
            const panData = {
                key: "uid_1",
                values: [
                    {
                        x: "2016-03-03T12:00:00Z",
                        y: 2
                    },
                    {
                        x: "2016-04-03T12:00:00Z",
                        y: 20
                    }
                ]
            };
            let lineContent = fetchAllElementsByClass(
                lineGraphContainer,
                styles.pointGroup
            );
            expect(lineContent.length).toEqual(3);
            graphDefault.reflow(panData);
            lineContent = fetchAllElementsByClass(
                lineGraphContainer,
                styles.pointGroup
            );
            expect(lineContent.length).toEqual(2);
            const axisLabelX = fetchElementByClass(lineGraphContainer, styles.axisLabelX);
            const axisLabelY = fetchElementByClass(lineGraphContainer, styles.axisLabelY);
            const axisLabelY2 = fetchElementByClass(lineGraphContainer, styles.axisLabelY2);
            expect(axisLabelX.querySelector("text").textContent).toBe("X Label");
            expect(axisLabelY.querySelector("text").textContent).toBe("Y Label");
            expect(axisLabelY2.querySelector("text").textContent).toBe("Y2 Label");
        });
        it("Dynamic Data is not updated when key does not match", () => {
            const panData = {
                key: "uid_2",
                values: [
                    {
                        x: "2016-03-03T12:00:00Z",
                        y: 2
                    },
                    {
                        x: "2016-04-03T12:00:00Z",
                        y: 20
                    }
                ]
            };
            let lineContent = fetchAllElementsByClass(
                lineGraphContainer,
                styles.pointGroup
            );
            expect(lineContent.length).toEqual(3);
            graphDefault.reflow(panData);
            lineContent = fetchAllElementsByClass(
                lineGraphContainer,
                styles.pointGroup
            );
            expect(lineContent.length).toEqual(3);
        });
        it("should update the label during reflow", () => {
            const panData = {
                key: "uid_1",
                values: [
                    {
                        x: "2016-03-03T12:00:00Z",
                        y: 2
                    },
                    {
                        x: "2016-04-03T12:00:00Z",
                        y: 20
                    }
                ],
                xlabel: "updated xlabel",
                ylabel: "updated ylabel",
                y2label: "updated y2label"
            };
            graphDefault.reflow(panData);
            const axisLabelX = fetchElementByClass(lineGraphContainer, styles.axisLabelX);
            const axisLabelY = fetchElementByClass(lineGraphContainer, styles.axisLabelY);
            const axisLabelY2 = fetchElementByClass(lineGraphContainer, styles.axisLabelY2);
            expect(axisLabelX.querySelector("text").textContent).toBe("updated xlabel");
            expect(axisLabelY.querySelector("text").textContent).toBe("updated ylabel");
            expect(axisLabelY2.querySelector("text").textContent).toBe("updated y2label");
        });
    });
    describe("When pan is disabled", () => {
        beforeEach(() => {
            const axisData = utils.deepClone(getAxes(axisTimeSeries));
            axisData.dateline = [
                {
                    showDatelineIndicator: true,
                    label: {
                        display: "Release A"
                    },
                    color: COLORS.GREEN,
                    shape: SHAPES.SQUARE,
                    value: "2016-06-03T12:00:00Z"
                }
            ];
            axisData.pan = { enabled: false };
            const input = getInput(valuesTimeSeries, false, false);
            graphDefault = new Graph(axisData);
            graphDefault.loadContent(new Line(input));
        });
        it("Check if clamp is true if pan is disabled", () => {
            expect(graphDefault.scale.x.clamp()).toEqual(true);
        });
        it("DatelineGroup translates properly after some delay when panning is disabled", (done) => {
            const datelineGroup = document.querySelector(
                `.${styles.datelineGroup}`
            );
            delay(() => {
                const translate = getSVGAnimatedTransformList(
                    datelineGroup.getAttribute("transform")
                ).translate;
                expect(toNumber(translate[0], 10)).toBeCloserTo(67);
                expect(toNumber(translate[1], 10)).toBeCloserTo(PADDING_BOTTOM);
                done();
            });
        });
    });
});
