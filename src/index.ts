import { BreakLine, CharacterSet, PrinterTypes, ThermalPrinter } from 'node-thermal-printer';
import * as fs from 'fs';
import { render } from 'mustache';
import { Element, xml2js } from 'xml-js';

type AttributeMap = { [key: string]: string };

interface ElementInfo {
    name: string;
    attributes?: AttributeMap;
    elements?: Element[];
}

export class ThermalTicketPrinter {
    private printer: ThermalPrinter;

    constructor(private printerInterface: string, private width: number = 32) {
        this.printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: printerInterface,
            characterSet: CharacterSet.PC850_MULTILINGUAL,
            removeSpecialCharacters: false,
            lineCharacter: '*',
            breakLine: BreakLine.CHARACTER,
            width
        });
    }

    public async printTicket(templatePath: string, data: Record<string, unknown>): Promise<void> {
        const xmlTemplate: string = fs.readFileSync(templatePath, 'utf-8');

        const renderedTemplate: string = render(xmlTemplate, data);
        const ticket = xml2js(renderedTemplate, { compact: false }) as Element;

        await this.processElement(ticket.elements!.find((element) => {return element.type === 'element' && element.name === 'ticket'}));

        this.printer.cut({
            verticalTabAmount: 1
        });
        await this.printer.execute();
        await this.printer.clear();
    }

    private async processElement(element: Element | null | undefined): Promise<void> {
        if ( !element || !element.elements) return;

        for (const childElement of element.elements) {
            const elementInfo = this.getElementInfo(childElement);

            switch (elementInfo.name) {
                case 'text':
                    this.processText(elementInfo.attributes!, <string>childElement.elements?.[0]?.text);
                    break;

                case 'img':
                    await this.processImage(elementInfo.attributes!);
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
                    this.processCode(elementInfo.attributes!);
                    break;

                case 'alignment':
                    this.processAlignment(elementInfo.attributes!);
                    await this.processElement(childElement);
                    break;

                case 'invert':
                    this.processInvert(elementInfo.attributes!);
                    await this.processElement(childElement);
                    this.printer.invert(false); // Reset invert after processing children
                    break;

                default:
                    break;
            }
        }
    }

    private getElementInfo(element: Element): ElementInfo {
        const name = element.name as string;
        const attributes: AttributeMap = {};

        if (element.attributes) {
            for (const attrKey of Object.keys(element.attributes)) {
                attributes[attrKey] = element.attributes[attrKey] as string;
            }
        }

        return {
            name,
            attributes,
            elements: element.elements || [],
        };
    }

    private processText(attributes: AttributeMap, text?: string): void {
        if (!text) return;

        this.printer.underline(attributes['underline'] === 'true');
        this.printer.bold(attributes['bold'] === 'true');

        const special = attributes['special'] as 'none' | 'doubleH' | 'doubleW' | 'quad';
        const font = attributes['font'] as 'A' | 'B';
        const textHeight = parseInt(attributes['textHeight'] || '', 10);
        const textWidth = parseInt(attributes['textWidth'] || '', 10);

        if (special) {
            switch (special){
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
            this.printer.setTextSize(Number(textHeight === 2), Number(textWidth === 2))
        }

        this.printer.print(String(text));

        // Reset styles
        this.printer.setTextNormal();
    }

    private async processImage(attributes: AttributeMap): Promise<void> {
        const src = attributes['src'];
        if (src) {
            await this.printer.printImage(src);
        }
    }

    private processTable(rows: Element[] = []): void {
        rows.forEach(row => {
            if (row.elements) {
                const rowData = row.elements.map(td => ({
                    text: String(td.elements?.[0]?.text || ''),
                    align: td.attributes?.['alignment'] as 'LEFT' | 'CENTER' | 'RIGHT',
                    width: parseInt(<string>td.attributes?.['width'] || '', 10),
                    cols: parseInt(<string>td.attributes?.['cols'] || '', 10),
                    bold: td.attributes?.['bold'] === 'true',
                }));
                this.printer.tableCustom(rowData);
            }
        });
    }

    private processCode(attributes: AttributeMap): void {
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

    private processAlignment(attributes: AttributeMap): void {
        const alignment = attributes['alignment'] as 'LEFT' | 'CENTER' | 'RIGHT';
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

    private processInvert(attributes: AttributeMap): void {
        const invert = attributes['invert'] === 'true';
        this.printer.invert(invert);
    }
}
