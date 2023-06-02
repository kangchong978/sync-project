import React, { useEffect, useRef, useState } from 'react';
import pig_png from "./images/pig.png";
import monkey_png from "./images/monkey.png";
import lion_png from "./images/lion.png";
import robot_png from "./images/robot.png";
import angel_png from "./images/angel.png";
import dinosaur_png from "./images/dinosaur.png";
import magician_png from "./images/magician.png";
import sailor_png from "./images/sailor.png";
import apache_png from "./images/apache.png";
import doctor_png from "./images/doctor.png";
import scientist_png from "./images/scientist.png";
import artist_png from "./images/artist.png";
import dog_png from "./images/dog.png";
import mummy_png from "./images/mummy.png";
import shark_png from "./images/shark.png";
import astronaut_png from "./images/astronaut.png";
import fairy_png from "./images/fairy.png";
import ninja_png from "./images/ninja.png";
import superhero_png from "./images/superhero.png";
import bear_png from "./images/bear.png";
import farmer_png from "./images/farmer.png";
import officer_png from "./images/officer.png";
import unicorn_png from "./images/unicorn.png";
import bee_png from "./images/bee.png";
import firefighter_png from "./images/firefighter.png";
import pharaoh_png from "./images/pharaoh.png";
import vampire_png from "./images/vampire.png";
import butterfly_png from "./images/butterfly.png";
import flower_png from "./images/flower.png";
import viking_png from "./images/viking.png";
import cat_png from "./images/cat.png";
import frog_png from "./images/frog.png";
import pilot_png from "./images/pilot.png";
import wizard_png from "./images/wizard.png";
import chicken_png from "./images/chicken.png";
import ghost_png from "./images/ghost.png";
import pirate_png from "./images/pirate.png";
import worker_png from "./images/worker.png";
import clown_png from "./images/clown.png";
import giraffe_png from "./images/giraffe.png";
import princess_png from "./images/princess.png";
import zebra_png from "./images/zebra.png";
import cowboy_png from "./images/cowboy.png";
import hawaiian_png from "./images/hawaiian.png";
import pumpkin_png from "./images/pumpkin.png";
import dentist_png from "./images/dentist.png";
import knight_png from "./images/knight.png";
import rabbit_png from "./images/rabbit.png";

const imagePaths = [
    pig_png,
    monkey_png,
    lion_png,
    robot_png,
    angel_png,
    dinosaur_png,
    magician_png,
    sailor_png,
    apache_png,
    doctor_png,
    scientist_png,
    artist_png,
    dog_png,
    mummy_png,
    shark_png,
    astronaut_png,
    fairy_png,
    ninja_png,
    superhero_png,
    bear_png,
    farmer_png,
    officer_png,
    unicorn_png,
    bee_png,
    firefighter_png,
    pharaoh_png,
    vampire_png,
    butterfly_png,
    flower_png,
    viking_png,
    cat_png,
    frog_png,
    pilot_png,
    wizard_png,
    chicken_png,
    ghost_png,
    pirate_png,
    worker_png,
    clown_png,
    giraffe_png,
    princess_png,
    zebra_png,
    cowboy_png,
    hawaiian_png,
    pumpkin_png,
    dentist_png,
    knight_png,
    rabbit_png
];


const initWebSocket = (whenIncommingReceived: Function) => {
    let currentTime = '';
    let clientId = '';
    let clientAvatarPath = '';
    let ws: WebSocket;

    const setCurrentTime = (newMessage: string) => {
        currentTime = newMessage;
    };

    const setClientId = (newClientId: string) => {
        clientId = newClientId;
    };

    const setClientAvatarPath = (newClientAvatarPath: string) => {
        clientAvatarPath = newClientAvatarPath;
    };

    const getClientId = () => {
        return clientId;
    };

    const generateClientId = () => {
        const randomId = Math.random().toString(36).substr(2, 10);
        return randomId;
    };

    const generateClientAvatar = () => {
        const randomIndex = Math.floor(Math.random() * imagePaths.length);
        return imagePaths[randomIndex].src;
    };

    const handleIncomingMessage = (event: MessageEvent<any>) => {
        const receivedMessage = event.data;
        whenIncommingReceived(receivedMessage);
    };

    const handleConnectionOpen = () => {
        console.log('WebSocket connection opened');
    };

    const handleConnectionClose = () => {
        console.log('WebSocket connection closed');
    };

    const sendCurrentTime = () => {
        if (ws && currentTime) {
            const messageObject = {
                clientId: clientId,
                clientAvatar: clientAvatarPath,
                currentTime: currentTime,
            };

            ws.send(JSON.stringify(messageObject));

            currentTime = '';
        }
    };
    const sendMessage = (message: string) => {
        if (ws && message) {
            let messageObject: { [key: string]: string } = Object.fromEntries([
                ['clientId', clientId],
                ['clientAvatar', clientAvatarPath],
                ['message', message],
            ]);
            if (message.startsWith("action`setVideoUrl*")) {
                const parts = message.split("`")[1].split("*");
                if (parts.length === 2) {
                    messageObject.action = parts[0];
                    messageObject.videoUrl = parts[1];
                }
            }
            const messageJson = JSON.stringify(messageObject);
            ws.send(messageJson);
            // console.log(messageJson);
        }
    };

    const connectWebSocket = () => {
        const generatedClientId = generateClientId();
        const generatedClientAvatar = generateClientAvatar();

        setClientId(generatedClientId);
        setClientAvatarPath(generatedClientAvatar);

        ws = new WebSocket('wss://localhost:3002');

        ws.onmessage = handleIncomingMessage;
        ws.onopen = handleConnectionOpen;
        ws.onclose = handleConnectionClose;
    };

    const closeWebSocket = () => {
        if (ws) {
            ws.close();
        }
    };

    return {
        currentTime,
        setCurrentTime,
        sendCurrentTime,
        connectWebSocket,
        closeWebSocket,
        getClientId, sendMessage
    };
};

export default initWebSocket;
