"use strict";
import Graph from "../../../../main/js/controls/Graph/Graph";
import PairedResult from "../../../../main/js/controls/PairedResult";
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

describe("PairedResult", () => {
    let graphDefault = null;
    let pairedResultGraphContainer;
    beforeAll(() => {
        loadCustomJasmineMatcher();
    });
    beforeEach(() => {
        pairedResultGraphContainer = document.createElement("div");
        pairedResultGraphContainer.id = "testPairedResult_carbon";
        pairedResultGraphContainer.setAttribute(
            "style",
            "width: 1024px; height: 400px;"
        );
        document.body.appendChild(pairedResultGraphContainer);
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
            const input = getInput(valuesTimeSeries, false, false);
            graphDefault = new Graph(axisData);
            graphDefault.loadContent(new PairedResult(input));
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
                expect(toNumber(translate[0], 10)).toBeCloserTo(80);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
        it("Dynamic Data is updated correctly when key matches and label is retained when it is not passed", () => {
            const panData = {
                key: "uid_1",
                values: [
                    {
                        high: {
                            x: "2016-09-17T12:00:00Z",
                            y: 110
                        },
                        mid: {
                            x: "2016-09-18T12:00:00Z",
                            y: 70
                        },
                        low: {
                            x: "2016-09-19T02:00:00Z",
                            y: 30
                        }
                    }
                ]
            };
            let pairedContent = fetchAllElementsByClass(
                pairedResultGraphContainer,
                styles.pairedBox
            );
            expect(pairedContent.length).toEqual(2);
            graphDefault.reflow(panData);
            pairedContent = fetchAllElementsByClass(
                pairedResultGraphContainer,
                styles.pairedBox
            );
            expect(pairedContent.length).toEqual(1);
            const axisLabelX = fetchElementByClass(pairedResultGraphContainer, styles.axisLabelX);
            const axisLabelY = fetchElementByClass(pairedResultGraphContainer, styles.axisLabelY);
            const axisLabelY2 = fetchElementByClass(pairedResultGraphContainer, styles.axisLabelY2);
            expect(axisLabelX.querySelector("text").textContent).toBe("X Label");
            expect(axisLabelY.querySelector("text").textContent).toBe("Y Label");
            expect(axisLabelY2.querySelector("text").textContent).toBe("Y2 Label");
        });
        it("Dynamic Data is not updated when key does not match", () => {
            const panData = {
                key: "uid_2",
                values: [
                    {
                        high: {
                            x: "2016-09-17T12:00:00Z",
                            y: 110
                        },
                        mid: {
                            x: "2016-09-18T12:00:00Z",
                            y: 70
                        },
                        low: {
                            x: "2016-09-19T02:00:00Z",
                            y: 30
                        }
                    }
                ]
            };
            let pairedContent = fetchAllElementsByClass(
                pairedResultGraphContainer,
                styles.pairedBox
            );
            expect(pairedContent.length).toEqual(2);
            graphDefault.reflow(panData);
            pairedContent = fetchAllElementsByClass(
                pairedResultGraphContainer,
                styles.pairedBox
            );
            expect(pairedContent.length).toEqual(2);
        });
        it("should update the label during reflow", () => {
            const panData = {
                key: "uid_1",
                values: [
                    {
                        high: {
                            x: "2016-09-17T12:00:00Z",
                            y: 110
                        },
                        mid: {
                            x: "2016-09-18T12:00:00Z",
                            y: 70
                        },
                        low: {
                            x: "2016-09-19T02:00:00Z",
                            y: 30
                        }
                    }
                ],
                xlabel: "updated xlabel",
                ylabel: "updated ylabel",
                y2label: "updated y2label"
            };
            graphDefault.reflow(panData);
            const axisLabelX = fetchElementByClass(pairedResultGraphContainer, styles.axisLabelX);
            const axisLabelY = fetchElementByClass(pairedResultGraphContainer, styles.axisLabelY);
            const axisLabelY2 = fetchElementByClass(pairedResultGraphContainer, styles.axisLabelY2);
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
            graphDefault.loadContent(new PairedResult(input));
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
                expect(toNumber(translate[0], 10)).toBeCloserTo(80);
                expect(toNumber(translate[1], 10)).toBeCloseTo(PADDING_BOTTOM);
                done();
            });
        });
    });
});
