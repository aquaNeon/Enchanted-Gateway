void main() 
{
    // this handles the alpha and the color of the fireflies 
    float distCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = (0.02 / distCenter) -0.04;
    gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
}