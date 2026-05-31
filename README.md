<h1 align="center"><a href="https://12jeef.github.io/">12Jeef.github.io</a></h1>

Heyo! This is the repo for my website, containing anything and all the files that I'm hosting statically online.
Here's a comprehensive index of what's on it and how to run each part:

# Active Development

## Website V3

Root: `./v3/`

This is a NodeJS + Typescript + Vite + React + Tailwind web app with Framer Motion for animations. This is the current iteration of my website.

To run locally:

1. [Install NodeJS and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
2. Run `npm i` at the root of this project.
3. Run `npm run dev` at the root of this project.
4. Navigate to the printed address.

To build:

1. Follow run steps up to step 2.
2. Run `npm run build` at the root of this project.
3. Commit all changes and wait for Github hosting to deploy via the web UI.

## Virtual Art Gallery V2

Root: `./gallery/v2/`

This is a NodeJS + Typescript + Vite + React + Tailwind web app with Framer Motion for animations and R3F for 3D. Features non-Euclidian geometries and looping, art inspection, etc. This is the current iteration of my art gallery.

To run locally:

1. [Install NodeJS and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
2. Run `npm i` at the root of this project.
3. Run `npm run dev` at the root of this project.
4. Navigate to the printed address.

To build:

1. Follow run steps up to step 2.
2. Run `npm run build` at the root of this project.
3. Commit all changes and wait for Github hosting to deploy via the web UI.

# Deprecated

## Website V2

Root: `./v2/`

This is a bare-bones NodeJS + Typescript + Rollup and raw HTML/CSS web app, with custom TS animations. Due to implementation limitations and how slow it was to develop for this, it was discontinued.

To run locally:

1. [Install NodeJS and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
2. Run `npm i` at the root of this project.
3. Run `npm run run` at the root of this project. This compiles TS→JS and locally hosts the built files.
4. Navigate to the printed address.

## Website V1

Root: `./v1/`

A very basic website, with nothing much on it. Raw JS/HTML/CSS hosting.

To run locally:

1. Open `index.html`

## Virtual Art Gallery V1

Root: `./gallery/v1/`

A 3D virtual art gallery created from raw ThreeJS calls and Typescript. Features a hand-made 3D scene. Due to its extensive use of 3D models, difficult libraries, and broken features, it was discontinued and revamped.

To run locally:

1. [Install NodeJS and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
2. Run `npm i` at the root of this project.
3. Run `npm run run` at the root of this project. This compiles TS→JS and locally hosts the built files.
4. Navigate to the printed address.
