scene/ — the 3D env aruound the website. no React in here.

config.ts        config file for variable change
createScene.ts   builds it, runs it, cleans it up
geometry/        logo.geo 
shaders/         env.ts = the room, logo.ts = the letters
motion/          camera.ts = where to stand, flight.ts = the move

how it draws:
one canvas. first a flat sheet painted by envAt().
then the letters on top, calling the same envAt().
same function twice = letter edges melt into the background
