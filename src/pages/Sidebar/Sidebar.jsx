import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import {
  FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowAltCircleRight,
  FaArrowCircleLeft, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { TbListNumbers } from "react-icons/tb";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import { IoIosPerson } from "react-icons/io";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";
import { GrDocumentPdf } from "react-icons/gr";
import { IoDocumentTextOutline } from "react-icons/io5";
import Logo from "../assets/PCW.png"; // Update path if needed

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <ul>
        <li style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: '20px 0', borderBottom: '2px solid #c3b6d0', paddingBottom: '10px' }}>
          {isOpen ? 'Sri Durga Crackes' : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '-14px' }}>
              <img src={Logo} alt="PCW Logo" style={{ width: '50px', height: 'auto' }} />
            </div>
          )}
        </li>
        <li><Link to="/newhome"><FaHome /> {isOpen && <span>Home</span>}</Link></li>
        <li><Link to="/products"><AiFillProduct /> {isOpen && <span>Products</span>}</Link></li>
        <li><Link to="/allbills"><FaEye /> {isOpen && <span>All Bills</span>}</Link></li>
        <li><Link to="/editbill"><FaEdit /> {isOpen && <span>Edit Bills</span>}</Link></li>
         <li><Link to="/wholesalebill"><GrDocumentPdf />{isOpen && <span>Whole Sale Bill</span>}</Link></li>
        <li><Link to="/retailcalculator"><IoDocumentTextOutline />{isOpen &&<span>Retail Bill</span>}</Link></li>
         <li><Link to="/invoicebill"><HiOutlineDocumentText />{isOpen &&<span>Invoice</span>}</Link></li>
        <li><Link to="/waybill"><HiOutlineDocumentCheck />{isOpen &&<span>Way Bill</span>}</Link></li>
        <li><Link to="/showcustomers"><IoIosPerson /> {isOpen && <span>Customers</span>}</Link></li>
        <li><Link to="/invoice"><TbListNumbers />{isOpen && <span>Invoice Numbers</span>}</Link></li>
        <li><Link to="/"><MdLogout /> {isOpen && <span>Logout</span>}</Link></li>
        <li className="menu-item">
          <button onClick={toggleSidebar} style={{ padding: '10px', backgroundColor: '#1b2594', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', cursor: 'pointer' }}>
            {isOpen ? <FaArrowCircleLeft style={{ color: 'white' }} /> : <FaArrowAltCircleRight style={{ color: 'white' }} />}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
