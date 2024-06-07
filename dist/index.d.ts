export declare class ThermalTicketPrinter {
    private printerInterface;
    private width;
    private printer;
    constructor(printerInterface: string, width?: number);
    printTicket(templatePath: string, data: Record<string, unknown>): Promise<void>;
    private processElement;
    private getElementInfo;
    private processText;
    private processImage;
    private processTable;
    private processCode;
    private processAlignment;
    private processInvert;
}
