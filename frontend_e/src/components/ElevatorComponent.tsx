import React from 'react';
import { Elevator } from '../types/Elevator';

interface ElevatorProps {
    elevator: Elevator;
    totalFloors: number;
    selectFloor: (elevatorId: number, floor: number) => void;
}

const ElevatorComponent: React.FC<ElevatorProps> = ({ elevator, totalFloors, selectFloor }) => {
    // Calculate the position based on the current floor.
    // The top position is a percentage of the container height.
    // e.g., for 10 floors, floor 9 is at top 0%, floor 0 is at top 90%.
    const floorHeightPercentage = 100 / totalFloors;
    const topPosition = (totalFloors - 1 - elevator.currentFloor) * floorHeightPercentage;

    const isMoving = elevator.status === 'MOVING';
    const doorsOpen = elevator.status === 'DOORS_OPEN';

    const getDirectionSymbol = () => {
        if (elevator.direction === 'UP') return '▲';
        if (elevator.direction === 'DOWN') return '▼';
        return '';
    };

    const getStatusText = () => {
        if (doorsOpen) return 'Doors Open';
        if (isMoving) return 'Moving';
        return 'Idle';
    };

    return (
        <div
            className={`elevator ${isMoving ? 'moving' : ''} ${doorsOpen ? 'doors-open' : ''}`}
            style={{
                top: `${topPosition}%`,
                // Assign a different color per elevator for clarity
                filter: `hue-rotate(${elevator.id * 60}deg)`
            }}
        >
            {isMoving && getDirectionSymbol() && (
                <div className="elevator-direction-indicator">{getDirectionSymbol()}</div>
            )}
            <div className="elevator-info">
                <span className="elevator-id">Elevator {elevator.id + 1}</span>
                <span className="elevator-floor">Floor {elevator.currentFloor}</span>
                <span className="elevator-status">{getStatusText()}</span>
                {elevator.targetFloors.length > 0 && (
                    <div className="target-floors">
                        {elevator.targetFloors.map(floor => (
                            <span key={floor} className="target-floor-badge">→{floor}</span>
                        ))}
                    </div>
                )}
            </div>
            <div className="elevator-panel">
                <div className="panel-title">Select Floor</div>
                <div className="panel-buttons">
                    {Array.from({ length: totalFloors }, (_, i) => i).map(floorNum => (
                        <button
                            key={floorNum}
                            className={`panel-button ${elevator.targetFloors.includes(floorNum) ? 'selected' : ''}`}
                            onClick={() => selectFloor(elevator.id, floorNum)}
                            disabled={elevator.currentFloor === floorNum}
                        >
                            {floorNum}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ElevatorComponent;