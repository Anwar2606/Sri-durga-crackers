import React, { useEffect, useState } from "react";
import { db } from "../../pages/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaEye,
  FaEdit,
  FaFileInvoice,
  FaArrowCircleLeft,
  FaArrowAltCircleRight,
  FaTruck,
} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import { TbListNumbers } from "react-icons/tb";
import Logo from "../assets/PCW.png"; // Replace with your logo path
import { IoIosPerson } from "react-icons/io";
import Sidebar from "../Sidebar/Sidebar";

const ShowCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customer"));
        const customerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers: ", error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="main-container2">
      {/* Sidebar */}
     <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      {/* Main Content */}
      <div className="content">
        <div className="all-bills-page">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Customer Details</h1>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#1b2594",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onClick={() => navigate("/addcustomer")}
            >
              Add Customer
            </button>
          </div>
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>State</th>
                <th>Phone No</th>
                <th>GSTIN</th>
                <th>PAN</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.customerName}</td>
                    <td>{customer.customerAddress}</td>
                    <td>{customer.customerState}</td>
                    <td>{customer.customerPhoneNo}</td>
                    <td>{customer.customerGSTIN}</td>
                    <td>{customer.customerPan}</td>
                    <td>{customer.customerEmail}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No customer data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShowCustomers;
