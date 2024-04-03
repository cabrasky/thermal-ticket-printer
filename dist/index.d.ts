export declare class ThermalTicketPrinter {
    private templatePath;
    private printerInterface;
    private printer;
    constructor(templatePath: string, printerInterface: string);
    printTicket(data: Record<string, unknown>): Promise<void>;
    private processElement;
    private getElementInfo;
    private processText;
    private processImage;
    private processTable;
    private processCode;
    private processAlignment;
    private processInvert;
}