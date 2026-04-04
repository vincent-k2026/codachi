import { rgb } from './render/colors.js';
import { getSessionAnimalIndex, getSessionPaletteIndex } from './state.js';
const ANIMALS = ['cat', 'penguin', 'duck', 'octopus', 'bunny'];
export function getAnimalType() {
    return ANIMALS[getSessionAnimalIndex() % ANIMALS.length];
}
const PALETTES = [
    {
        body: rgb(255, 127, 80),
        accent: rgb(255, 99, 71),
        face: rgb(255, 200, 150),
        blush: rgb(255, 160, 122),
    },
    {
        body: rgb(80, 180, 255),
        accent: rgb(50, 140, 255),
        face: rgb(170, 220, 255),
        blush: rgb(130, 200, 255),
    },
    {
        body: rgb(50, 220, 160),
        accent: rgb(0, 200, 130),
        face: rgb(150, 255, 210),
        blush: rgb(255, 180, 150),
    },
    {
        body: rgb(180, 120, 255),
        accent: rgb(150, 80, 255),
        face: rgb(220, 190, 255),
        blush: rgb(255, 150, 200),
    },
    {
        body: rgb(255, 110, 170),
        accent: rgb(255, 70, 140),
        face: rgb(255, 200, 220),
        blush: rgb(255, 130, 160),
    },
    {
        body: rgb(255, 200, 50),
        accent: rgb(255, 170, 0),
        face: rgb(255, 235, 150),
        blush: rgb(255, 180, 100),
    },
    {
        body: rgb(160, 180, 255),
        accent: rgb(130, 150, 255),
        face: rgb(210, 220, 255),
        blush: rgb(200, 170, 255),
    },
    {
        body: rgb(255, 150, 180),
        accent: rgb(255, 110, 150),
        face: rgb(255, 210, 220),
        blush: rgb(255, 140, 170),
    },
    {
        body: rgb(0, 210, 210),
        accent: rgb(0, 185, 200),
        face: rgb(130, 240, 240),
        blush: rgb(255, 170, 140),
    },
    {
        body: rgb(255, 160, 60),
        accent: rgb(255, 130, 20),
        face: rgb(255, 210, 150),
        blush: rgb(255, 140, 100),
    },
];
export function getPetColors() {
    return PALETTES[getSessionPaletteIndex() % PALETTES.length];
}
