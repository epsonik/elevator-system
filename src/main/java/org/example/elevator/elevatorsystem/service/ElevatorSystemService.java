package org.example.elevator.elevatorsystem.service;


import org.example.elevator.elevatorsystem.model.Direction;
import org.example.elevator.elevatorsystem.model.Elevator;
import org.example.elevator.elevatorsystem.model.Status;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Service
public class ElevatorSystemService {

    private static final int NUM_ELEVATORS = 3;
    private static final int NUM_FLOORS = 10;
    private static final int DIRECTION_CHANGE_PENALTY = 100; // Penalty for wrong direction

    @Getter
    private final List<Elevator> elevators = new ArrayList<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final ReentrantLock serviceLock = new ReentrantLock();


    public ElevatorSystemService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    private void init() {
        for (int i = 0; i < NUM_ELEVATORS; i++) {
            elevators.add(new Elevator(i, 0)); // Start all elevators at floor 0
        }
    }

    /**
     * Handles a call for an elevator from a specific floor.
     * Finds the most suitable elevator and assigns the task.
     */
    public void callElevator(int floor, Direction direction) {
        serviceLock.lock();
        try {
            Elevator bestElevator = findBestElevator(floor, direction);
            log.info("Best elevator {} chosen for floor {} and direction {}", bestElevator.getId(), floor, direction);
            bestElevator.getTargetFloors().add(floor);
        } finally {
            serviceLock.unlock();
        }
    }

    /**
     * Handles a floor selection from within an elevator.
     */
    public void selectFloor(int elevatorId, int floor) {
        serviceLock.lock();
        try {
            if (elevatorId < 0 || elevatorId >= elevators.size()) {
                log.warn("Invalid elevator ID: {}", elevatorId);
                return;
            }
            Elevator elevator = elevators.get(elevatorId);
            elevator.getTargetFloors().add(floor);
            log.info("Elevator {} was instructed to go to floor {}", elevatorId, floor);
        } finally {
            serviceLock.unlock();
        }
    }

    private Elevator findBestElevator(int floor, Direction direction) {
        return elevators.stream()
                .min((e1, e2) -> Integer.compare(calculateCost(e1, floor, direction), calculateCost(e2, floor, direction)))
                .orElseThrow(() -> new IllegalStateException("No elevators available"));
    }

    private int calculateCost(Elevator elevator, int floor, Direction requiredDirection) {
        // 1. Distance cost
        int distance = Math.abs(elevator.getCurrentFloor() - floor);

        // 2. Direction penalty
        int penalty = 0;
        if (elevator.getDirection() != Direction.IDLE && elevator.getDirection() != requiredDirection) {
            // If the elevator is moving up but the call is for down (or vice-versa)
            penalty += DIRECTION_CHANGE_PENALTY;

            // Add further penalty if the elevator is moving away from the floor
            if (elevator.getDirection() == Direction.UP && elevator.getCurrentFloor() > floor) {
                penalty += 50; // Moving up, away from a lower floor
            } else if (elevator.getDirection() == Direction.DOWN && elevator.getCurrentFloor() < floor) {
                penalty += 50; // Moving down, away from a higher floor
            }
        }
        return distance + penalty;
    }

    @Scheduled(fixedRate = 1000)
    public void simulateStep() {
        serviceLock.lock();
        try {
            for (Elevator elevator : elevators) {
                switch (elevator.getStatus()) {
                    case IDLE:
                        // If idle, check for targets and start moving
                        if (!elevator.getTargetFloors().isEmpty()) {
                            updateElevatorDirection(elevator);
                            if (elevator.getDirection() != Direction.IDLE) {
                                elevator.setStatus(Status.MOVING);
                            }
                        }
                        break;
                    case MOVING:
                        // If we are at a target floor, stop and open doors
                        if (elevator.getTargetFloors().contains(elevator.getCurrentFloor())) {
                            elevator.setStatus(Status.DOORS_OPEN);
                            elevator.getTargetFloors().remove(elevator.getCurrentFloor());
                            log.info("Elevator {} stopped at target floor {}", elevator.getId(), elevator.getCurrentFloor());
                        } else {
                            // Otherwise, keep moving
                            moveElevator(elevator);
                        }
                        break;
                    case DOORS_OPEN:
                        // After "opening doors" (a 1-second pause), decide what to do next
                        log.info("Elevator {} doors are open. Deciding next move.", elevator.getId());
                        if (elevator.getTargetFloors().isEmpty()) {
                            elevator.setStatus(Status.IDLE);
                            elevator.setDirection(Direction.IDLE);
                        } else {
                            updateElevatorDirection(elevator);
                            elevator.setStatus(Status.MOVING);
                            moveElevator(elevator); // Start moving immediately in the next step
                        }
                        break;
                }
            }
            broadcastState();
        } finally {
            serviceLock.unlock();
        }
    }

    private void moveElevator(Elevator elevator) {
        if (elevator.getDirection() == Direction.UP) {
            if (elevator.getCurrentFloor() < NUM_FLOORS - 1) {
                elevator.setCurrentFloor(elevator.getCurrentFloor() + 1);
            }
        } else if (elevator.getDirection() == Direction.DOWN) {
            if (elevator.getCurrentFloor() > 0) {
                elevator.setCurrentFloor(elevator.getCurrentFloor() - 1);
            }
        }
    }

    private void updateElevatorDirection(Elevator elevator) {
        Integer nextTarget = elevator.nextTarget();
        if (nextTarget == null) {
            elevator.setDirection(Direction.IDLE);
            return;
        }

        if (nextTarget > elevator.getCurrentFloor()) {
            elevator.setDirection(Direction.UP);
        } else if (nextTarget < elevator.getCurrentFloor()) {
            elevator.setDirection(Direction.DOWN);
        }
        // If nextTarget is the current floor, the direction will be handled by the state machine
        // (it will transition to DOORS_OPEN and then re-evaluate).
    }

    private void broadcastState() {
        log.debug("Broadcasting elevator states: {}", elevators);
        messagingTemplate.convertAndSend("/topic/elevators", Collections.unmodifiableList(elevators));
    }
}