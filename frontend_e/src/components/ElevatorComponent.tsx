import React, { useState } from 'react';
import { Elevator } from '../types/Elevator';

interface ElevatorProps {
    elevator: Elevator;
    totalFloors: number;
    selectFloor: (elevatorId: number, floor: number) => void;
}

const ElevatorComponent: React.FC<ElevatorProps> = ({ elevator, totalFloors, selectFloor }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    
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

    const togglePanel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPanelOpen(!isPanelOpen);
    };

    const handleFloorSelect = (floorNum: number) => {
        selectFloor(elevator.id, floorNum);
        setIsPanelOpen(false);
    };

    return (
        <div
            className={`elevator ${isMoving ? 'moving' : ''} ${doorsOpen ? 'doors-open' : ''}`}
            style={{
                top: `${topPosition}%`,
                height: `${floorHeightPercentage}%`,
                // Assign a different color per elevator for clarity
                filter: `hue-rotate(${elevator.id * 60}deg)`
            }}
            onClick={togglePanel}
            role="button"
            aria-label={`Elevator ${elevator.id + 1}, currently at floor ${elevator.currentFloor}, ${getStatusText()}`}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePanel(e as any);
                }
            }}
        >
            {isMoving && getDirectionSymbol() && (
                <div className="elevator-direction-indicator" aria-hidden="true">{getDirectionSymbol()}</div>
            )}
            <div className="elevator-info">
                <span className="elevator-id">Elevator {elevator.id + 1}</span>
                <span className="elevator-floor">Floor {elevator.currentFloor}</span>
                <span className="elevator-status">{getStatusText()}</span>
                {elevator.targetFloors.length > 0 && (
                    <div className="target-floors" aria-label="Target floors">
                        {elevator.targetFloors.map(floor => (
                            <span key={floor} className="target-floor-badge">→{floor}</span>
                        ))}
                    </div>
                )}
            </div>
            {isPanelOpen && (
                <div className="elevator-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="panel-header">
                        <div className="panel-title">Select Floor</div>
                        <button 
                            className="panel-close"
                            onClick={() => setIsPanelOpen(false)}
                            aria-label="Close panel"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="panel-buttons">
                        {Array.from({ length: totalFloors }, (_, i) => i).map(floorNum => (
                            <button
                                key={floorNum}
                                className={`panel-button ${elevator.targetFloors.includes(floorNum) ? 'selected' : ''}`}
                                onClick={() => handleFloorSelect(floorNum)}
                                disabled={elevator.currentFloor === floorNum}
                                aria-label={`Select floor ${floorNum}`}
                                aria-pressed={elevator.targetFloors.includes(floorNum)}
                            >
                                {floorNum}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ElevatorComponent;