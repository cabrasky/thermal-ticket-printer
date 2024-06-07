# Thermal Ticket Printer

Thermal Ticket Printer is a npm package that provides a TypeScript class to process and print thermal tickets using a thermal printer. It supports rendering tickets from an XML template and printing them with customizable formatting options.

## Installation

To use this module in your TypeScript project, you'll need to install the required dependencies:

```bash
npm install thermal-ticket-printer
```

## Usage

1. **Import the Module**

   Import the `ThermalTicketPrinter` class from `thermal-ticket-printer` in your TypeScript file:

   ```typescript
   import { ThermalTicketPrinter } from 'thermal-ticket-printer';
   ```

2. **Prepare Ticket Data**

   Define the data for your thermal ticket. For example:

   ```typescript
   const ticketData = {
       current_date: '2024-04-03',
        items: [
            { name: 'Item 1', quantity: 2, price: 10.99 },
            { name: 'Item 2', quantity: 1, price: 5.99 },
        ],
        total_amount: 27.97,
   };
   ```

3. **Define Printer Configuration**

   Set up the printer configuration, including the interface (e.g., `/dev/usb/lp2`):

   ```typescript
   const printerInterface: string = '/dev/usb/lp2'; // Your printer interface
   ```

4. **Create Printer Instance**

   Create an instance of `ThermalTicketPrinter` with the template path and printer interface:

   ```typescript
   const printer = new ThermalTicketPrinter(printerInterface);
   ```

5. **Print the Ticket**

   Call the `printTicket` method of the printer instance with the ticket data:

   ```typescript
   printer.printTicket('path/to/your/template.xml', ticketData)
       .then(() => {
           console.log('Ticket printed successfully.');
       })
       .catch((error) => {
           console.error('Error printing ticket:', error);
       });
   ```

## XML Template

The XML template defines the structure of the thermal ticket. It follows a specific format and structure to properly render the ticket elements. Here's an example of an XML template:

```xml
<!DOCTYPE ticket SYSTEM "ticket-receipt.dtd">
<ticket width="32">
   <alignment alignment="CENTER">
      <img src="templates/resources/logo.png"/>
      <text underline="true" bold="true">Store Name</text>
      <linebreak/>
      <text>Date: {{ current_date }}</text>
   </alignment>
   <linebreak/>

   <table>
      <tr>
         <td width=".4">Item</td>
         <td width=".2">Qty</td>
         <td>Price</td>
      </tr>
      {{#items}}
      <tr>
         <td width=".4" alignment="LEFT">{{ name }}</td>
         <td width=".2" alignment="RIGHT">{{ quantity }}</td>
         <td alignment="RIGHT">{{ price }}</td>
      </tr>
      {{/items}}
   </table>
   <linebreak/>

   <text bold="true">Total: {{ total_amount }}€</text>
   <linebreak/>

   <text>Thank you for shopping with us!</text>
</ticket>
```

Modify this template to fit your specific ticket layout. The template uses placeholders (`{{ ... }}`) which will be replaced with the actual data when rendering the ticket.

## Sample Files

The package includes sample files to help you get started:

- `templates/ticket-receipt.dtd`: This file is the DTD for a thermal ticket.
- `templates/ticket-template.xml`: This file is an example XML template for a thermal ticket.

You can use these sample files as templates for creating your own thermal tickets. To access them, install the package and navigate to the `templates` directory in the installed package directory.

There is also the full TS + XML sample files in the folder `example` to test rapidly the config

## License

This module is licensed under the MIT License. Feel free to modify and use it in your projects.

## Author

Created by Cabrasky - Javier Mateos Mata

## Issues and Contributions

If you encounter any issues or have suggestions for improvement, please open an issue on the GitHub repository: [thermal-ticket-printer](https://github.com/cabrasky/thermal-ticket-printer)

Contributions are welcome! Fork the repository, make your changes, and submit a pull request.

