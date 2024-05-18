'use client'
// pages/index.js
// pages/index.js
import { useState } from 'react';
import TomasuloSimulator from '../lib/TomasuloSimulator';
import Tables from '../utils/Tables';

export default function Home() {
  const [program, setProgram] = useState('');
  const [data, setData] = useState('');
  const [metrics, setMetrics] = useState({});
  const [simulator] = useState(new TomasuloSimulator());
  const [run, setRun] = useState(false)
  const [state, setState] = useState({
    registers: [],
    memory: [],
    reservationStations: {},
  });

 

  const handleRun = () => {
    try {
      const programArray = program.split('\n').map(line => line.trim()).filter(line => line);
      const dataArray = data.split('\n').map(line => {
        const [address, value] = line.split(',').map(Number);
        return { address, value };
      });

      simulator.reset();
      simulator.loadProgram(programArray);
      simulator.loadData(dataArray);
      simulator.run();
      setMetrics(simulator.getMetrics());
      setState({
        registers: simulator.getRegisters(),
        memory: simulator.getMemory(),
        reservationStations: simulator.getReservationStations(),
      });
      setRun(true);
      console.log(state);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleStep = () => {
    if (run) {
      try {
      simulator.step();
      setMetrics(simulator.getMetrics());
      setState({
        registers: simulator.getRegisters(),
        memory: simulator.getMemory(),
        reservationStations: simulator.getReservationStations(),
      });
      console.log(state);
    } catch (error) {
      alert(error.message);
    }
  } else {
      const programArray = program.split('\n').map(line => line.trim()).filter(line => line);
      const dataArray = data.split('\n').map(line => {
        const [address, value] = line.split(',').map(Number);
        return { address, value };
      });
      simulator.reset();
      simulator.loadProgram(programArray);
      simulator.loadData(dataArray);
      simulator.step();
      setMetrics(simulator.getMetrics());
      setState({
        registers: simulator.getRegisters(),
        memory: simulator.getMemory(),
        reservationStations: simulator.getReservationStations(),
      });
      setRun(true);
    }
  };

  const handleReset = () => {
    simulator.reset();
    setMetrics(simulator.getMetrics());
    setState({
      registers: simulator.getRegisters(),
      memory: simulator.getMemory(),
      reservationStations: simulator.getReservationStations(),
    });
    setRun(false);
  }

  return (
    <div className="container mr-20 ml-2 p-4">
      <h1 className="text-3xl font-bold mb-4">Tomasulo Algorithm Simulator</h1>

      <div className="mb-4">
        <textarea
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="w-full p-2 border rounded"
          rows="5"
          placeholder="Enter assembly program here..."
        ></textarea>
      </div>

      <div className="mb-4">
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full p-2 border rounded"
          rows="3"
          placeholder="Enter initial memory data here..."
        ></textarea>
      </div>

      <div className="mb-4">
        <button onClick={handleRun} className="bg-blue-500 text-white px-4 py-2 rounded">Run Simulation</button>
        <button onClick={handleStep} className="bg-green-500 text-white px-4 py-2 rounded ml-2">Step</button>
        <button onClick={handleReset} className="bg-yellow-500 text-white px-4 py-2 rounded ml-2">Reset</button>
      </div>

      <Tables
        registers={state.registers}
        memory={state.memory}
        reservationStations={state.reservationStations}
      />
      <div>
        <h2 className="text-2xl font-bold mb-2 mt-2">Metrics</h2>
        <pre className="p-2 border rounded bg-white">{JSON.stringify(metrics, null, 2)}</pre>
      </div>

      
    </div>
  );
}
