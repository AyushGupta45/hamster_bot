/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import 'tailwindcss/tailwind.css';

const App = () => {
  const [upgrades, setUpgrades] = useState([]);
  const [balance, setBalance] = useState("");
  const [affordableItems, setAffordableItems] = useState([]);
  const [token, setToken] = useState(Cookies.get("userToken") || "");
  const [showTokenInput, setShowTokenInput] = useState(!Cookies.get("userToken"));
  const [totalProfit, setTotalProfit] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9,hi;q=0.8",
    authorization: `Bearer ${token}`,
    "content-length": "0",
    origin: "https://hamsterkombatgame.io",
    priority: "u=1, i",
    referer: "https://hamsterkombatgame.io/",
    "sec-ch-ua":
      '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  };

  useEffect(() => {
    if (token) {
      fetchUpgrades();
      fetchWalletDetails();
    }
  }, [token]);

  const fetchUpgrades = async () => {
    try {
      const response = await axios.post(
        "https://api.hamsterkombatgame.io/clicker/upgrades-for-buy",
        null,
        { headers }
      );
      const upgradesData = response.data.upgradesForBuy;

      const validUpgrades = upgradesData
        .filter(
          (upgrade) =>
            !upgrade.isExpired &&
            upgrade.price > 0 &&
            upgrade.profitPerHourDelta > 0 &&
            upgrade.profitPerHour > 0 &&
            (upgrade.cooldownSeconds === null || upgrade.cooldownSeconds === 0)
        )
        .map((upgrade) => ({
          ...upgrade,
          priceToProfitRatio: upgrade.price / upgrade.profitPerHourDelta,
        }));

      setUpgrades(validUpgrades);
    } catch (error) {
      console.error("Error fetching upgrades:", error);
    }
  };

  const fetchWalletDetails = async () => {
    try {
      const response = await axios.post(
        "https://api.hamsterkombatgame.io/clicker/sync",
        null,
        { headers }
      );
      const data = response.data;
      setWalletBalance(data.clickerUser.balanceCoins);
      setPassiveIncome(data.clickerUser.earnPassivePerHour);
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };

  const convertToNumber = (valueStr) => {
    const lowerCaseValue = valueStr.toLowerCase().trim();
    if (lowerCaseValue.endsWith("k")) {
      return parseFloat(lowerCaseValue.slice(0, -1)) * 1_000;
    } else if (lowerCaseValue.endsWith("m")) {
      return parseFloat(lowerCaseValue.slice(0, -1)) * 1_000_000;
    } else if (lowerCaseValue.endsWith("b")) {
      return parseFloat(lowerCaseValue.slice(0, -1)) * 1_000_000_000;
    } else {
      return parseFloat(lowerCaseValue);
    }
  };

  const handleBalanceSubmit = () => {
    const convertedBalance = convertToNumber(balance);
    const affordable = upgrades.filter(upgrade => upgrade.price <= convertedBalance);
    affordable.sort((a, b) => a.priceToProfitRatio - b.priceToProfitRatio);

    const selectedItems = [];
    let currentBalance = convertedBalance;

    for (let item of affordable) {
      if (item.price <= currentBalance) {
        selectedItems.push(item);
        currentBalance -= item.price;
      }
    }

    const totalSpent = selectedItems.reduce((acc, item) => acc + item.price, 0);
    const totalProfit = selectedItems.reduce((acc, item) => acc + item.profitPerHourDelta, 0);

    setTotalSpent(totalSpent);
    setAffordableItems(selectedItems);
    setTotalProfit(totalProfit);
  };

  const handleTokenSubmit = () => {
    Cookies.set("userToken", token, { expires: Infinity });
    setShowTokenInput(false);
    fetchUpgrades();
    fetchWalletDetails();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Hamster Kombat Card Purchaser</h1>
      {showTokenInput ? (
        <div className="mb-6 flex flex-col items-center">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your token"
            className="border border-gray-300 rounded p-2 w-full md:w-1/2 mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTokenSubmit}
            className="bg-blue-500 text-white rounded py-2 px-4 w-full md:w-1/2 shadow-md hover:bg-blue-600 transition-all duration-300"
          >
            Submit Token
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
            <p className="font-bold text-lg text-gray-700">Wallet Balance: <span className="text-green-600">{walletBalance.toLocaleString()}</span></p>
            <p className="font-bold text-lg text-gray-700">Passive Income per Hour: <span className="text-green-600">{passiveIncome}</span></p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <input
              type="text"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Enter your balance"
              className="border border-gray-300 rounded p-2 w-full md:w-3/4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleBalanceSubmit}
              className="bg-blue-500 text-white rounded p-2 w-full md:w-1/2 shadow-md hover:bg-blue-600 transition-all duration-300"
            >
              Submit Balance
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-md text-center">
            <p className="font-bold text-lg text-gray-700">Total Spent: <span className="text-red-600">{totalSpent.toLocaleString()}</span></p>
            <p className="font-bold text-lg text-gray-700">Total Profit: <span className="text-green-600">{totalProfit}</span></p>
          </div>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-blue-100">
                <th className="py-3 px-6 border-b text-left text-gray-800 font-bold">Name</th>
                <th className="py-3 px-6 border-b text-left text-gray-800 font-bold">Category</th>
                <th className="py-3 px-6 border-b text-left text-gray-800 font-bold">Price</th>
                <th className="py-3 px-6 border-b text-left text-gray-800 font-bold">Profit</th>
                <th className="py-3 px-6 border-b text-left text-gray-800 font-bold">Margin</th>
                <th className="py-3 px-6 border-b text-center text-gray-800 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {affordableItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100 transition-colors duration-200">
                  <td className="py-3 px-6 border-b text-left text-gray-700">{item.name}</td>
                  <td className="py-3 px-6 border-b text-left text-gray-700">{item.category}</td>
                  <td className="py-3 px-6 border-b text-left text-gray-700">{item.price.toLocaleString()}</td>
                  <td className="py-3 px-6 border-b text-left text-gray-700">{item.profitPerHourDelta}</td>
                  <td className="py-3 px-6 border-b text-left text-gray-700">{item.priceToProfitRatio.toFixed(2)}</td>
                  <td className="py-3 px-6 border-b text-center">
                    <button className="bg-green-500 text-white rounded px-4 py-2 shadow-md hover:bg-green-600 transition-all duration-300">Buy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
