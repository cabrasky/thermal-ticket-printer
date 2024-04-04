import { ThermalTicketPrinter } from 'thermal-ticket-printer'


// Sample ticket data
const ticketData = {
    current_date: '2024-04-03',
    items: [
        { name: 'Item 1', quantity: 2, price: 10.99 },
        { name: 'Item 2', quantity: 1, price: 5.99 },
    ],
    total_amount: 27.97,
};

// Printer configuration
const printerInterface: string = '/dev/usb/lp2'; // Your printer interface
const templatePath: string = './ticket.xml';

// Create an instance of ThermalTicketPrinter
const printer = new ThermalTicketPrinter(templatePath, printerInterface);

// Print the ticket
printer.printTicket(ticketData)
    .then(() => {
        console.log('Ticket printed successfully.');
    })
    .catch((error) => {
        console.error('Error printing ticket:', error);
    });
