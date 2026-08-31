export const RAIL_CONTROL_POINTS=Object.freeze([
  {x:-80,z:10,elevation:0},{x:-48,z:10,elevation:0},{x:-18,z:7,elevation:1},
  {x:15,z:10,elevation:0},{x:42,z:16,elevation:2},{x:72,z:10,elevation:0},
  {x:110,z:5,elevation:4},{x:150,z:10,elevation:1},{x:195,z:6,elevation:0},
  {x:250,z:12,elevation:0},{x:310,z:8,elevation:2},{x:370,z:10,elevation:5},
  {x:435,z:4,elevation:0},{x:470,z:10,elevation:0},
]);

export function createRails(){
  return {
    points:RAIL_CONTROL_POINTS.map(point=>({...point})),
    junction:[{x:42,z:16},{x:56,z:25},{x:78,z:30}],
    broken:{x:14,z:10,visible:true},
    bridge:{x:48,z:18.8,length:14,angle:-.32},
    tunnel:{x:-42,z:9.5,radius:3},
  };
}
