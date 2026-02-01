import React from 'react';
import './App.css';
import { useElevatorSystem } from './hooks/useElevatorSystem';
import Building from './components/Building';

// Define constants for the building setup
const NUM_FLOORS = 3;
const NUM_ELEVATORS = 3;

function App() {
    const { elevators, isConnected, callElevator, selectFloor } = useElevatorSystem();

    return (
        <div className="App">
            <header className="App-header">
                <h1>Elevator System Simulation</h1>
                <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '● Connected' : '○ Disconnected'}
                </div>
            </header>
            <main>
                <Building
                    floors={NUM_FLOORS}
                    // The initial elevators array might be empty, so we create placeholders
                    elevators={elevators.length > 0 ? elevators : Array.from({length: NUM_ELEVATORS}, (_, i) => ({ id: i, currentFloor: 0, direction: 'IDLE', status: 'IDLE', targetFloors: [] }))}
                    callElevator={callElevator}
                    selectFloor={selectFloor}
                />
            </main>
        </div>
    );
}

export default App;