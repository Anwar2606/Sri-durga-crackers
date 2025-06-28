import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db, firestore } from '../firebase'; // Adjust the path to your Firebase config
import { FaDownload, FaEdit, FaTruck } from 'react-icons/fa'; // For Edit icon
import { jsPDF } from 'jspdf'; // Import jsPDF for generating PDFs
import { 
  FaHome, FaInfoCircle, FaServicestack, FaEnvelope, 
  FaArrowAltCircleRight, FaArrowCircleLeft, FaEye, FaFileInvoice 
} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import { Link } from "react-router-dom";
import Logo from "../assets/PCW.png";
import { TbListNumbers } from "react-icons/tb";
import './InvoiceEditBill.css';
import { formatDate } from 'date-fns';
import { IoIosPerson } from 'react-icons/io';
import Sidebar from '../Sidebar/Sidebar';

// const tamilFontBase64 = "4K644K+N4K6w4K+AIOCuquCviuCuqeCvjSDgrofgrrDgr4HgrrPgrqrgr43grqog4K6a4K+B4K614K6+4K6u4K6/IOCupOCvgeCuo+CviA=="; // Replace with your Base64 font string


const InvoiceEditBillPage = () => {
  const [bills, setBills] = useState([]);
   const [isOpen, setIsOpen] = useState(true);
  const [editBill, setEditBill] = useState(null); // Stores the selected bill for editing
  const [updatedDetails, setUpdatedDetails] = useState({}); // Holds updated bill details
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const billingSnapshot = await getDocs(collection(db, 'invoicebilling'));
        const billingData = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // const customerBillingSnapshot = await getDocs(collection(db, 'customerBilling'));
        // const customerBillingData = customerBillingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const allBills = [...billingData];
        setBills(allBills);
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };

    fetchBills();
  }, []);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
};
const handleEdit = (bill) => {
  setUpdatedDetails({ ...bill });
  setIsModalOpen(true);

  // Calculate initial totals
  const updatedProducts = bill.productsDetails.map((product) => ({
    ...product,
    total: (product.quantity || 0) * (product.saleprice || 0),
  }));
  setUpdatedDetails({ ...bill, productsDetails: updatedProducts });
};


//   const handleInputChange = (e, index, field) => {
//     const { name, value } = e.target;

//     if (field === 'product') {
//       const updatedProducts = [...updatedDetails.productsDetails];
//       updatedProducts[index][name] = value;

//       if (name === 'quantity' || name === 'saleprice') {
//         const quantity = updatedProducts[index].quantity || 0;
//         const price = updatedProducts[index].saleprice || 0;
//         updatedProducts[index].total = quantity * price;
//       }

//       setUpdatedDetails((prevDetails) => ({
//         ...prevDetails,
//         productsDetails: updatedProducts,
//       }));
//     } else {
//       setUpdatedDetails((prevDetails) => ({
//         ...prevDetails,
//         [name]: value,
//       }));
//     }
//   };

//   const calculateTotals = () => {
//     const totalAmount = updatedDetails.productsDetails.reduce(
//       (acc, product) => acc + (product.quantity * product.saleprice || 0),
//       0
//     );
//     const grandTotal = totalAmount + (updatedDetails.additionalCharges || 0);

//     setUpdatedDetails((prevDetails) => ({
//       ...prevDetails,
//       totalAmount,
//       grandTotal,
//     }));
//   };
const calculateInitialTotals = () => {
  const updatedProducts = updatedDetails.productsDetails.map((product) => ({
    ...product,
    total: (product.quantity || 0) * (product.saleprice || 0),
  }));
  setUpdatedDetails({ ...updatedDetails, productsDetails: updatedProducts });
};

