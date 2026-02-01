package org.example.elevator.elevatorsystem.model;

import lombok.Data;

import java.util.NavigableSet;
import java.util.TreeSet;

/**
 * Represents an elevator in the simulation.
 * Lombok's @Data annotation generates getters, setters, toString, equals, and hashCode methods.
 */
@Data
public class Elevator {

    private final int id;
    private int currentFloor;
    private Direction direction = Direction.IDLE;
    private Status status = Status.IDLE;

    /**
     * A sorted set of floors the elevator is requested to visit.
     * Using NavigableSet (specifically TreeSet) to keep floors automatically sorted
     * and to allow for efficient searching (e.g., finding the next stop in a certain direction).
     */
    private final NavigableSet<Integer> targetFloors = new TreeSet<>();

    public Elevator(int id, int initialFloor) {
        this.id = id;
        this.currentFloor = initialFloor;
    }

    /**
     * Determines the next target floor based on the LOOK algorithm.
     *
     * @return The next floor to travel to, or null if no targets are available.
     */
    public Integer nextTarget() {
        if (targetFloors.isEmpty()) {
            return null;
        }

        switch (direction) {
            case UP:
                // Find the closest stop above the current floor.
                Integer nextUp = targetFloors.ceiling(currentFloor);
                if (nextUp != null) {
                    return nextUp;
                }
                // If no more stops above, return the highest stop to reverse direction.
                return targetFloors.last();
            case DOWN:
                // Find the closest stop below the current floor.
                Integer nextDown = targetFloors.floor(currentFloor);
                if (nextDown != null) {
                    return nextDown;
                }
                // If no more stops below, return the lowest stop to reverse direction.
                return targetFloors.first();
            case IDLE:
                // If idle, the next target is simply the closest one.
                // This can be adapted, but for now, let's default to the first in the set.
                return targetFloors.first();
            default:
                return null;
        }
    }
}