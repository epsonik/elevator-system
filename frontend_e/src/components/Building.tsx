import React, { useState } from 'react';
import { Direction, Elevator } from '../types/Elevator';
import ElevatorComponent from './ElevatorComponent';
import './Building.css';

interface BuildingProps {
    floors: number;
    elevators: Elevator[];
    callElevator: (floor: number, direction: Direction) => void;
    selectFloor: (elevatorId: number, floor: number) => void;
}

const Building: React.FC<BuildingProps> = ({ floors, elevators, callElevator, selectFloor }) => {
    const floorNumbers = Array.from({ length: floors }, (_, i) => floors - 1 - i);
    const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set());

    const handleCallElevator = (floor: number, direction: Direction) => {
        const buttonKey = `${floor}-${direction}`;
        setClickedButtons(prev => new Set(prev).add(buttonKey));
        callElevator(floor, direction);
        
        // Remove the clicked state after 2 seconds to allow re-clicking
        setTimeout(() => {
            setClickedButtons(prev => {
                const newSet = new Set(prev);
                newSet.delete(buttonKey);
                return newSet;
            });
        }, 2000);
    };

    return (
        <div className="building-container">
            <div
                className="building-grid"
                style={{
                    gridTemplateColumns: `120px repeat(${elevators.length}, 1fr)`,
                    gridTemplateRows: `repeat(${floors}, minmax(120px, 1fr))`
                }}
            >
                {/* Render Floors and Buttons */}
                {floorNumbers.map(floorNum => (
                    <React.Fragment key={`floor-controls-${floorNum}`}>
                        <div className="floor-controls">
                            <span className="floor-label">Floor {floorNum}</span>
                            <div className="call-buttons">
                                {floorNum < floors - 1 && (
                                    <button 
                                        className={`call-btn up ${clickedButtons.has(`${floorNum}-UP`) ? 'active' : ''}`}
                                        onClick={() => handleCallElevator(floorNum, "UP")}
                                        aria-label={`Call elevator to floor ${floorNum} going up`}
                                    >
                                        ▲
                                    </button>
                                )}
                                {floorNum > 0 && (
                                    <button 
                                        className={`call-btn down ${clickedButtons.has(`${floorNum}-DOWN`) ? 'active' : ''}`}
                                        onClick={() => handleCallElevator(floorNum, "DOWN")}
                                        aria-label={`Call elevator to floor ${floorNum} going down`}
                                    >
                                        ▼
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Render floor lines in each shaft for aesthetics */
                            elevators.map(elevator => (
                                <div key={`floor-line-${floorNum}-${elevator.id}`} className="floor-line"></div>
                            ))}
                    </React.Fragment>
                ))}


                {/* Render Shafts and Elevators */}
                {elevators.map((elevator, index) => (
                    <div
                        key={`shaft-${elevator.id}`}
                        className="elevator-shaft" // Elevator shaft
                        style={{ gridColumn: index + 2, gridRow: `1 / span ${floors}` }}
                    >
                        {/* Elevator component is now inside the shaft */}
                        <ElevatorComponent
                            elevator={elevator}
                            totalFloors={floors}
                            selectFloor={selectFloor}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Building;