export function createMovement(){return {speed:4,sprint:6.2,jump:6.5,airControl:0}}
export function cameraRelativeDirection(forward,right,input={}){const x=(forward.x||0)*((input.forward?1:0)-(input.back?1:0))+(right.x||0)*((input.left?1:0)-(input.right?1:0)),z=(forward.z||0)*((input.forward?1:0)-(input.back?1:0))+(right.z||0)*((input.left?1:0)-(input.right?1:0)),length=Math.hypot(x,z)||1;return{x:x/length,z:z/length,moving:Math.hypot(x,z)>0}}
export function facingYaw(direction){return Math.atan2(-direction.z,direction.x)}
