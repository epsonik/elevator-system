package org.example.elevator.elevatorsystem.controller;


import org.example.elevator.elevatorsystem.dto.CallRequest;
import org.example.elevator.elevatorsystem.dto.SelectRequest;
import org.example.elevator.elevatorsystem.service.ElevatorSystemService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/elevators")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend requests
@AllArgsConstructor
public class ElevatorController {

    private final ElevatorSystemService elevatorService;

    /**
     * Endpoint for a user on a floor to call an elevator.
     * @param callRequest DTO with floor and direction.
     * @return Accepted response.
     */
    @PostMapping("/call")
    public ResponseEntity<Void> callElevator(@RequestBody CallRequest callRequest) {
        elevatorService.callElevator(callRequest.floor(), callRequest.direction());
        return ResponseEntity.accepted().build();
    }

    /**
     * Endpoint for a user inside an elevator to select a destination floor.
     * @param selectRequest DTO with elevatorId and target floor.
     * @return Accepted response.
     */
    @PostMapping("/select")
    public ResponseEntity<Void> selectFloor(@RequestBody SelectRequest selectRequest) {
        elevatorService.selectFloor(selectRequest.elevatorId(), selectRequest.floor());
        return ResponseEntity.accepted().build();
    }
}