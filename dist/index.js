"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermalTicketPrinter = void 0;
const node_thermal_printer_1 = require("node-thermal-printer");
const fs = __importStar(require("fs"));
const mustache_1 = require("mustache");
const xml_js_1 = require("xml-js");
class ThermalTicketPrinter {
    constructor(templatePath, printerInterface) {
        this.templatePath = templatePath;
        this.printerInterface = printerInterface;
        this.printer = new node_thermal_printer_1.ThermalPrinter({
            type: node_thermal_printer_1.PrinterTypes.EPSON,
            interface: printerInterface,
            characterSet: node_thermal_printer_1.CharacterSet.PC850_MULTILINGUAL,
            removeSpecialCharacters: false,
            lineCharacter: '*',
            breakLine: node_thermal_printer_1.BreakLine.CHARACTER,
            width: 32,
        });
    }
    async printTicket(data) {
        const xmlTemplate = fs.readFileSync(this.templatePath, 'utf-8');
        const renderedTemplate = (0, mustache_1.render)(xmlTemplate, data);
        const ticket = (0, xml_js_1.xml2js)(renderedTemplate, { compact: false });
        await this.processElement(ticket.elements.find((element) => { return element.type === 'element' && element.name === 'ticket'; }));
        this.printer.cut({
            verticalTabAmount: 1
        });
        await this.printer.execute();
        await this.printer.clear();
    }
    async processElement(element) {
        var _a, _b;
        if (!element || !element.elements)
            return;
        for (const childElement of element.elements) {
            const elementInfo = this.getElementInfo(childElement);
            switch (elementInfo.name) {
                case 'text':
                    this.processText(elementInfo.attributes, (_b = (_a = childElement.elements) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text);
                    break;
                case 'img':
                    await this.processImage(elementInfo.attributes);
                    break;
                case 'table':
                    this.processTable(childElement.elements);
                    break;
                case 'linebreak':
                    this.printer.newLine();
                    break;
                case 'cut':
                    if (elementInfo.attributes) {
                        this.printer.cut({
                            verticalTabAmount: parseInt(elementInfo.attributes['vertical'], 10)
                        });
                    }
                    this.printer.cut({
                        verticalTabAmount: 1
                    });
                    break;
                case 'beep':
                    this.printer.beep();
                    break;
                case 'code':
                    this.processCode(elementInfo.attributes);
                    break;
                case 'alignment':
                    this.processAlignment(elementInfo.attributes);
                    await this.processElement(childElement);
                    break;
                case 'invert':
                    this.processInvert(elementInfo.attributes);
                    await this.processElement(childElement);
                    this.printer.invert(false); // Reset invert after processing children
                    break;
                default:
                    break;
            }
        }
    }
    getElementInfo(element) {
        const name = element.name;
        const attributes = {};
        if (element.attributes) {
            for (const attrKey of Object.keys(element.attributes)) {
                attributes[attrKey] = element.attributes[attrKey];
            }
        }
        return {
            name,
            attributes,
            elements: element.elements || [],
        };
    }
    processText(attributes, text) {
        if (!text)
            return;
        this.printer.underline(attributes['underline'] === 'true');
        this.printer.bold(attributes['bold'] === 'true');
        const special = attributes['special'];
        const font = attributes['font'];
        const textHeight = parseInt(attributes['textHeight'] || '', 10);
        const textWidth = parseInt(attributes['textWidth'] || '', 10);
        if (special) {
            switch (special) {
                case "none":
                    this.printer.setTextNormal();
                    break;
                case "doubleH":
                    this.printer.setTextDoubleHeight();
                    break;
                case "doubleW":
                    this.printer.setTextDoubleWidth();
                    break;
                case "quad":
                    this.printer.setTextDoubleHeight();
                    this.printer.setTextDoubleWidth();
                    break;
            }
        }
        if (font) {
            switch (font) {
                case "A":
                    this.printer.setTypeFontA();
                    break;
                case "B":
                    this.printer.setTypeFontB();
            }
        }
        if (!isNaN(textHeight) && !isNaN(textWidth)) {
            this.printer.setTextSize(Number(textHeight === 2), Number(textWidth === 2));
        }
        this.printer.print(String(text));
        // Reset styles
        this.printer.setTextNormal();
    }
    async processImage(attributes) {
        const src = attributes['src'];
        if (src) {
            await this.printer.printImage(src);
        }
    }
    processTable(rows = []) {
        rows.forEach(row => {
            if (row.elements) {
                const rowData = row.elements.map(td => {
                    var _a, _b, _c, _d, _e, _f;
                    return ({
                        text: String(((_b = (_a = td.elements) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) || ''),
                        align: (_c = td.attributes) === null || _c === void 0 ? void 0 : _c['alignment'],
                        width: parseInt(((_d = td.attributes) === null || _d === void 0 ? void 0 : _d['width']) || '', 10),
                        cols: parseInt(((_e = td.attributes) === null || _e === void 0 ? void 0 : _e['cols']) || '', 10),
                        bold: ((_f = td.attributes) === null || _f === void 0 ? void 0 : _f['bold']) === 'true',
                    });
                });
                this.printer.tableCustom(rowData);
            }
        });
    }
    processCode(attributes) {
        const type = attributes['type'];
        const value = attributes['value'];
        if (type && value) {
            switch (type) {
                case 'QR':
                    this.printer.printQR(value);
                    break;
                case 'Code128':
                    this.printer.code128(value);
                    break;
                default:
                    break;
            }
        }
    }
    processAlignment(attributes) {
        const alignment = attributes['alignment'];
        if (alignment) {
            switch (alignment) {
                case 'LEFT':
                    this.printer.alignLeft();
                    break;
                case 'CENTER':
                    this.printer.alignCenter();
                    break;
                case 'RIGHT':
                    this.printer.alignRight();
                    break;
                default:
                    break;
            }
        }
    }
    processInvert(attributes) {
        const invert = attributes['invert'] === 'true';
        this.printer.invert(invert);
    }
}
exports.ThermalTicketPrinter = ThermalTicketPrinter;
//# sourceMappingURL=index.js.map