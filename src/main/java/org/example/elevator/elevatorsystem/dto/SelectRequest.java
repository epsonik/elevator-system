package org.example.elevator.elevatorsystem.dto;


/**
 * DTO for an internal elevator floor selection.
 */
public record SelectRequest(int elevatorId, int floor) {
}