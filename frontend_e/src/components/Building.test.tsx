import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Building from './Building';
import { Elevator } from '../types/Elevator';

// Use elevators that are NOT at floor 0 for testing active button state
const mockElevatorsNotAtFloor0: Elevator[] = [
    { id: 0, currentFloor: 2, direction: 'IDLE', status: 'IDLE', targetFloors: [] },
    { id: 1, currentFloor: 1, direction: 'UP', status: 'MOVING', targetFloors: [2] },
];

const mockElevators: Elevator[] = [
    { id: 0, currentFloor: 0, direction: 'IDLE', status: 'IDLE', targetFloors: [] },
    { id: 1, currentFloor: 1, direction: 'UP', status: 'MOVING', targetFloors: [2] },
];

const mockCallElevator = jest.fn();
const mockSelectFloor = jest.fn();

describe('Building Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders floor labels for all floors', () => {
        render(
            <Building
                floors={3}
                elevators={mockElevators}
                callElevator={mockCallElevator}
                selectFloor={mockSelectFloor}
            />
        );

        const floorLabels = screen.getAllByText(/^Floor \d$/);
        expect(floorLabels.length).toBeGreaterThanOrEqual(3);
        
        // Check floor control labels specifically
        expect(screen.getAllByText('Floor 0').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Floor 1').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Floor 2').length).toBeGreaterThanOrEqual(1);
    });

    test('renders UP buttons for all floors except top floor', () => {
        render(
            <Building
                floors={3}
                elevators={mockElevators}
                callElevator={mockCallElevator}
                selectFloor={mockSelectFloor}
            />
        );

        const upButtons = screen.getAllByLabelText(/going up$/i);
        expect(upButtons).toHaveLength(2); // Floors 0 and 1
    });

    test('renders DOWN buttons for all floors except ground floor', () => {
        render(
            <Building
                floors={3}
                elevators={mockElevators}
                callElevator={mockCallElevator}
                selectFloor={mockSelectFloor}
            />
        );

        const downButtons = screen.getAllByLabelText(/going down$/i);
        expect(downButtons).toHaveLength(2); // Floors 1 and 2
    });

    test('calls callElevator with correct arguments when UP button is clicked', () => {
        render(
            <Building
                floors={3}
                elevators={mockElevators}
                callElevator={mockCallElevator}
                selectFloor={mockSelectFloor}
            />
        );

        const upButton = screen.getByLabelText('Call elevator to floor 0 going up');
        fireEvent.click(upButton);

        expect(mockCallElevator).toHaveBeenCalledWith(0, 'UP');
    });

    test('calls callElevator with correct arguments when DOWN button is clicked', () => {
        render(
            <Building
                floors={3}
                elevators={mockElevators}
                callElevator={mockCallElevator}
                selectFloor={mockSelectFloor}
            />
        );

        const downButton = screen.getByLabelText('Call elevator to floor 1 going down');
        fireEvent.click(downButton);

        expect(mockCallElevator).toHaveBeenCalledWith(1, 'DOWN');
    });

    test('renders elevator components for each elevator', () => {
        render(
            <Building
                floors={3}
                elevators={mockElevators}
                callElevator={mockCallElevator}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('Elevator 1')).toBeInTheDocument();
        expect(screen.getByText('Elevator 2')).toBeInTheDocument();
    });

    test('button becomes active when clicked', () => {
        render(
            <Building
                floors={3}
                elevators={mockElevatorsNotAtFloor0}
                callElevator={mockCallElevator}
                selectFloor={mockSelectFloor}
            />
        );

        const upButton = screen.getByLabelText('Call elevator to floor 0 going up');
        // Initially should not have active class
        expect(upButton.className).not.toContain('active');
        
        fireEvent.click(upButton);
        // After click, should have active class (no elevator is at floor 0)
        expect(upButton.className).toContain('active');
    });
});
