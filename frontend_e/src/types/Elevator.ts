export type Direction = "UP" | "DOWN" | "IDLE";
export type Status = "MOVING" | "IDLE" | "DOORS_OPEN";

export interface Elevator {
    id: number;
    currentFloor: number;
    direction: Direction;
    status: Status;
    targetFloors: number[]; // The NavigableSet from Java is serialized as an array
}