const handleInputChange = (e, index = null, type = null) => {
  const { name, value } = e.target;
  if (type === "product" && index !== null) {
    // Update individual product details
    const updatedProducts = [...updatedDetails.productsDetails];
    updatedProducts[index][name] = value;

    // Recalculate total for the product
    if (name === "quantity" || name === "saleprice") {
      updatedProducts[index].total =
        updatedProducts[index].quantity * updatedProducts[index].saleprice || 0;
    }

    // Update state with recalculated totals
    const totalAmount = updatedProducts.reduce(
      (sum, product) => sum + (product.total || 0),
      0
    );
    const cgstAmount = (totalAmount * 0.09).toFixed(2);
    const sgstAmount = (totalAmount * 0.09).toFixed(2);
    const grandTotal = (totalAmount + parseFloat(cgstAmount) + parseFloat(sgstAmount)).toFixed(2);

    setUpdatedDetails({
      ...updatedDetails,
      productsDetails: updatedProducts,
      totalAmount,
      cgstAmount,
      sgstAmount,
      grandTotal,
    });
  } else {
    setUpdatedDetails({
      ...updatedDetails,
      [name]: value,
    });
  }
};

  
  // Function to calculate total, CGST, SGST, and Grand Total
  const calculateTotals = (products) => {
    const totalAmount = products.reduce((sum, product) => sum + (product.total || 0), 0);
  
    // Calculate CGST and SGST at 9% each
    const cgstAmount = totalAmount * 0.09;
    const sgstAmount = totalAmount * 0.09;
  
    // Calculate Grand Total
    const grandTotal = totalAmount + cgstAmount + sgstAmount;
  
    // Update the updatedDetails with new totals
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      totalAmount: totalAmount.toFixed(2), // Keep 2 decimal points
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    }));
  };
  const updateBillInFirestore = async (id, updatedDetails) => {
  try {
    const docRef = doc(db, "invoicebilling", id);
    await updateDoc(docRef, updatedDetails);
    alert("Bill updated successfully!");
  } catch (error) {
    console.error("Error updating bill:", error.message);
  }
};
  const handleSubmit = () => {
  const updatedData = { ...updatedDetails };

  // Make sure no undefined or null values are passed
  console.log("Final data to send:", updatedData);

  // Update local state
  const updatedBills = bills.map((bill) =>
    bill.id === updatedData.id ? { ...bill, ...updatedData } : bill
  );

  setBills(updatedBills);
  setIsModalOpen(false);

  // Save to Firestore
  updateBillInFirestore(updatedData.id, updatedData);
};


  // Function to generate and download PDF copies for a specific bill
//   const downloadAllCopies = (bill) => {
//     const pdf = new jsPDF();

//     // Title
//     pdf.setFontSize(16);
//     pdf.text('Invoice Copies', 10, 10);
//     pdf.setFontSize(12);
    
//     // Add details for each type of copy
//     const copies = ['Transport Copy', 'Office Copy', 'Customer Copy', 'Sales Copy'];
    
//     copies.forEach((copy, index) => {
//       const yPosition = 20 + index * 30; // Position for each copy
//       pdf.text(copy, 10, yPosition);
//       // Add the bill details here
//       pdf.text(`Invoice Number: ${bill.invoiceNumber || ''}`, 10, yPosition + 10);
//       pdf.text(`Customer Name: ${bill.customerName || ''}`, 10, yPosition + 20);
//       pdf.text(`Total Amount: ${bill.totalAmount || ''}`, 10, yPosition + 30);
//       pdf.text(`Grand Total: ${bill.grandTotal || ''}`, 10, yPosition + 40);
//       pdf.addPage(); // Add a new page for the next copy
//     });

//     pdf.save(`Invoice_Copies_${bill.invoiceNumber}.pdf`); // Save the PDF with the invoice number
//   };

const formatDate = (createdAt) => {
    let createdAtDate;
  
    // Convert createdAt to a Date object
    if (createdAt instanceof Timestamp) {
      createdAtDate = createdAt.toDate();
    } else if (typeof createdAt === 'string' || createdAt instanceof Date) {
      createdAtDate = new Date(createdAt);
    } else {
      return 'Invalid Date'; // Handle cases where createdAt is not valid
    }
  
    // Format the date as 'MM/DD/YYYY' or any desired format
    return !isNaN(createdAtDate.getTime())
      ? createdAtDate.toLocaleDateString() // Returns only the date portion (e.g., "8/27/2024")
      : 'Invalid Date';
  };
