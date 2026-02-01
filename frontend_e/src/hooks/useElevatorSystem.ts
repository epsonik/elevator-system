import { useState, useEffect } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Elevator, Direction } from '../types/Elevator';

const API_BASE_URL = 'http://localhost:8080/api/elevators';
const WEBSOCKET_URL = 'http://localhost:8080/ws';

/**
 * Custom hook to manage the state and communication for the elevator system.
 *
 * @returns An object containing the current state of all elevators,
 *          and functions to interact with the system.
 */
export const useElevatorSystem = () => {
    const [elevators, setElevators] = useState<Elevator[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Use a ref to hold the STOMP client so it persists across renders
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            debug: (str) => {
                console.log(new Date(), str);
            },
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                console.log('Connected to WebSocket');

                // Subscribe to the topic that broadcasts elevator states
                stompClient.subscribe('/topic/elevators', (message) => {
                    const updatedElevators = JSON.parse(message.body) as Elevator[];
                    setElevators(updatedElevators);
                });
            },
            onDisconnect: () => {
                setIsConnected(false);
                console.log('Disconnected from WebSocket');
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        // Initiate the connection
        stompClient.activate();

        // Cleanup function to deactivate the client on component unmount
        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    /**
     * Makes a REST API call to request an elevator from a specific floor.
     * @param floor The floor number where the call is made.
     * @param direction The desired direction of travel.
     */
    const callElevator = async (floor: number, direction: Direction) => {
        try {
            await axios.post(`${API_BASE_URL}/call`, { floor, direction });
        } catch (error) {
            console.error('Failed to call elevator:', error);
        }
    };

    /**
     * Makes a REST API call to select a destination floor from within an elevator.
     * @param elevatorId The ID of the elevator.
     * @param floor The selected destination floor.
     */
    const selectFloor = async (elevatorId: number, floor: number) => {
        try {
            await axios.post(`${API_BASE_URL}/select`, { elevatorId, floor });
        } catch (error) {
            console.error('Failed to select floor:', error);
        }
    };

    return { elevators, isConnected, callElevator, selectFloor };
};