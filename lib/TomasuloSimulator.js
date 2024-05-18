// lib/TomasuloSimulator.js

class TomasuloSimulator {
    constructor() {
      this.reset();
    }
  
    reset() {
      this.registers = Array(8).fill(0);
      this.memory = Array(65536).fill(0); // 16-bit address space
      this.reservationStations = {
        'LOAD': [],
        'STORE': [],
        'BEQ': [],
        'CALL': [],
        'RET': [],
        'ADD': [],
        'ADDI': [],
        'NAND': [],
        'MUL': [],
      };
      this.clock = 0;
      this.instructions = [];
      this.metrics = {
        totalExecutionTime: 0,
        ipc: 0,
        branchMispredictionPercentage: 0,
        instructionsCompleted: 0,
        branchInstructions: 0,
        branchMispredictions: 0,
      };
      this.currentInstructionIndex = 0;
      console.log("reset",this.reservationStations['ADD']);
    }
  
    loadProgram(program) {
      this.instructions = program;
      this.currentInstructionIndex = 0;
      console.log("loadpr",this.reservationStations['ADD']);
    }
  
    loadData(data) {
      data.forEach(({ address, value }) => {
        this.memory[address] = value;
      });
      console.log("loaddt",this.reservationStations['ADD']);
    }

    updateState() {
      // Update Reservation Stations
      Object.keys(this.reservationStations).forEach(type => {
          this.reservationStations[type].forEach(station => {
              if (station.executeEndTime === this.clock) {
                  station.writeTime = this.clock + 1;
              }
          });
      });
  
      // Write Results
      Object.keys(this.reservationStations).forEach(type => {
          this.reservationStations[type] = this.reservationStations[type].filter(station => {
              if (station.writeTime === this.clock) {
                  this.writeBack(station.instruction);
                  this.metrics.instructionsCompleted++;
                  return false;
              }
              return true;
          });
      });
  
      // Update Memory and Registers
      this.instructions.forEach((instruction, index) => {
          const type = instruction.split(' ')[0].toUpperCase();
          if (type === 'LOAD' || type === 'STORE') {
              const parts = instruction.split(' ');
              const memoryAddress = this.calculateMemoryAddress(parts[2]);
              if (type === 'LOAD') {
                  // Load operation: Update registers with data from memory
                  this.registers[parseInt(parts[1].slice(1))] = this.memory[memoryAddress];
              } else {
                  // Store operation: Update memory with data from registers
                  this.memory[memoryAddress] = this.registers[parseInt(parts[1].slice(1))];
              }
          }
      });
  
      // Update Reservation Stations again after memory and register updates
      Object.keys(this.reservationStations).forEach(type => {
          this.reservationStations[type] = this.reservationStations[type].map(station => {
              if (station.writeTime === this.clock) {
                  // Remove completed instructions from reservation stations
                  return null;
              }
              return station;
          }).filter(station => station !== null);
      });
  }  
  
    issueInstruction() {
      if (this.currentInstructionIndex < this.instructions.length) {
        const instruction = this.instructions[this.currentInstructionIndex];
        const type = instruction.split(' ')[0].toUpperCase();
        
        if (!(type in this.reservationStations)) {
          throw new Error(`Unsupported instruction type: ${type}`);
        }
        if (this.reservationStations[type].length < this.getReservationStationLimit(type)) {
          
          this.reservationStations[type].push({
            instruction,
            issueTime: this.clock,
            executeStartTime: null,
            executeEndTime: null,
            writeTime: null,
          });
          this.currentInstructionIndex++;
          
        }
      }
      console.log("issue",this.reservationStations['ADD']);
    }
  
    executeInstructions() {
      Object.keys(this.reservationStations).forEach(type => {
        this.reservationStations[type].forEach(station => {
          if (station.executeStartTime === null && station.issueTime < this.clock) {
            station.executeStartTime = this.clock;
            station.executeEndTime = this.clock + this.getExecutionTime(type);
          }
          if (station.executeEndTime === this.clock) {
            station.writeTime = this.clock + 1;
          }
        });
      });
      console.log("exec",this.reservationStations['ADD']);
    }
  
    writeResults() {
      Object.keys(this.reservationStations).forEach(type => {
        let tmp = this.reservationStations[type];
        tmp = tmp.filter(station => {
          if (station.writeTime === this.clock) {
            this.writeBack(station.instruction);
            this.metrics.instructionsCompleted++;
            return false;
          }
        
          return true;
        });
      });
      console.log("write",this.reservationStations['ADD']);
    }
  
