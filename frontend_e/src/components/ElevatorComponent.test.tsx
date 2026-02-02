import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ElevatorComponent from './ElevatorComponent';
import { Elevator } from '../types/Elevator';

const mockSelectFloor = jest.fn();

describe('ElevatorComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const idleElevator: Elevator = {
        id: 0,
        currentFloor: 0,
        direction: 'IDLE',
        status: 'IDLE',
        targetFloors: [],
    };

    const movingElevator: Elevator = {
        id: 1,
        currentFloor: 2,
        direction: 'UP',
        status: 'MOVING',
        targetFloors: [3, 5],
    };

    const doorsOpenElevator: Elevator = {
        id: 2,
        currentFloor: 1,
        direction: 'IDLE',
        status: 'DOORS_OPEN',
        targetFloors: [],
    };

    test('renders elevator ID', () => {
        render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('Elevator 1')).toBeInTheDocument();
    });

    test('renders current floor', () => {
        render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('Floor 0')).toBeInTheDocument();
    });

    test('displays Idle status when elevator is idle', () => {
        render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('Idle')).toBeInTheDocument();
    });

    test('displays Moving status when elevator is moving', () => {
        render(
            <ElevatorComponent
                elevator={movingElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('Moving')).toBeInTheDocument();
    });

    test('displays Doors Open status when doors are open', () => {
        render(
            <ElevatorComponent
                elevator={doorsOpenElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('Doors Open')).toBeInTheDocument();
    });

    test('displays target floors when elevator has destinations', () => {
        render(
            <ElevatorComponent
                elevator={movingElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('→3')).toBeInTheDocument();
        expect(screen.getByText('→5')).toBeInTheDocument();
    });

    test('shows direction indicator when moving up', () => {
        render(
            <ElevatorComponent
                elevator={movingElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('▲')).toBeInTheDocument();
    });

    test('shows direction indicator when moving down', () => {
        const movingDownElevator: Elevator = {
            ...movingElevator,
            direction: 'DOWN',
        };

        render(
            <ElevatorComponent
                elevator={movingDownElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        expect(screen.getByText('▼')).toBeInTheDocument();
    });

    test('opens floor selection panel when clicked', () => {
        render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={3}
                selectFloor={mockSelectFloor}
            />
        );

        const elevatorElement = screen.getByRole('button', { name: /Elevator 1/i });
        fireEvent.click(elevatorElement);

        expect(screen.getByText('Select Floor')).toBeInTheDocument();
    });

    test('calls selectFloor when a floor button is clicked in panel', () => {
        render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={3}
                selectFloor={mockSelectFloor}
            />
        );

        const elevatorElement = screen.getByRole('button', { name: /Elevator 1/i });
        fireEvent.click(elevatorElement);

        const floorButton = screen.getByRole('button', { name: 'Select floor 2' });
        fireEvent.click(floorButton);

        expect(mockSelectFloor).toHaveBeenCalledWith(0, 2);
    });

    test('closes panel after floor selection', () => {
        render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={3}
                selectFloor={mockSelectFloor}
            />
        );

        const elevatorElement = screen.getByRole('button', { name: /Elevator 1/i });
        fireEvent.click(elevatorElement);
        
        const floorButton = screen.getByRole('button', { name: 'Select floor 2' });
        fireEvent.click(floorButton);

        expect(screen.queryByText('Select Floor')).not.toBeInTheDocument();
    });

    test('disables current floor button in panel', () => {
        render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={3}
                selectFloor={mockSelectFloor}
            />
        );

        const elevatorElement = screen.getByRole('button', { name: /Elevator 1/i });
        fireEvent.click(elevatorElement);

        const currentFloorButton = screen.getByRole('button', { name: 'Select floor 0' });
        expect(currentFloorButton).toBeDisabled();
    });

    test('close button closes the panel', () => {
        render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={3}
                selectFloor={mockSelectFloor}
            />
        );

        const elevatorElement = screen.getByRole('button', { name: /Elevator 1/i });
        fireEvent.click(elevatorElement);
        
        expect(screen.getByText('Select Floor')).toBeInTheDocument();
        
        const closeButton = screen.getByLabelText('Close panel');
        fireEvent.click(closeButton);

        expect(screen.queryByText('Select Floor')).not.toBeInTheDocument();
    });

    test('applies moving class when elevator is moving', () => {
        const { container } = render(
            <ElevatorComponent
                elevator={movingElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        const elevatorDiv = container.querySelector('.elevator');
        expect(elevatorDiv).toHaveClass('moving');
    });

    test('applies doors-open class when doors are open', () => {
        const { container } = render(
            <ElevatorComponent
                elevator={doorsOpenElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        const elevatorDiv = container.querySelector('.elevator');
        expect(elevatorDiv).toHaveClass('doors-open');
    });

    test('sets correct top position based on current floor', () => {
        const { container } = render(
            <ElevatorComponent
                elevator={movingElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        // With 5 floors and elevator at floor 2:
        // floorHeightPercentage = 100 / 5 = 20
        // topPosition = (5 - 1 - 2) * 20 = 40%
        const elevatorDiv = container.querySelector('.elevator');
        expect(elevatorDiv).toHaveStyle({ top: '40%' });
    });

    test('sets correct height based on total floors', () => {
        const { container } = render(
            <ElevatorComponent
                elevator={idleElevator}
                totalFloors={5}
                selectFloor={mockSelectFloor}
            />
        );

        // With 5 floors: height should be 20%
        const elevatorDiv = container.querySelector('.elevator');
        expect(elevatorDiv).toHaveStyle({ height: '20%' });
    });
});