const downloadAllCopies = (bill) => {

 const doc = new jsPDF();
const copies = ['Transport Copy', 'Office Copy', 'Customer Copy', 'Sales Copy'];
const numberToWords = require('number-to-words');

const drawPageBorder = () => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const borderMargin = 10;
 const drawPageBorder = () => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
  };
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
};

copies.forEach((copyType, index) => {
  if (index > 0) doc.addPage();

  const formattedDate = formatDate(bill.createdAt);
  const customer = bill;
 let headerTableStartY = 12;
    let headerTableEndY = 0;
 doc.autoTable({
      body: [
        ['T.M.CRACKERS PARK', '','TAX INVOICE' ],
        ['Address:1/90Z6, Balaji Nagar, Anna Colony', '',`${copyType.toUpperCase()}` ],
        ['Vadamamalapuram', '', `Invoice Number: SDC-${bill.invoiceNumber}-25`],
        ['Thiruthangal - 626130', '', `Date: ${formattedDate}`],
        ['Sivakasi (Zone)', '', 'GSTIN: 33AAVFT8036C1ZZ'],
        ['Virudhunagar (Dist)', '', ''],
        ['State: 33-Tamil Nadu', '', ''],
        ['Phone number: 97514 87277 / 95853 58106', '', '']
      ],
      startY: headerTableStartY,
      theme: 'plain',
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 37 },
        2: { fontStyle: 'bold', halign: 'right', cellWidth: 60 }
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.textColor = [255, 0, 0];
          data.cell.styles.fontSize = 11;
          data.cell.styles.fontStyle = 'bold';
        }
      },
      didDrawPage: drawPageBorder,
      didDrawCell: (data) => {
        if (data.row.index === 7 && data.column.index === 2) {
          headerTableEndY = data.cell.y + data.cell.height;
        }
      }
    });
