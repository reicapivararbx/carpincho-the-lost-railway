export function harvest(node, toolTier, power=1, random=Math.random){
  return node.hit({tool:'axe',tier:toolTier,power,random});
}
