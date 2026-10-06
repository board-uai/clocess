scene/ — the 3D env aruound the website. no React in here.

config.ts        config file for variable change
createScene.ts   builds it, runs it, cleans it up
geometry/        decode.ts reads .geo, lattice.ts builds the scaffold
shaders/         env.ts = the room, logo.ts = the letters
motion/          camera.ts = where to stand, flight.ts = the move

how it draws:
one canvas. first a flat sheet painted by envAt().
then the letters on top, calling the same envAt().
same function twice = letter edges melt into the background
the lattice calls it too, so it sits in the same room.

the models:
logo.geo is the wordmark, decode.ts renormalises it to 1 unit wide.
the lattice is built at runtime rather than loaded — it is a regular
grid, so a generator is smaller than the mesh it would ship.
