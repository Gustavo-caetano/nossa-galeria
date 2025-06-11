// Adapted from: https://www.shadertoy.com/view/MdlGRr

// It is required to set the float precision for fragment shaders in OpenGL ES
// More info here: https://stackoverflow.com/a/28540641/4908989
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uPointerDiff;

// This function returns 1 if `coord` correspond to a grid line, 0 otherwise
float isGridLine (vec2 coord) {
  vec2 pixelsPerGrid = vec2(50.0, 50.0);
  vec2 gridCoords = fract(coord / pixelsPerGrid);
  vec2 gridPixelCoords = gridCoords * pixelsPerGrid;
  vec2 gridLine = step(gridPixelCoords, vec2(1.0));
  float isGridLine = max(gridLine.x, gridLine.y);
  return isGridLine;
}

// Main function
void main () {
  gl_FragColor = vec4(1.0);
}