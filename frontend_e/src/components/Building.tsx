import React from 'react';
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

    return (
        <div className="building-container">
            <div
                className="building-grid"
                style={{
                    gridTemplateColumns: `100px repeat(${elevators.length}, 1fr)`,
                    gridTemplateRows: `repeat(${floors}, 1fr)`
                }}
            >
                {/* Render Floors and Buttons */}
                {floorNumbers.map(floorNum => (
                    <React.Fragment key={`floor-controls-${floorNum}`}>
                        <div className="floor-controls">
                            <span className="floor-label">Floor {floorNum}</span>
                            <div className="call-buttons">
                                {floorNum < floors - 1 && (
                                    <button className="call-btn up" onClick={() => callElevator(floorNum, "UP")}>
                                        ▲
                                    </button>
                                )}
                                {floorNum > 0 && (
                                    <button className="call-btn down" onClick={() => callElevator(floorNum, "DOWN")}>
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