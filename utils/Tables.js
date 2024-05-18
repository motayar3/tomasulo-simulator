// components/Tables.js
import React from 'react';

const Tables = ({ registers, memory, reservationStations }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mt-4 mb-4">Reservation Stations</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Type</th>
            <th className="py-2 px-4 border">Instruction</th>
            <th className="py-2 px-4 border">Issue Time</th>
            <th className="py-2 px-4 border">Execute Start Time</th>
            <th className="py-2 px-4 border">Execute End Time</th>
            <th className="py-2 px-4 border">Write Time</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(reservationStations).map(type => 
            reservationStations[type].map((station, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border">{type}</td>
                <td className="py-2 px-4 border">{station.instruction}</td>
                <td className="py-2 px-4 border">{station.issueTime}</td>
                <td className="py-2 px-4 border">{station.executeStartTime}</td>
                <td className="py-2 px-4 border">{station.executeEndTime}</td>
                <td className="py-2 px-4 border">{station.writeTime}</td></tr>
            ))
          )}
        </tbody>
      </table>
      <h2 className="text-2xl font-bold mb-2 mt-4">Registers</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Register</th>
            <th className="py-2 px-4 border">Value</th>
          </tr>
        </thead>
        <tbody>
          {registers.map((value, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border">R{index}</td>
              <td className="py-2 px-4 border">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mt-4 mb-2">Memory</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Address</th>
            <th className="py-2 px-4 border">Value</th>
          </tr>
        </thead>
        <tbody>
          {memory.map((value, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border">{index * 4}</td> {/* Assuming 4-byte word size */}
              <td className="py-2 px-4 border">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      
    </div>
  );
}

export default Tables;