    writeBack(instruction) {
      const parts = instruction.split(' ');
      const type = parts[0].toUpperCase();
      switch (type) {
        case 'LOAD':
          this.registers[parseInt(parts[1].slice(1))] = this.memory[this.calculateMemoryAddress(parts[2])];
          break;
        case 'STORE':
          this.memory[this.calculateMemoryAddress(parts[2])] = this.registers[parseInt(parts[1].slice(1))];
          break;
        case 'ADD':
          this.registers[parseInt(parts[1].slice(1))] = this.registers[parseInt(parts[2].slice(1))] + this.registers[parseInt(parts[3].slice(1))];
          break;
        case 'ADDI':
          this.registers[parseInt(parts[1].slice(1))] = this.registers[parseInt(parts[2].slice(1))] + parseInt(parts[3]);
          break;
        case 'NAND':
          this.registers[parseInt(parts[1].slice(1))] = ~(this.registers[parseInt(parts[2].slice(1))] & this.registers[parseInt(parts[3].slice(1))]);
          break;
        case 'MUL':
          this.registers[parseInt(parts[1].slice(1))] = this.registers[parseInt(parts[2].slice(1))] * this.registers[parseInt(parts[3].slice(1))];
          break;
        case 'BEQ':
          if (this.registers[parseInt(parts[1].slice(1))] === this.registers[parseInt(parts[2].slice(1))]) {
            this.currentInstructionIndex += parseInt(parts[3]);
            this.metrics.branchInstructions++;
          } else {
            this.metrics.branchMispredictions++;
          }
          break;
        case 'CALL':
          this.registers[1] = this.currentInstructionIndex;
          this.currentInstructionIndex += parseInt(parts[1]);
          break;
        case 'RET':
          this.currentInstructionIndex = this.registers[1];
          break;
        default:
          throw new Error(`Unsupported instruction type: ${type}`);
      }
    }
  
    calculateMemoryAddress(offsetRegister) {
      const [offset, register] = offsetRegister.slice(0, -1).split('(');
      return this.registers[parseInt(register.slice(1))] + parseInt(offset);
    }
  
    getReservationStationLimit(type) {
      switch (type) {
        case 'LOAD':
        case 'STORE':
          return 2;
        case 'BEQ':
        case 'CALL':
        case 'RET':
          return 1;
        case 'ADD':
        case 'ADDI':
          return 4;
        case 'NAND':
          return 2;
        case 'MUL':
          return 1;
        default:
          return 0;
      }
    }
  
    getExecutionTime(type) {
      switch (type) {
        case 'LOAD':
        case 'STORE':
          return 6;
        case 'BEQ':
        case 'CALL':
        case 'RET':
          return 1;
        case 'ADD':
        case 'ADDI':
          return 2;
        case 'NAND':
          return 1;
        case 'MUL':
          return 8;
        default:
          return 0;
      }
    }
  
    step() {
      this.issueInstruction();
      
      this.executeInstructions();
      
      this.writeResults();
      
      this.updateMetrics();
      this.updateState();
      this.clock++;
      
      
    }
    hasNullElement(obj) {
      // Iterate over the keys of the object
      for (let key in obj) {
        // Ensure that the property belongs to the object itself and not its prototype
        if (obj.hasOwnProperty(key)) {
          // Get the array associated with the current key
          let array = obj[key];
          // Check if any element in the array is null
          if (array.some(element => element === null)) {
            return true; // Return true if a null element is found
          }
        }
      }
      return false; // Return false if no null elements are found in any array
    }
  
    run() {
      const maxCycles = 1000; // safeguard to prevent infinite loops
      let cycles = 0;
    
      while (
        (this.currentInstructionIndex < this.instructions.length || 
         Object.values(this.reservationStations).some(stations => stations.length > 0)) &&
        cycles < maxCycles
      ) {
        this.step();
        cycles++;
      }
    
      if (cycles >= maxCycles) {
        console.error("Simulation terminated due to reaching the maximum cycle limit");
      }
    
      this.updateMetrics();
    }
    
  
    updateMetrics() {
      this.metrics.totalExecutionTime = this.clock;
      this.metrics.ipc = this.metrics.instructionsCompleted / this.clock;
      this.metrics.branchMispredictionPercentage = this.metrics.branchInstructions ? (this.metrics.branchMispredictions / this.metrics.branchInstructions) * 100 : 0;
    }
  
    getMetrics() {
      return this.metrics;
    }
  
    getRegisters() {
      return this.registers;
    }
  
    getMemory() {
      return this.memory.slice(0, 16); // Return first 16 memory locations for display
    }
  
    getReservationStations() {
      console.log("getrs",this.reservationStations['ADD']);
      return  {
        'LOAD': this.reservationStations['LOAD'],
        'STORE': this.reservationStations['STORE'],
        'BEQ': this.reservationStations['BEQ'],
        'CALL': this.reservationStations['CALL'],
        'RET': this.reservationStations['RET'],
        'ADD': this.reservationStations['ADD'],
        'ADDI': this.reservationStations['ADDI'],
        'NAND': this.reservationStations['NAND'],
        'MUL': this.reservationStations['MUL'],
      };
    }

    
  }
  
  export default TomasuloSimulator;
  