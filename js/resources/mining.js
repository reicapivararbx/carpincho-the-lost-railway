export function mine(node, toolTier, power=1, random=Math.random){
  return node.hit({tool:'pick',tier:toolTier,power,random});
}
