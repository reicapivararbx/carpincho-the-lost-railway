export function acceleration(train,slope=0){
  const locomotive=train.locomotive||train;
  const engine=(locomotive.damage?.engine??100)/100;
  const electrical=(locomotive.damage?.electrical??100)/100;
  const weight=Math.max(1,train.totalWeight||locomotive.weight||1);
  return Math.max(0,(locomotive.power*locomotive.traction*engine*electrical/weight)*18-slope*.9);
}
export function braking(train){
  const locomotive=train.locomotive||train;
  return .8+2.4*((locomotive.damage?.brakes??100)/100)*(locomotive.weight/(train.totalWeight||locomotive.weight));
}
export function consumption(train,slope=0){
  const locomotive=train.locomotive||train;
  const tankPenalty=1+(100-(locomotive.damage?.tank??100))*.008;
  return locomotive.baseConsumption*(1+(train.totalWeight-locomotive.weight)/5000+Math.max(0,slope)*.25)*tankPenalty;
}
export const accel=acceleration;