const pageWidth = doc.internal.pageSize.getWidth();
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(14, headerTableStartY, pageWidth - 28, headerTableEndY - headerTableStartY);

  const customerTable = [
    ['TO', '', 'Account Details', ''],
    ['Name', customer.customerName || 'N/A', 'A/c Holder Name', 'GOWTHAM'],
    ['Address', customer.customerAddress || 'N/A', 'A/c Number', '231100050309543'],
    ['State', customer.customerState || 'N/A', 'Bank Name', 'TAMILNAD MERCANTILE BANK'],
    ['Phone', customer.customerPhone || 'N/A', 'Branch', 'THIRUTHANGAL'],
    ['GSTIN', customer.customerGSTIN || 'N/A', 'IFSC Code', 'TMBL0000231'],
    ['PAN', customer.customerPAN || 'N/A', '', '']
  ];

  doc.autoTable({
    body: customerTable,
    startY: doc.autoTable.previous.finalY + 5,
    theme: 'grid',
    styles: { fontSize: 9,lineColor: [0, 0, 0], textColor:[0,0,0] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { fontStyle: 'bold', cellWidth: 35 },
      3: { cellWidth: 57 }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: drawPageBorder
  });

  const tableBody = bill.productsDetails.map(item => {
    const saleprice = parseFloat(item.saleprice) || 0;
    const quantity = parseFloat(item.quantity) || 0;
    return [
      item.name || 'N/A',
      '36041000',
      quantity.toString(),
      `Rs.${saleprice.toFixed(2)}`,
      `Rs.${(saleprice * quantity).toFixed(2)}`
    ];
  });

  doc.autoTable({
    head: [['Product Name', 'HSN CODE', 'Quantity', 'Price', 'Total Amount']],
    body: tableBody,
    startY: doc.autoTable.previous.finalY + 5,
    theme: 'grid',
    headStyles: { fillColor: [255, 182, 193], textColor: [0, 0, 139] },
    styles: { fontSize: 10,lineColor: [0, 0, 0],textColor:[0,0,0] },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: drawPageBorder
  });

  const totalAmount = `Rs.${bill.totalAmount?.toFixed(2) || '0.00'}`;
  const cgstAmount = `Rs.${bill.cgstAmount || '0.00'}`;
  const sgstAmount = `Rs.${bill.sgstAmount || '0.00'}`;
  const igstAmount = `Rs.${bill.igstAmount || '0.00'}`;
  const grandTotal = `Rs.${bill.grandTotal || '0.00'}`;

  doc.autoTable({
    body: [
      ['Total Amount', totalAmount],
      ['CGST (9%)', cgstAmount],
      ['SGST (9%)', sgstAmount],
      ['IGST (18%)', igstAmount],
      ['Grand Total', grandTotal]
    ],
    startY: doc.autoTable.previous.finalY + 5,
    theme: 'grid',
    styles: { fontSize: 10 ,textColor:[0,0,0],lineColor:[0,0,0]},
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { halign: 'right' }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: drawPageBorder
  });

  const inWords = numberToWords.toWords(bill.grandTotal || 0);
  doc.autoTable({
    body: [[`Rupees: ${inWords.toUpperCase()}`]],
    startY: doc.autoTable.previous.finalY + 3,
    theme: 'plain',
    styles: { fontSize: 10, fontStyle: 'bold', textColor: [0, 0, 139] },
    margin: { left: 15 },
    didDrawPage: drawPageBorder
  });

  let termsStartY = doc.autoTable.previous.finalY + 2;
let termsEndY = 0; // will be set later

// Terms & Conditions Table
doc.autoTable({
  body: [
    ['Terms & Conditions'],
    ['1. Goods once sold will not be taken back.'],
    ['2. All matters subject to "Sivakasi" jurisdiction only.']
  ],
  startY: termsStartY,
  theme: 'plain',
  didDrawPage: drawPageBorder,
  styles: { fontSize: 9 },
  margin: { left: 15 },
  didDrawCell: function (data) {
    // Capture bottom Y of last row
    if (data.row.index === 2 && data.column.index === 0) {
      termsEndY = data.cell.y + data.cell.height;
    }
  }
});

// Authorised Signature Table (placed just below terms)
doc.autoTable({
  body: [['', '', 'Authorised Signature']],
  startY: doc.autoTable.previous.finalY + 2,
  theme: 'plain',
  didDrawPage: drawPageBorder,
  styles: { fontSize: 10, fontStyle: 'bold' },
  columnStyles: {
    2: { halign: 'right' }
  },
  margin: { left: 15, right: 15 }
});

// 🔲 Draw the rectangle after both tables
doc.setDrawColor(0);
doc.setLineWidth(0.2);
doc.rect(15, termsStartY, doc.internal.pageSize.getWidth() - 30, doc.autoTable.previous.finalY + 10 - termsStartY);
  
});

