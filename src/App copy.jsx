import { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [upgrades, setUpgrades] = useState([]);

  useEffect(() => {
    const url = "https://api.hamsterkombatgame.io/clicker/upgrades-for-buy";
    const token =
      "1722770307567G4FSj9M4WLSPMS69ILPjYxULCfCZtYJNqfdT76zGdEeJ5zby1J0znEmbPRau78CC946039914";
    // const token =
    //   "1722874841725QW7tl9Z5BUnql4Spw51xuoFUPpD53zDnKWj3sk6xI2eWfi73jHh0wHErXONEkiXO6479354365";

    axios
      .post(
        url,
        {},
        {
          headers: {
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
          },
        }
      )
      .then((response) => {
        const upgrades = response.data.upgradesForBuy.filter(
          (upgrade) =>
            !upgrade.isExpired &&
            upgrade.price > 0 &&
            upgrade.profitPerHourDelta > 0 &&
            upgrade.profitPerHour > 0 &&
            (upgrade.cooldownSeconds === undefined ||
              upgrade.cooldownSeconds === 0)
        );

        const sortedUpgrades = sortUpgradesBySection(upgrades);
        setUpgrades(sortedUpgrades);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const sortUpgradesBySection = (upgrades) => {
    const sectionGroups = upgrades.reduce((acc, upgrade) => {
      acc[upgrade.section] = acc[upgrade.section] || [];
      acc[upgrade.section].push(upgrade);
      return acc;
    }, {});

    Object.keys(sectionGroups).forEach((section) => {
      sectionGroups[section].sort(
        (a, b) => b.profitPerHourDelta - a.profitPerHourDelta
      );
    });

    return Object.values(sectionGroups).flat();
  };

  const sectionColors = {
    "PR&Team": "bg-blue-100",
    Specials: "bg-green-100",
    Legal: "bg-red-100",
    Web3: "bg-amber-100",
    Markets: "bg-orange-100",
  };

  const getSectionColor = (section) => sectionColors[section] || "bg-gray-100";

  const getMarginColor = (margin) => {
    if (margin < 500) return "bg-green-500";
    if (margin < 1000) return "bg-green-300";
    if (margin < 1500) return "bg-yellow-300";
    if (margin < 2000) return "bg-orange-300";
    return "bg-red-500";
  };

  const sections = ["PR&Team", "Specials", "Legal", "Web3", "Markets"];

  const upgradesBySection = sections.map((section) => {
    return {
      section,
      upgrades: upgrades.filter((upgrade) => upgrade.section === section),
    };
  });

  const highProfitUpgrades = upgrades.filter(
    (upgrade) => upgrade.profitPerHourDelta > 2000
  );

  const renderTable = (sectionUpgrades) => (
    <table className="w-full bg-white border border-gray-200">
      <thead className="bg-gray-200">
        <tr>
          <th className="py-2 px-4 border border-gray-400 text-start">Name</th>
          <th className="py-2 px-4 border border-gray-400 text-start">
            Section
          </th>
          <th className="py-2 px-4 border border-gray-400 text-start">Level</th>
          <th className="py-2 px-4 border border-gray-400 text-start">Price</th>
          <th className="py-2 px-4 border border-gray-400 text-start">
            Profit
          </th>
          <th className="py-2 px-4 border border-gray-400 text-start">
            Margin
          </th>
        </tr>
      </thead>
      <tbody>
        {sectionUpgrades.map((upgrade) => {
          const margin = upgrade.price / upgrade.profitPerHourDelta;
          return (
            <tr key={upgrade.id} className={getSectionColor(upgrade.section)}>
              <td className="py-2 px-4 border border-gray-400">
                {upgrade.name}
              </td>
              <td className="py-2 px-4 border border-gray-400">
                {upgrade.section}
              </td>
              <td className="py-2 px-4 border border-gray-400">
                {upgrade.level}
              </td>
              <td className="py-2 px-4 border border-gray-400">
                {upgrade.price.toLocaleString()}
              </td>
              <td className="py-2 px-4 border border-gray-400">
                {upgrade.profitPerHourDelta.toLocaleString()}
              </td>
              <td
                className={`py-2 px-4 border border-gray-400 ${getMarginColor(
                  margin
                )}`}
              >
                {margin.toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="container mx-auto p-4 grid grid-cols-2 gap-4">
      <div className="flex w-full flex-col">
        {upgradesBySection.map((sectionData) => (
          <div key={sectionData.section}>
            <h2 className="text-xl font-bold mb-2">{sectionData.section}</h2>
            {renderTable(sectionData.upgrades)}
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">High Profit Upgrades</h2>
        {renderTable(highProfitUpgrades)}
      </div>
    </div>
  );
};

export default App;
