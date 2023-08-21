import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import braintree from "braintree-web";

function App() {
  const [clientToken, setClientToken] = useState("");
  const [hostedFieldsInstance, setHostedFieldsInstance] = useState();
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [amount, setAmount] = useState("");

  const handleSelectChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/payment/")
      .then((response) => response.json())
      .then((data) => {
        setClientToken(data);
      })
      .catch((error) => {
        console.error("Error fetching client token:", error);
      });
  }, []);

  useEffect(() => {
    if (clientToken) {
      braintree.client.create(
        {
          authorization: clientToken,
        },
        (err, clientInstance) => {
          if (err) {
            return;
          }

          braintree.hostedFields.create(
            {
              client: clientInstance,
              styles: {
                input: {
                  "font-size": "16px",
                  "font-family": "courier, monospace",
                  "font-weight": "lighter",
                  color: "#ccc",
                  padding: "10px",
                  margin: "10px 0",
                },
                ":focus": {
                  color: "black",
                },
                ".valid": {
                  color: "#8bdda8",
                },
              },
              fields: {
                cardholderName: {
                  selector: "#cardholder-name",
                  placeholder: "John Doe",
                },
                number: {
                  selector: "#card-number",
                  placeholder: "4111 1111 1111 1111",
                },
                cvv: {
                  selector: "#cvv",
                  placeholder: "123",
                },
                expirationDate: {
                  selector: "#expiration-date",
                  placeholder: "MM/YY",
                },
              },
            },
            (hostedFieldsErr, hostedFieldsInstance) => {
              if (hostedFieldsErr) {
                return;
              }
              setHostedFieldsInstance(hostedFieldsInstance);
            }
          );
        }
      );
    }
  }, [clientToken]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hostedFieldsInstance) {
      hostedFieldsInstance.tokenize(async (tokenizeErr, payload) => {
        if (tokenizeErr) {
          alert("Error: Some payment input fields are invalid.");
          return;
        }

        const nonce = payload.nonce;
        const paypalResponse = await axios({
          method: "post",
          url: "http://localhost:3000/api/order/",
          headers: {},
          data: {
            payment_method_nonce: nonce,
            amount,
            selectedCurrency,
          },
        });
        alert(paypalResponse.data.msg);
      });
    }
  };
  return (
    <div className="demo-frame">
      <form onSubmit={handleSubmit} id="cardForm">
        <div>
          <label htmlFor="cardholder-name" className="hosted-fields--label">
            Cardholder Name:
          </label>
          <div id="cardholder-name" className="hosted-field"></div>
        </div>
        <div>
          <label htmlFor="card-number" className="hosted-fields--label">
            Card Number:
          </label>
          <div id="card-number" className="hosted-field"></div>
        </div>
        <div>
          <label htmlFor="cvv" className="hosted-fields--label">
            CVV:
          </label>
          <div id="cvv" className="hosted-field"></div>
        </div>
        <div>
          <label htmlFor="expiration-date" className="hosted-fields--label">
            Expiration Date:
          </label>
          <div id="expiration-date" className="hosted-field"></div>
        </div>
        <div>
          <label htmlFor="currency" className="hosted-fields--label">
            Currency
          </label>
          <select
            value={selectedCurrency}
            onChange={handleSelectChange}
            className="hosted-field select-currency"
          >
            <option value="">Select currency</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="THB">THB</option>
            <option value="HKD">HKD</option>
            <option value="SGD">SGD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="hosted-fields--label">
            Amount
          </label>
          <input
            className="hosted-field select-currency"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter text here"
          />
        </div>
        <div className="button-container">
          <button type="submit" className="button button--small button--green">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