doc.save(`TAX INVOICE-${bill.invoiceNumber}.pdf`);


  };
  const handleRemoveProduct = (index) => {
    const updatedProducts = [...updatedDetails.productsDetails];
  
    // Remove the product at the specified index
    updatedProducts.splice(index, 1);
  
    // Check if there are any taxable products remaining
    const hasTaxableProducts = updatedProducts.length > 0;
  
    // Calculate the new total amount
    const newTotalAmount = updatedProducts.reduce(
      (sum, product) => sum + product.quantity * product.saleprice,
      0
    );
  
    // Initialize CGST, SGST, and Grand Total
    let cgstAmount = 0;
    let sgstAmount = 0;
    let grandTotal = newTotalAmount;
  
    // Only calculate taxes if there are taxable products
    if (hasTaxableProducts) {
      cgstAmount = newTotalAmount * 0.09; // 9% CGST
      sgstAmount = newTotalAmount * 0.09; // 9% SGST
      grandTotal = newTotalAmount + cgstAmount + sgstAmount;
    }
  
    // Update the state with new values
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      productsDetails: updatedProducts,
      totalAmount: newTotalAmount,
      cgstAmount: hasTaxableProducts ? cgstAmount : 0,
      sgstAmount: hasTaxableProducts ? sgstAmount : 0,
      grandTotal: hasTaxableProducts ? grandTotal : newTotalAmount,
    }));
  };
  
  return (
    <div className="edit-bill-page">
      <div className="main-container2">
        {/* Sidebar Component */}
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
  
        {/* Main Content */}
        <div className="content">
          <div className="all-bills-page">
            <h1>Edit Invoice Bills</h1>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer Name</th>
                  <th>Total Amount</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.invoiceNumber}</td>
                    <td>{bill.customerName}</td>
                    <td>{bill.totalAmount}</td>
                    <td>{bill.grandTotal}</td>
                    <td>
                      <FaEdit
                        className="download-icon"
                        onClick={() => handleEdit(bill)}
                      />
                      <FaDownload
                        className="delete-icon"
                        onClick={() => downloadAllCopies(bill)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
  
            {isModalOpen && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Edit Bill</h2>
                  <label>Customer Name:</label>
                  <input
                    type="text"
                    name="customerName"
                    value={updatedDetails.customerName || ""}
                    onChange={(e) => handleInputChange(e)}
                  />
                  <label>Customer Address:</label>
                  <input
                    type="text"
                    name="customerAddress"
                    value={updatedDetails.customerAddress || ""}
                    onChange={(e) => handleInputChange(e)}
                  />
                  <label>Customer State:</label>
                  <input
                    type="text"
                    name="customerState"
                    value={updatedDetails.customerState || ""}
                    onChange={(e) => handleInputChange(e)}
                  />
                  <label>Customer Phone:</label>
                  <input
                    type="text"
                    name="customerPhone"
                    value={updatedDetails.customerPhone || ""}
                    onChange={(e) => handleInputChange(e)}
                  />
                  <label>Customer GSTIN:</label>
                  <input
                    type="text"
                    name="customerGSTIN"
                    value={updatedDetails.customerGSTIN || ""}
                    onChange={(e) => handleInputChange(e)}
                  />
                  <label>Customer Aadhar:</label>
                  <input
                    type="text"
                    name="customerAadhar"
                    value={updatedDetails.customerAadhar || ""}
                    onChange={(e) => handleInputChange(e)}
                  />
                  <h3>Products</h3>
                  {updatedDetails.productsDetails.map((product, index) => (
                    <div key={index}>
                      <label>Product Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={product.name || ""}
                        onChange={(e) => handleInputChange(e, index, "product")}
                      />
                      <label>Quantity:</label>
                      <input
                        type="number"
                        name="quantity"
                        value={product.quantity || ""}
                        onChange={(e) => handleInputChange(e, index, "product")}
                      />
                      <label>Price:</label>
                      <input
                        type="number"
                        name="saleprice"
                        value={product.saleprice || ""}
                        onChange={(e) => handleInputChange(e, index, "product")}
                      />
                      <label>Total:</label>
                      <input
  type="number"
  name="total"
  value={product.total || 0}
  readOnly
/>


<button
  type="button"
  onClick={() => handleRemoveProduct(index)}
  style={{
    marginLeft: "10px",
    padding: "5px 10px",
    backgroundColor: "#ff4d4f",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  }}
>
  Remove
</button>


                    </div>
                  ))}
                  <label>Total Amount:</label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={updatedDetails.totalAmount || ""}
                    readOnly
                  />
                  <label>CGST (9%):</label>
                  <input
                    type="number"
                    name="cgstAmount"
                    value={updatedDetails.cgstAmount || ""}
                    readOnly
                  />
                  <label>SGST (9%):</label>
                  <input
                    type="number"
                    name="sgstAmount"
                    value={updatedDetails.sgstAmount || ""}
                    readOnly
                  />
                  <label>Grand Total:</label>
                  <input
                    type="number"
                    name="grandTotal"
                    value={updatedDetails.grandTotal || ""}
                    readOnly
                  />
                  <button onClick={handleSubmit}>Save</button>
                  <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  
};

export default InvoiceEditBillPage;
