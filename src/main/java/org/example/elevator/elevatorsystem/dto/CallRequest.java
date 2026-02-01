package org.example.elevator.elevatorsystem.dto;


import org.example.elevator.elevatorsystem.model.Direction;

/**
 * DTO for an external elevator call from a specific floor.
 */
public record CallRequest(int floor, Direction direction) {
}